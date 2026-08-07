# ATLANTIS Kiosk — Deployment & Unattended Operation

Making the machine boot into the app and stay in it.

- [1. Install](#1-install)
- [2. What the installer does](#2-what-the-installer-does)
- [3. The boot chain](#3-the-boot-chain)
- [4. The launcher](#4-the-launcher)
- [5. Everyday operations](#5-everyday-operations)
- [5b. Working over SSH](#5b-working-over-ssh)
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
| `deploy/kiosk-ctl.sh` | Start/stop/restart/status/logs — works over SSH |
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
source venv/bin/activate
pip install -r requirements.lock.txt    # exact known-good set
./deploy/check-offline.sh
```

`requirements.lock.txt` is the environment this has actually been verified
against. `requirements.txt` is the looser declaration; `pywebview` is pinned
there because a version mismatch crashes the process outright rather than
degrading — see [TROUBLESHOOTING.md](TROUBLESHOOTING.md).

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

## 5b. Working over SSH

Production is reboot-into-the-app. SSH is for development and debugging, and
there is one macOS rule that governs everything here.

### The rule

An SSH session runs in macOS's **Background** session. The console login runs
in **Aqua**:

```bash
launchctl managername
#   Aqua       -> console session
#   Background -> SSH session
```

Anything launched *directly* from SSH inherits Background and gets **no camera
and no reliable window**. macOS attributes camera access to the **responsible
process**; for a launchd- or SSH-spawned interpreter that is
`com.apple.python3`, which holds no TCC grant and declares no
`NSCameraUsageDescription`, so the request is denied **silently and never
prompts**. OpenCV reports:

```
OpenCV: not authorized to capture video (status 0), requesting...
```

`status 0` is `NotDetermined` — never asked — not "denied". Granting camera
access to Terminal.app in System Settings does not help a launchd-spawned
process; that grant belongs to Terminal, not to python.

### The three launch paths

| Path | Camera | Survives logout / restarts on crash | Use for |
|---|---|---|---|
| `kiosk-ctl.sh start` (LaunchAgent) | ✅ **yes** | ✅ yes | **boot / unattended** |
| `kiosk-ctl.sh console` | ✅ yes, borrowed | ❌ no | development over SSH |
| `kiosk-ctl.sh headless` | ❌ no | ❌ no | server-side testing |

The LaunchAgent camera is the real one: it belongs to the app bundle and
survives reboots. `console` **borrows** Terminal.app's grant for one run —
useful for debugging, but it proves nothing about whether boot will work.

None of them need sudo.

### Getting a camera over SSH — `console`

```bash
./deploy/kiosk-ctl.sh console
```

This asks **Terminal.app on the console** to run the launcher, over Apple
Events. Terminal holds a camera grant (`kTCCServiceCamera`, `auth_value=2`),
and because macOS attributes access to the responsible process, the python
child **inherits it and the camera works**.

Verified from an SSH session: 150 `frame_processed` events in 5 s at 30 fps,
with the camera open.

**Requirement: Terminal.app must already be running on the console.** It is if
you are screen sharing. If it is not, Apple Events has to launch a GUI app from
a background session, which *hangs* — `console` checks for this and tells you
rather than hanging.

Screen Sharing plus SSH is a good combination: screen share to keep Terminal
alive and to see the output, SSH for everything else.

### The supervision path — `start` / `restart`

```bash
./deploy/kiosk-ctl.sh start      # bootstrap the agent into gui/<uid>
./deploy/kiosk-ctl.sh restart    # kickstart in place
./deploy/kiosk-ctl.sh stop
```

The LaunchAgent lives in `gui/<uid>`, which *is* the Aqua session, so this
works over SSH with no sudo — you are targeting your own GUI domain. Verified:
an agent bootstrapped from SSH reports `managername=Aqua`.

It gets you `RunAtLoad` + `KeepAlive` **and** the camera, because it launches
through the app bundle rather than spawning python directly — see
[Camera permissions](#6-camera-permissions). Underneath:

```bash
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.atlantis.kiosk.plist
launchctl kickstart -k gui/$(id -u)/com.atlantis.kiosk
launchctl bootout   gui/$(id -u)/com.atlantis.kiosk
```

### Knowing which you have

```bash
./deploy/kiosk-ctl.sh status
```

It reports the shell's session, whether the agent is loaded, **who launched the
running process**, health, and — the part that matters — whether the camera
actually opened on the current run. That last check reads the log rather than
inferring from the session, so it is ground truth:

```
Camera
  ✓ hardware present: UVC Camera VendorID_3141 ProductID_25447
  ✓ camera opened on the current run — hand tracking is live
```

### Reaching it from another machine

The server binds `0.0.0.0` by default, so it is reachable by IP:

```bash
ipconfig getifaddr en0          # e.g. 10.0.0.171
# then, from your laptop:
http://10.0.0.171:5001/
http://10.0.0.171:5001/scenes/welcome.html          # a scene on its own
```

The `Content-Security-Policy` names the serving host in `connect-src`, so
socket.io works whether you arrive by `localhost` or by IP — some browsers
treat `ws:`/`wss:` as distinct from `'self'`, so the origin has to be named.
It is still same-origin-only; only the host you connected to is allowed.

**There is no authentication.** Anything that can route to the port can drive
the kiosk and read `/api/*`. That is harmless at the installation, which has no
network at all, and convenient on a workbench LAN. If you want it local-only:

```bash
ATLANTIS_HOST=localhost ./start-atlantis.sh     # or --host localhost
```

The app logs a warning at startup whenever it is bound non-locally, so the log
always records which it was.

### Server-side testing without a window

```bash
./deploy/kiosk-ctl.sh headless
```

Runs in the SSH session on purpose. No window, no camera — for exercising
routes, the offline check and event plumbing. Hand tracking will not work and
that is expected.

### Camera at boot — solved

This used to be the standing limitation: the LaunchAgent path had no camera, so
a machine that booted straight into the app never saw hands. It is fixed. The
machine now boots into a working camera with nobody present.

What was wrong with the earlier attempt is worth keeping, because the diagnosis
was right and the conclusion was wrong. `deploy/ATLANTIS-Kiosk.app` did declare
`NSCameraUsageDescription` and was ad-hoc signed, but its `CFBundleExecutable`
was a **shell script**, so:

- LaunchServices refuses to launch such a bundle at all — `open` fails with
  `-10669`, at any path, `/Applications` included. No LaunchServices launch
  means no app identity, so TCC had nothing to attach a grant to and never
  created an entry.
- It ended in `exec`, which replaces the process image. Even had it launched,
  the bundle identity would have been discarded at that instant.

The conclusion drawn at the time — "a real bundle identity needs a compiled
executable, which means a build step" — is half right. It does need a compiled
executable. It does **not** need a build step, because `osacompile` ships with
macOS and emits an AppleScript applet whose executable is Apple's own signed
applet stub. `deploy/build-app-bundle.sh` generates exactly that at install
time; nothing is compiled and no toolchain is required.

The applet runs `start-atlantis.sh` and **waits**, so python is its child and
inherits the app's TCC identity — the same shape that makes a Terminal launch
work, minus the Terminal.

**PPPC configuration profile** remains unavailable: Apple excludes Camera and
Microphone from profile-based pre-authorization. The one-time click in
[§6](#6-camera-permissions) is unavoidable.


---

## 6. Camera permissions

A USB webcam is required; Mac minis have no built-in camera.

```bash
system_profiler SPCameraDataType     # empty output = no camera detected
```

### How the grant actually works

macOS attributes camera access to the **responsible process**, not to the
binary that calls `VideoCapture`. That distinction is the whole problem:

- Launched from Terminal or iTerm, the responsible process is *the terminal*.
  It holds the grant, python inherits it, the camera works — and the grant is
  gone at the next boot, because no terminal is involved then. This is why the
  camera could look fine all afternoon and be dead the next morning.
- Launched by launchd, the responsible process is `com.apple.python3`. It
  holds no grant, and Apple's `Python.app` declares no
  `NSCameraUsageDescription`, so macOS denies **silently and never prompts**.

The grant therefore has to belong to something of ours. That something is
`deploy/ATLANTIS-Kiosk.app`, launched by the LaunchAgent through
`/usr/bin/open`. It is an `osacompile` applet — a real Mach-O, which is what
LaunchServices requires before it will confer an app identity — and it runs
`start-atlantis.sh` as a **child**, so python inherits the app's identity.

### Granting it, once

The grant needs one human click and cannot be done unattended. On the console
(screen sharing counts):

```bash
./deploy/grant-camera.sh
```

It stops the kiosk, relaunches the bundle **from Finder**, and waits for the
camera to open. Finder matters: launching with `open` from a terminal that
already holds a camera grant will appear to work and will teach TCC nothing,
because the terminal stands in as the responsible process.

Afterwards the grant persists across reboots and launchd launches, and the
kiosk opens the camera on the first attempt. Confirm with:

```bash
./deploy/kiosk-ctl.sh status     # "camera opened on the current run"
./deploy/verify-kiosk.sh         # also checks the bundle and the launch chain
```

### What voids the grant

The bundle is **ad-hoc signed**, so TCC has no team identifier to anchor to and
pins the grant to the **cdhash**. Anything that changes the bundle changes the
cdhash and silently voids the grant — the kiosk comes back camera-blind with no
error beyond `status 0` again.

`deploy/build-app-bundle.sh` is therefore idempotent: it keeps an existing
valid bundle and only builds when one is missing. `install-kiosk.sh` can be
re-run freely. If you deliberately rebuild:

```bash
./deploy/build-app-bundle.sh --force
./deploy/grant-camera.sh          # required afterwards
```

Rebuilding the **venv** no longer matters — the grant follows the bundle, not
`venv/bin/python3`.

### If it still will not open

The tracker no longer gives up. A camera missing at startup leaves it running
blind, retrying every 5 s, and it recovers on its own the moment the camera
appears — so a slow USB enumeration or a late grant fixes itself. If it stays
blind, check that ATLANTIS is listed and enabled in System Settings → Privacy
& Security → Camera, then re-run `grant-camera.sh`.

> **Do not rename the bundle back to `ATLANTIS.app`.** LaunchServices holds a
> permanently poisoned record for that path on the deployment box, left from
> when the bundle was script-based, and refuses it with `-10669` forever —
> `lsregister -u`, `-f`, and a full `-kill -r` rebuild all fail to clear it,
> while an identical copy under any other name launches. The name is
> load-bearing.

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
