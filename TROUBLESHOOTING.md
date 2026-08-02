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

**The process died.** Nothing supervises it — a crash or a closed window leaves
the installation dark permanently.

```bash
ps aux | grep '[m]ain.py'    # no output = it exited
```

Restart:
```bash
cd /Users/atlantis/burning-man-projection-project
./start-atlantis.sh
```

To stop this recurring, install the `KeepAlive` LaunchAgent in
[DEPLOYMENT.md §8](DEPLOYMENT.md#8-risks).

**The Mac went to sleep.**

```bash
pmset -g | grep -E '^ sleep|displaysleep'
```

Both should be `0`. If `sleep` is non-zero:
```bash
sudo pmset -a sleep 0
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

**2. Did the tracker fail to open it?**

The app emits a `camera_error` event and keeps running with no hand input. There
is no log file, so check live:

```bash
curl http://localhost:5001/video_feed --output - | head -c 100
```

No frames means the capture never opened.

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

Open `http://localhost:<port>/video_feed`. If you see the feed with no landmark
overlay, MediaPipe is running but not detecting. Usually lighting or distance:
confidence weights `distance` at 0.45, so hands far from the camera score low and
get filtered out.

---

## It sees hands but won't leave the idle screen

Waking from idle requires `confidence.overall > 0.75`, and the parent frame
separately discards any hand below `0.7` before the mode manager ever sees it.

Watch the confidence figure in the debug HUD, or on the video feed. If it hovers
in the 0.6–0.75 range, the person is too far from the camera or the lighting is
poor. Move the camera closer to where people stand.

To make it easier to trigger, lower `idleHandConfidenceDetectionLevel` at
`static/index.html:1145`.

---

## It drops back to idle while someone is using it

The idle timeout is 45 s of no *qualifying* hand (`idleTimeoutMs`,
`static/index.html:868`), with a warning banner at 40 s. Intermittent detection
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
`static/index.html:1794` are injected with `innerHTML`, which does not execute
`<script>` tags. The scene renders as inert markup with no error.

Add the id to that list. Full explanation in
[SCENES.md §4](SCENES.md#4-the-hardcoded-iframe-list).

**The scene references a remote asset.** There is no internet on site.

```bash
grep -rnE 'https?://' static/scenes/<scene-name>/
```

**Scene JS threw.** Open the webview's console — run with `webview.start(debug=True)`
in `main.py:80`, or load `http://localhost:<port>` in Safari/Chrome instead,
where scene iframes and DevTools both work normally.

**Messages arrived before the iframe was ready.** `currentSceneIframe` is only
assigned after a fixed 1-second `setTimeout` following iframe creation. Anything
posted before that is silently dropped. Scenes that own their WebSocket
(mechanism A in [SCENES.md §5](SCENES.md#5-getting-hand-data-into-a-scene)) are
not affected.

---

## Kiosk didn't come back after a reboot or power cut

Check each link in the chain — see [DEPLOYMENT.md §1](DEPLOYMENT.md#1-the-boot-chain).

```bash
pmset -g | grep autorestart                                     # want 1
defaults read /Library/Preferences/com.apple.loginwindow autoLoginUser   # want atlantis
osascript -e 'tell application "System Events" to get the name of every login item'
ls -l start-atlantis.sh                                         # want executable
```

Common causes:

- **FileVault is on.** It blocks auto-login entirely. Must be off.
- **Login item was removed** by a macOS update or a Settings change.
- **`venv/` is missing.** `start-atlantis.sh` hard-exits if the directory is not
  there — for example after the repo is re-cloned without rebuilding it.
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

## There are no logs

Correct — nothing in the application writes a log file.

To capture output:

```bash
./start-atlantis.sh >> ~/atlantis.log 2>&1
```

Permanently, use the `StandardOutPath` / `StandardErrorPath` keys in the
LaunchAgent from [DEPLOYMENT.md §8](DEPLOYMENT.md#8-risks).

Be aware that several failure paths are silent regardless of redirection:
`EventBus.emit` swallows every handler exception, and `main.py` exits via
`sys.exit(1)` with no message.

---

## Debug tools

| Tool | How |
|---|---|
| Video feed with landmarks, bounding boxes, hand count, FPS | `http://localhost:<port>/video_feed` |
| Debug HUD | Run without `--production` |
| Toggle debug points / HUD at runtime | `debug_settings.json`, or `POST /api/debug-settings` |
| Recent event history (last 1000) | WebSocket `get_recent_events` |
| Scene navigation | HUD next/previous/auto-cycle controls |
| Open the UI in a real browser with DevTools | `http://localhost:<port>` in Safari or Chrome |
