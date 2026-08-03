# ATLANTIS Kiosk — Troubleshooting

Symptom-first. Each entry says how to confirm the cause before changing
anything.

Related: [ARCHITECTURE.md](ARCHITECTURE.md) · [DEPLOYMENT.md](DEPLOYMENT.md) · [SCENES.md](SCENES.md)

---

## First: is it even running?

```bash
ps aux | grep '[m]ain.py'                       # the process
lsof -iTCP -sTCP:LISTEN -P -n | grep Python     # which port it actually bound
curl http://localhost:5001/health               # use the port from above
```

The port varies by how it was launched: `main.py` defaults to **5000**,
`start-atlantis.sh` passes **5001**. Check what is actually bound before
concluding the app is down.

---

## Screen is black / nothing on the projector

**Is the LaunchAgent installed?** With it, a crash self-heals within 15 s.
Without it, nothing restarts the app and it stays dark.

```bash
./deploy/verify-kiosk.sh
```

If the agent is missing, install it:
```bash
./deploy/install-kiosk.sh
```

**The agent is installed but the app keeps dying.** `KeepAlive` will retry every
15 s forever, so a repeating failure looks like a flickering black screen. The
reason is in the logs:

```bash
tail -50 logs/kiosk.err.log
tail -50 logs/kiosk.out.log
```

Force a restart:
```bash
launchctl kickstart -k gui/$(id -u)/com.atlantis.kiosk
```

**The Mac went to sleep.**

```bash
pmset -g | grep -E '^ sleep|displaysleep'
```

Both should be `0`. If `sleep` is non-zero:
```bash
sudo pmset -a sleep 0
```

---

## "Python quit unexpectedly" / the app crashes outright

A hard crash is different from the app merely exiting. macOS writes a report:

```bash
ls -t ~/Library/Logs/DiagnosticReports/Python*.ips | head -1
```

Read the faulting thread and the termination signal:

```bash
python3 - "$(ls -t ~/Library/Logs/DiagnosticReports/Python*.ips | head -1)" <<'EOF'
import json, sys
raw = open(sys.argv[1]).read(); head, _, body = raw.partition('\n')
rep = json.loads(body); imgs = rep.get('usedImages', [])
print('exception  :', rep.get('exception'))
print('termination:', rep.get('termination'))
for t in rep.get('threads', []):
    if t.get('triggered'):
        for fr in t.get('frames', [])[:18]:
            n = imgs[fr['imageIndex']].get('name', '?') if fr.get('imageIndex', -1) >= 0 else '?'
            print(f"  {n:26s} {fr.get('symbol','')[:64]}")
        break
EOF
```

**`SIGABRT` with `PyObjCErr_ToObjCWithGILState` in the stack** means a Python
exception was raised inside a PyObjC delegate that AppKit or WebKit called.
PyObjC converts it to an Objective-C exception, which then unwinds into C++
frames that have no handler, so it hits `std::terminate` and aborts.

This is worth understanding as a class of failure: **any** exception in **any**
PyObjC delegate takes the whole process down. It is not recoverable in Python.

The known instance was pywebview 4.4.1 with pyobjc-core >= 10, crashing in
`webView_decidePolicyForNavigationAction_decisionHandler_` — it manipulated
`handler.__block_signature__`, which newer PyObjC does not support. Fixed by
pinning `pywebview==6.2.1`, which removed that code path.

If you see this again after changing dependencies, check the pin first:

```bash
venv/bin/pip freeze | grep -iE 'pywebview|pyobjc-core'
# expect pywebview==6.2.1
```

Rebuild from the lock file rather than resolving fresh:

```bash
venv/bin/pip install -r requirements.lock.txt
```

---

## Hands aren't detected at all

Work through in order.

**1. Is a camera attached?**

```bash
system_profiler SPCameraDataType
```

Empty output means macOS sees no camera. Mac minis have no built-in camera —
check the USB webcam is plugged in and try a different port.

**1a. Are you on SSH?** This is the single most common cause.

```bash
launchctl managername
#   Aqua       -> console session, camera can work
#   Background -> SSH session, camera CANNOT work
```

An SSH session runs in macOS's Background session. TCC-protected resources are
gated on the session, and a Background process has nowhere to draw a permission
prompt — so the request dies as `NotDetermined`, no matter how many times you
restart it, and regardless of what Terminal.app has been granted.

**To get a camera over SSH**, have Terminal.app on the console launch it. macOS
attributes camera access to the responsible process, and Terminal holds a
grant, so the python child inherits it:

```bash
./deploy/kiosk-ctl.sh console    # <- the one that gets you a camera
./deploy/kiosk-ctl.sh status     # says whether the camera actually opened
```

Terminal.app must already be running on the console (it is, if you are screen
sharing). `kiosk-ctl.sh start` uses the LaunchAgent instead — supervised and
survives logout, but **no camera**, because launchd is the responsible process.

Full explanation in [DEPLOYMENT.md §5b](DEPLOYMENT.md#5b-working-over-ssh).

**1b. Don't trust the OpenCV error message.**

```
OpenCV: not authorized to capture video (status 0), requesting...
OpenCV: camera failed to properly initialize!
```

This says "not authorized", but `status 0` is AVFoundation's
`AVAuthorizationStatusNotDetermined` — *never prompted*, which is not the same
as denied. OpenCV prints the same two lines whether the camera is missing,
unprompted, or actually denied. Tell them apart:

```bash
# Is there hardware at all? Empty output = no camera attached.
system_profiler SPCameraDataType
ioreg -l | grep -ciE '"IOClass" = "AppleCamera|USBVDC'      # 0 = none

# Is permission granted for the app that launches Python?
# auth_value: 0 = denied, 1 = unknown, 2 = allowed
sqlite3 ~/Library/Application\ Support/com.apple.TCC/TCC.db \
  "select client, auth_value from access where service='kTCCServiceCamera';"
```

- **No hardware** → plug in a USB webcam. Mac minis have none built in.
- **Hardware present, `auth_value` not 2** → grant it in System Settings.
- **Hardware present, granted, still `status 0`** → the process has no GUI
  session to prompt in. Launch it from Terminal or via the LaunchAgent rather
  than from a detached shell.

**2. Did the tracker fail to open it?**

The app emits a `camera_error` event and keeps running with no hand input:

```bash
grep -i camera logs/atlantis.log
```

The tracker logs a clear message when it cannot open the camera, and logs once
more if it later recovers.

**3. Camera permission.**

System Settings → Privacy & Security → Camera. The grant is **per binary** — it
follows the exact interpreter that launched the app. Running with a different
Python than usual invalidates it, and unattended the prompt never gets answered.

Confirm which interpreter is running:
```bash
ps aux | grep '[m]ain.py'
```

It should be the venv Python. If it is `/Library/Developer/CommandLineTools/...`
or `/usr/bin/python3`, the app was launched outside `start-atlantis.sh` and is
using a different — possibly unpermitted — binary.

**4. Camera opened but nothing registers.**

If `logs/atlantis.log` shows no camera error, MediaPipe is running but not
detecting. Usually lighting or distance: confidence weights `distance` at 0.45,
so hands far from the camera score low and get filtered out before the mode
manager sees them.

---

## It sees hands but won't leave the idle screen

Waking from idle requires `confidence.overall > 0.75`, and the parent frame
separately discards any hand below `0.7` before the mode manager ever sees it.

Confidence is not displayed on screen. If waking is unreliable, the person is
likely too far from the camera or the lighting is poor — move the camera closer
to where people stand.

To make it easier to trigger, lower `idleHandConfidenceDetectionLevel` at
`static/index.html:888`.

---

## It drops back to idle while someone is using it

The idle timeout is 45 s of no *qualifying* hand (`idleTimeoutMs`,
`static/index.html:795`), with a warning banner at 40 s. Intermittent detection
— hands at the edge of the confidence threshold — restarts nothing, so a person
who is technically present but poorly detected still times out.

Same fix as above: improve detection, or raise the timeout.

---

## Hand IDs keep changing / effects jump between hands

Expected behaviour. `_assign_persistent_ids` clears **every** track whenever a
frame detects zero hands, so a single dropped frame reissues all ids.

Scenes should not treat `hand_id` as durable. Match on position instead, or
tolerate renumbering. See [SCENES.md §6](SCENES.md#6-hand-data-shape).

---

## A scene is blank or frozen

**The scene is not in the iframe list.** This is the most common cause for a
newly added scene. Scenes whose `id` is missing from the list at
`static/index.html:1446` are injected with `innerHTML`, which does not execute
`<script>` tags. The scene renders as inert markup with no error.

Add the id to that list. Full explanation in
[SCENES.md §4](SCENES.md#4-the-hardcoded-iframe-list).

**The scene references a remote asset.** There is no internet on site.

```bash
grep -rnE 'https?://' static/scenes/<scene-name>/
```

**Scene JS threw.** Open the webview's console — run with `webview.start(debug=True)`
in `main.py`, or load `http://localhost:<port>` in Safari/Chrome instead,
where scene iframes and DevTools both work normally.

**Messages arrived before the iframe was ready.** `currentSceneIframe` is only
assigned after a fixed 1-second `setTimeout` following iframe creation. Anything
posted before that is silently dropped. Scenes that own their WebSocket
(mechanism A in [SCENES.md §5](SCENES.md#5-getting-hand-data-into-a-scene)) are
not affected.

---

## Kiosk didn't come back after a reboot or power cut

One command checks every link in the chain and prints the fix for whatever
failed:

```bash
./deploy/verify-kiosk.sh
```

Common causes:

- **FileVault is on.** It blocks auto-login entirely. Must be off.
- **Auto-login was reset** by a macOS update. Re-set it in System Settings —
  see [DEPLOYMENT.md §3](DEPLOYMENT.md#3-the-boot-chain).
- **The LaunchAgent isn't loaded.** Re-run `./deploy/install-kiosk.sh`.
- **`venv/` is missing.** `start-atlantis.sh` hard-exits if it isn't there —
  for example after re-cloning the repo without rebuilding it.
- **The repo moved.** The plist has the path baked in at install time. Re-run
  the installer from the new location.
- **A macOS update is waiting at a prompt** and blocks login.

---

## Port already in use

```bash
lsof -iTCP:5001 -sTCP:LISTEN -P -n
kill <PID>
```

Usually a second copy started by hand while the boot-launched one was already
running. Kill both and relaunch via `./start-atlantis.sh` so the state matches
what a reboot will produce.

---

## Dependencies won't import

```bash
source venv/bin/activate
python -c "import mediapipe, flask, cv2; print('ok')"
```

If that fails, rebuild:

```bash
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

`requirements.txt` uses `>=` for everything, so a rebuild may pull newer
versions than were tested. Rebuilding also creates a new interpreter binary,
which means **camera permission must be granted again**.

---

## Where are the logs

When started by the LaunchAgent:

```bash
tail -f logs/kiosk.out.log logs/kiosk.err.log
```

`logs/` is inside the repo and gitignored. If the app was started some other
way, output goes wherever that shell sent it — start it via
`./start-atlantis.sh` under the LaunchAgent to get logging.

The application itself writes no log file; everything comes from stdout/stderr
captured by the agent. Some failure paths are silent regardless:
`EventBus.emit` swallows every handler exception, and `main.py` exits via
`sys.exit(1)` with no message.

---

## Debug tools

| Tool | How |
|---|---|
| Application log | `tail -f logs/atlantis.log` (rotating, 5MB x 3) |
| Verbose logging | `python main.py --port 5000 --verbose` |
| Recent event history (last 1000) | WebSocket `get_recent_events` |
| Scene navigation | **N**/**→** next, **P**/**←** previous (keyboard only) |
| Blocked off-box loads | `curl -s localhost:5001/api/csp-violations \| python3 -m json.tool` |
| Open the UI in a real browser with DevTools | `http://localhost:<port>` in Safari or Chrome |
| Control the app over SSH | `./deploy/kiosk-ctl.sh status\|console\|start\|stop\|restart\|logs` |
| Camera working over SSH | `./deploy/kiosk-ctl.sh console` (needs Terminal.app open on the console) |
| Which session am I in? | `launchctl managername` — `Aqua` = console, `Background` = SSH |

There is no debug UI or video feed — that instrumentation was removed because
it cost frame-rate and never earned its keep. The log is the tool.

The on-screen HUD (scene announcement, current scene, next-scene countdown,
idle warning, toasts) is **audience-facing UI and is still there** — it is not
a debug surface.
