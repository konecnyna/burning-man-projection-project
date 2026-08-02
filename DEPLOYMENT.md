# ATLANTIS Kiosk — Deployment & Unattended Operation

Everything required to make the installation come up by itself and stay up.

- [1. The boot chain](#1-the-boot-chain)
- [2. Configuring the boot chain](#2-configuring-the-boot-chain)
- [3. What `start-atlantis.sh` does](#3-what-start-atlantissh-does)
- [4. Power management](#4-power-management)
- [5. Camera permissions](#5-camera-permissions)
- [6. Kiosk hardening](#6-kiosk-hardening)
- [7. Failure modes and recovery](#7-failure-modes-and-recovery)
- [8. Risks](#8-risks)
- [9. Pre-event checklist](#9-pre-event-checklist)

Related: [ARCHITECTURE.md](ARCHITECTURE.md) · [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

Install path on the deployment machine: `/Users/atlantis/burning-man-projection-project`
User account: `atlantis`

---

## 1. The boot chain

Three independent mechanisms must line up for the kiosk to come back on its own.

```
  power applied
        │
        ▼
  [1] pmset autorestart = 1      ──►  Mac powers on by itself after power loss
        │
        ▼
  [2] auto-login (autoLoginUser)  ──►  desktop session, no password prompt
        │
        ▼
  [3] Login Item: start-atlantis.sh
        │
        ├─ sleep 5                     let the desktop settle
        ├─ cd to script directory
        ├─ verify venv/ exists         hard-fails if missing
        ├─ source venv/bin/activate
        ├─ import-check mediapipe, flask, cv2  (pip install if missing)
        └─ python3 main.py --production --port 5001
                │
                ▼
        fullscreen webview on localhost:5001
```

Remove any one of the three and the installation does not come back unattended.

---

## 2. Configuring the boot chain

### Restart after power failure

```bash
sudo pmset -a autorestart 1
```

### Auto-login

System Settings → Users & Groups → unlock → **Automatically log in as** →
select the `atlantis` account.

Verify:
```bash
defaults read /Library/Preferences/com.apple.loginwindow autoLoginUser
# atlantis
```

Auto-login is incompatible with FileVault. FileVault must stay **off** for the
kiosk to boot unattended.

### Login Item

System Settings → General → Login Items → **+** → select
`/Users/atlantis/burning-man-projection-project/start-atlantis.sh`.

Verify:
```bash
osascript -e 'tell application "System Events" to get the name of every login item'
# start-atlantis.sh
```

Make sure the script is executable:
```bash
chmod +x /Users/atlantis/burning-man-projection-project/start-atlantis.sh
```

---

## 3. What `start-atlantis.sh` does

```bash
sleep 5                              # wait for the desktop
cd "$(dirname "${BASH_SOURCE[0]}")"  # resolve its own directory
[ -d venv ] || exit 1                # hard-fail if the venv is missing
source venv/bin/activate
python3 -c "import mediapipe, flask, cv2" || pip install -r requirements.txt
python3 main.py --production --port 5001
```

Because it resolves its own directory, the script can be moved with the repo
without editing. It launches on **port 5001** in **production mode** (debug UI
hidden).

It writes no log file. Nothing captures stdout or stderr.

---

## 4. Power management

The kiosk must never sleep or blank.

| Setting | Required | Command |
|---|---|---|
| Restart after power failure | `1` | `sudo pmset -a autorestart 1` |
| System sleep | `0` (never) | `sudo pmset -a sleep 0` |
| Display sleep | `0` (never) | `sudo pmset -a displaysleep 0` |
| Disk sleep | `0` | `sudo pmset -a disksleep 0` |
| Screen saver | off | System Settings → Lock Screen → Start Screen Saver: Never |

Check all at once:

```bash
pmset -g | grep -E 'autorestart|^ sleep|displaysleep|disksleep'
defaults -currentHost read com.apple.screensaver idleTime   # want 0
```

`caffeinate` is **not** a substitute. A `caffeinate -t N` assertion expires, and
one run from an interactive shell dies with that shell. Set `pmset sleep 0` so
the machine cannot sleep regardless of what is running.

---

## 5. Camera permissions

macOS grants camera access per-binary, to whatever process launches Python.
Because the Login Item runs the script under the user session, the grant follows
the interpreter in `venv/`.

Grant under System Settings → Privacy & Security → Camera.

Switching interpreters invalidates the grant — if the app is ever run with a
different Python than `venv/bin/python3`, macOS treats it as a new binary and
prompts again. Unattended, that prompt never gets answered and the camera
silently fails.

Confirm a camera is attached and visible to the OS:

```bash
system_profiler SPCameraDataType
```

Empty output means no camera is detected. The kiosk will still boot and cycle
scenes, but no hands will ever register.

---

## 6. Kiosk hardening

Optional but recommended for a public installation.

```bash
# Hide desktop icons
defaults write com.apple.finder CreateDesktop false && killall Finder

# Auto-hide the Dock with no reveal delay
defaults write com.apple.dock autohide -bool true
defaults write com.apple.dock autohide-delay -float 1000
killall Dock
```

By hand:
- Disable hot corners — System Settings → Desktop & Dock → Hot Corners
- Disable notifications / enable Do Not Disturb permanently
- Disable software update prompts
- Disable Spotlight keyboard shortcut if a keyboard will be reachable

The webview window is frameless and fullscreen, so with the Dock hidden and
notifications off there is nothing for the audience to click out to.

---

## 7. Failure modes and recovery

| Event | Recovery path | Automatic? |
|---|---|---|
| Power cut, then restored | `autorestart` → auto-login → Login Item | ✅ Yes |
| Clean reboot / `shutdown -r` | Same chain | ✅ Yes |
| Webview window closed | `create_window()`'s `finally` calls `stop()`, process exits | ❌ **Stays down** |
| Python process crashes | Nothing supervises it | ❌ **Stays down** |
| Camera unplugged mid-run | `camera_error` events; retries a dead handle forever | ⚠️ No reconnect |
| Display sleep / screensaver | Disabled by §4 | ✅ N/A |
| Scene JS throws | Scene iframe breaks; cycle timer still advances | ⚠️ Self-heals next scene |

A Login Item runs its target **exactly once** at login. There is no supervisor,
no `KeepAlive`, and no restart-on-exit anywhere in the system.

---

## 8. Risks

Ranked by likelihood × impact for an unattended run.

1. **A crash is unrecoverable without a human.** This is the single largest gap
   between how the kiosk is deployed and what unattended operation requires.
   The fix is to replace the Login Item with a `LaunchAgent` carrying
   `RunAtLoad` and `KeepAlive`, which relaunches the process whenever it exits:

   ```xml
   <!-- ~/Library/LaunchAgents/xyz.atlantis.kiosk.plist -->
   <?xml version="1.0" encoding="UTF-8"?>
   <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
     "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
   <plist version="1.0">
   <dict>
     <key>Label</key>            <string>xyz.atlantis.kiosk</string>
     <key>ProgramArguments</key>
     <array>
       <string>/Users/atlantis/burning-man-projection-project/start-atlantis.sh</string>
     </array>
     <key>RunAtLoad</key>        <true/>
     <key>KeepAlive</key>        <true/>
     <key>StandardOutPath</key>  <string>/Users/atlantis/atlantis.out.log</string>
     <key>StandardErrorPath</key><string>/Users/atlantis/atlantis.err.log</string>
   </dict>
   </plist>
   ```

   ```bash
   launchctl load ~/Library/LaunchAgents/xyz.atlantis.kiosk.plist
   ```

   Remove the Login Item first so the app does not start twice and fight over
   the port. This change also solves risk 2.

2. **No logs.** Nothing is written to disk, so a failure that happens overnight
   leaves nothing to diagnose. The `StandardOutPath` / `StandardErrorPath` keys
   above are the cheapest fix. Until then, redirect by hand:
   `./start-atlantis.sh >> ~/atlantis.log 2>&1`

3. **Sleep settings drift.** `pmset sleep` defaulting to a non-zero value will
   put the machine to sleep mid-event. Verify it is `0` before every run — see
   the checklist in §9.

4. **Manual launches diverge from the boot config.** Starting the app by hand
   with a different port or without `--production` means a reboot silently
   changes behaviour relative to what is running. Always launch via
   `./start-atlantis.sh`.

5. **An unrelated `pm2.atlantis.plist` sits in `~/Library/LaunchAgents/`.** It
   runs `pm2 resurrect` with `RunAtLoad` + `KeepAlive` and has nothing to do
   with this application. It is not currently loaded, but it will load on next
   login if anything enables it. Remove it:

   ```bash
   launchctl unload ~/Library/LaunchAgents/pm2.atlantis.plist 2>/dev/null
   rm ~/Library/LaunchAgents/pm2.atlantis.plist
   ```

6. **Unpinned dependencies.** `requirements.txt` is entirely `>=`. If the venv
   is ever rebuilt on site, a newer MediaPipe may behave differently. Pin with
   `pip freeze > requirements.lock.txt` before travelling.

---

## 9. Pre-event checklist

Run this before leaving the installation unattended.

```bash
cd /Users/atlantis/burning-man-projection-project

# 1. Boot chain
pmset -g | grep -E 'autorestart|^ sleep|displaysleep|disksleep'
defaults read /Library/Preferences/com.apple.loginwindow autoLoginUser
osascript -e 'tell application "System Events" to get the name of every login item'
ls -l start-atlantis.sh

# 2. Hardware
system_profiler SPCameraDataType | head

# 3. Dependencies resolve in the venv
source venv/bin/activate && python -c "import mediapipe, flask, cv2; print('ok')"

# 4. App comes up
./start-atlantis.sh &
sleep 15 && curl -s http://localhost:5001/health
```

Expected:

| Check | Expected |
|---|---|
| `autorestart` | `1` |
| `sleep` | `0` |
| `displaysleep` | `0` |
| `disksleep` | `0` |
| auto-login user | `atlantis` |
| login item | `start-atlantis.sh` |
| script mode | executable (`-rwxr-xr-x`) |
| camera | at least one device listed |
| imports | `ok` |
| `/health` | `{"status":"healthy",...}` |

### Full restart test

Nothing substitutes for this. Do it at least once on site:

```bash
sudo shutdown -r now
```

Confirm the kiosk returns to fullscreen with no keyboard or mouse interaction,
then wave a hand at it and confirm it leaves the idle screen.
