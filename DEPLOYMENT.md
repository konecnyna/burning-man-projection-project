# ATLANTIS Kiosk — Deployment & Unattended Operation

Making the machine boot into the app and stay in it.

- [1. Install](#1-install)
- [2. What the installer does](#2-what-the-installer-does)
- [3. The boot chain](#3-the-boot-chain)
- [4. The launcher](#4-the-launcher)
- [5. Everyday operations](#5-everyday-operations)
- [6. Camera permissions](#6-camera-permissions)
- [7. Kiosk hardening](#7-kiosk-hardening)
- [8. Failure modes](#8-failure-modes)
- [9. Before you leave it unattended](#9-before-you-leave-it-unattended)
- [10. Manual setup](#10-manual-setup)

Related: [ARCHITECTURE.md](ARCHITECTURE.md) · [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

## 1. Install

Everything boot-related is generated from files in this repo. There is nothing
to configure by hand and nothing to remember.

```bash
cd /path/to/burning-man-projection-project

# Once, if the venv doesn't exist yet
python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt

# See exactly what would change, without changing anything
./deploy/install-kiosk.sh --dry-run

# Do it
./deploy/install-kiosk.sh
```

The installer is **idempotent** — run it as often as you like. It prompts before
each system-level change and asks for `sudo` only for power management and for
removing a system-domain LaunchDaemon.

| Script | Purpose |
|---|---|
| `deploy/install-kiosk.sh` | Set the machine up. `--dry-run`, `--yes`, `--port N` |
| `deploy/verify-kiosk.sh` | Check every link in the chain. Exit 0 = safe to leave |
| `deploy/check-offline.sh` | Prove nothing served reaches the network |
| `deploy/uninstall-kiosk.sh` | Remove the LaunchAgent and stop the app |
| `deploy/com.atlantis.kiosk.plist.in` | LaunchAgent template — **edit this, never the installed copy** |
| `deploy/offline-allowlist.txt` | Vendored bundles with neutralized remote code, and why |

### Offline is the first principle

Enforced in two layers, so it is a property of the system rather than a
convention:

1. **The browser cannot load off-box.** Flask sends a same-origin-only
   `Content-Security-Policy` on every response, scene iframes included
   (`CSP_DIRECTIVES` in `web_app.py`). No DNS hang is possible — the request is
   never made. Blocked attempts are POSTed to `/csp-report`, kept in a ring
   buffer, and printed to stderr into `logs/kiosk.err.log`.
2. **Static scanning** catches remote references before they ship —
   `./deploy/check-offline.sh`.

Both run inside `./deploy/verify-kiosk.sh`.

#### Verifying offline behaviour without unplugging anything

Let the kiosk run until every scene has cycled — about 4 min 15 s — then:

```bash
curl -s localhost:5001/api/csp-violations | python3 -m json.tool
```

`count: 0` means nothing tried to reach the network across a full cycle. Any
entry names the blocked URL, the directive, and the source file and line.
`/health` carries the same count for a quick look.

#### Provision while you still have a network

`start-atlantis.sh` deliberately does **not** `pip install` at startup. Offline,
pip blocks on PyPI and retries for minutes, and under `KeepAlive` that becomes
a silent restart loop. The launcher fails immediately with an actionable
message instead.

```bash
# While online
source venv/bin/activate && pip install -r requirements.txt
./deploy/check-offline.sh
```

MediaPipe's hand models ship inside the package as local `.tflite` files, so
tracking needs no download. `deploy/check-offline.sh` verifies that too.

Then confirm the whole thing actually works:

```bash
sudo shutdown -r now
```

---

## 2. What the installer does

1. **Validates the repo** — template, launcher, `main.py`, `venv/`, and that
   `mediapipe`, `flask`, `cv2` import. Refuses to change anything if the repo
   isn't in a launchable state.

2. **Renders the LaunchAgent** from `deploy/com.atlantis.kiosk.plist.in`,
   substituting the repo path and port, writing to
   `~/Library/LaunchAgents/com.atlantis.kiosk.plist`, then `plutil -lint`s the
   result before loading it.

3. **Loads the agent** with `RunAtLoad` (start at login) and `KeepAlive`
   (restart whenever the process exits, for any reason).

4. **Removes conflicting autostart entries** — a Login Item pointing at
   `start-atlantis.sh` would start a second copy that fights for the port.

5. **Sets power management** so the machine never sleeps and powers back on
   after a cut. `[sudo]`

6. **Disables the screen saver.**

7. **Runs `verify-kiosk.sh`** and exits non-zero if anything is wrong.

Because the plist is generated, the repo path is baked in at install time —
move or rename the repo and just re-run the installer.

---

## 3. The boot chain

Three mechanisms in sequence. Remove any one and the kiosk does not come back
on its own.

```
  power applied
        │
        ▼
  [1] pmset autorestart = 1     ──►  Mac powers on by itself after power loss
        │
        ▼
  [2] auto-login                ──►  desktop session, no password prompt
        │                            (requires FileVault OFF)
        ▼
  [3] LaunchAgent com.atlantis.kiosk
        │  RunAtLoad   → starts at login
        │  KeepAlive   → restarts on every exit
        │  Throttle 15 → backs off if it fails repeatedly
        │
        └─► start-atlantis.sh ─► main.py --production --port 5001
                                        │
                                        ▼
                            fullscreen webview on localhost:5001
```

`KeepAlive` is the piece that makes this survivable. A Login Item runs its
target exactly once; if the app crashes or the window is closed, the
installation goes dark until a human intervenes. The LaunchAgent relaunches it.

### Auto-login is not scripted

It is the one step the installer cannot do for you — macOS has no supported
non-interactive way to set it.

System Settings → Users & Groups → **Automatically log in as** → `atlantis`.

FileVault must be **off**, or auto-login is ignored entirely.
`verify-kiosk.sh` checks both.

---

## 4. The launcher

`start-atlantis.sh` is the single supported way to start the app — used by the
LaunchAgent and by hand. Starting it any other way means what you're testing
isn't what comes back after a reboot.

```bash
./start-atlantis.sh                        # port 5001, production
ATLANTIS_PORT=5000 ./start-atlantis.sh     # override the port
ATLANTIS_BOOT_DELAY=0 ./start-atlantis.sh  # skip the 5s settle delay
```

It resolves its own directory, waits for the desktop to settle, hard-fails if
`venv/` is missing, `pip install`s if imports fail, logs each step with a
timestamp, and `exec`s Python so the LaunchAgent tracks Python's real PID and
`SIGTERM` reaches it on shutdown.

`ATLANTIS_PORT` is the single source of truth for the port. The LaunchAgent
passes it in; the default is `5001`.

Logs go to `logs/kiosk.out.log` and `logs/kiosk.err.log` inside the repo.
`logs/` is gitignored.

---

## 5. Everyday operations

```bash
# Status
launchctl print gui/$(id -u)/com.atlantis.kiosk

# Restart the app right now
launchctl kickstart -k gui/$(id -u)/com.atlantis.kiosk

# Stop it staying down (KeepAlive will restart it, so use the uninstaller
# if you actually want it to stay stopped)
./deploy/uninstall-kiosk.sh

# Live logs
tail -f logs/kiosk.out.log logs/kiosk.err.log

# Health
curl http://localhost:5001/health

# Full preflight
./deploy/verify-kiosk.sh
```

Because `KeepAlive` is on, `pkill main.py` will **not** stop the kiosk — the
agent restarts it within `ThrottleInterval` (15 s). That is deliberate. To stop
it for real, run the uninstaller or `launchctl bootout`.

---

## 6. Camera permissions

macOS grants camera access **per binary**, to whatever process launches Python.
The grant follows `venv/bin/python3`.

System Settings → Privacy & Security → Camera.

Rebuilding the venv creates a new interpreter binary, so **the grant must be
given again**. Unattended, that prompt never gets answered and the camera
silently fails — the kiosk boots and cycles scenes with no hand input.

A USB webcam is required; Mac minis have no built-in camera.

```bash
system_profiler SPCameraDataType     # empty output = no camera detected
```

---

## 7. Kiosk hardening

Optional, for a public installation.

```bash
# Hide desktop icons
defaults write com.apple.finder CreateDesktop false && killall Finder

# Auto-hide the Dock with no reveal
defaults write com.apple.dock autohide -bool true
defaults write com.apple.dock autohide-delay -float 1000
killall Dock
```

By hand: disable hot corners (Settings → Desktop & Dock), turn on Do Not
Disturb permanently, disable automatic software updates so an update prompt
can't block login.

The webview is frameless and fullscreen, so with the Dock hidden and
notifications off there is nothing for the audience to click out to.

---

## 8. Failure modes

| Event | Recovery | Automatic? |
|---|---|---|
| Power cut, then restored | `autorestart` → auto-login → LaunchAgent | ✅ |
| Clean reboot | Same chain | ✅ |
| App crashes | `KeepAlive` relaunches within 15 s | ✅ |
| Webview window closed | Process exits, `KeepAlive` relaunches | ✅ |
| Startup fails repeatedly | Throttled to one attempt per 15 s; logged | ⚠️ Needs a human, but logged |
| Camera unplugged mid-run | `camera_error` events, retries a dead handle | ❌ No reconnect — restart |
| Display sleep / screensaver | Disabled by the installer | ✅ N/A |
| Scene JS throws | That iframe breaks; the cycle timer still advances | ⚠️ Self-heals next scene |

Remaining gaps, both requiring code changes rather than configuration:

- **No camera reconnect.** `hand_tracker.py` retries the same dead handle
  forever after an unplug. Recovery is a restart:
  `launchctl kickstart -k gui/$(id -u)/com.atlantis.kiosk`
- **Silent internal failures.** `EventBus.emit` swallows every handler
  exception. The LaunchAgent captures stdout/stderr, but exceptions inside event
  handlers never reach it.

---

## 9. Before you leave it unattended

```bash
./deploy/verify-kiosk.sh
```

It checks, and tells you the fix for anything that fails:

| Group | Checks |
|---|---|
| Repo | launcher executable; venv imports `mediapipe`, `flask`, `cv2` |
| LaunchAgent | plist installed, points at this repo, `KeepAlive`, `RunAtLoad`, loaded |
| Conflicts | no Login Item duplicate, no stale artifacts, exactly one app process |
| Offline | nothing served reaches the network |
| Boot chain | auto-login set, FileVault off |
| Power | `autorestart=1`, `sleep=0`, `displaysleep=0`, `disksleep=0`, screen saver off |
| Runtime | camera detected, `/health` responding on the expected port |

Exit code 0 means safe to leave. Then do the thing no script can do for you:

```bash
sudo shutdown -r now
```

Confirm the kiosk returns to fullscreen with no keyboard or mouse interaction,
then wave at it and confirm it leaves the idle screen.

---

## 10. Manual setup

Only if you can't run the installer. This is what it automates.

```bash
REPO=/Users/atlantis/burning-man-projection-project

# 1. LaunchAgent
mkdir -p ~/Library/LaunchAgents "$REPO/logs"
sed -e "s|__ATLANTIS_DIR__|$REPO|g" -e "s|__ATLANTIS_PORT__|5001|g" \
    "$REPO/deploy/com.atlantis.kiosk.plist.in" \
    > ~/Library/LaunchAgents/com.atlantis.kiosk.plist
plutil -lint ~/Library/LaunchAgents/com.atlantis.kiosk.plist
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.atlantis.kiosk.plist

# 2. Power
sudo pmset -a autorestart 1 sleep 0 displaysleep 0 disksleep 0

# 3. Screen saver
defaults -currentHost write com.apple.screensaver idleTime -int 0

# 4. Remove any Login Item that also starts the app
osascript -e 'tell application "System Events" to delete login item "start-atlantis.sh"'
```

Then set auto-login by hand (§3) and verify with `./deploy/verify-kiosk.sh`.

**Do not hand-edit `~/Library/LaunchAgents/com.atlantis.kiosk.plist`.** It is
generated, and the next install overwrites it. Change
`deploy/com.atlantis.kiosk.plist.in` and re-run the installer.
