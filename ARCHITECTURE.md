# ATLANTIS Hand Tracking Kiosk — Architecture

How the system is built and how it runs.

- [1. What it is](#1-what-it-is)
- [2. Process and thread model](#2-process-and-thread-model)
- [3. Python modules](#3-python-modules)
- [4. Hand tracking](#4-hand-tracking)
- [5. Event system](#5-event-system)
- [6. HTTP and WebSocket surface](#6-http-and-websocket-surface)
- [7. Frontend](#7-frontend)
- [8. Hardware](#8-hardware)
- [9. Known issues](#9-known-issues)

Related: [DEPLOYMENT.md](DEPLOYMENT.md) · [SCENES.md](SCENES.md) · [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

## 1. What it is

A single-process Python application driving an unattended interactive
installation. A USB camera watches for hands, MediaPipe converts them to
landmark coordinates, and those coordinates stream over a local WebSocket into a
fullscreen embedded browser rendering WebGL/Canvas scenes that the audience
controls by moving their hands.

No build step. No network access required. No database. Everything is served
from `localhost` off the filesystem, and every JS/CSS/font/image asset is
vendored into the repo so the installation runs fully offline.

~1,100 lines of Python plus a ~2,500-line frontend orchestrator
(`static/index.html`). There is no on-screen chrome: the display shows only
the active scene.

---

## 2. Process and thread model

One OS process, three threads, one embedded browser window.

```
                         main.py  (HandTrackingKiosk)
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
  [main thread]              [daemon thread]             [daemon thread]
   pywebview window           Flask-SocketIO              HandTracker
   fullscreen, frameless      (werkzeug)                  tracking loop
   loads localhost:PORT             │                           │
        │                           │                    cv2.VideoCapture(0)
        │                           │                           │
        │                           │                    cv2.flip  (mirror)
        │                           │                           │
        │                           │                    MediaPipe Hands
        │                           │                           │
        │                           │                    persistent-ID assign
        │                           │                    confidence scoring
        │                           │                    gesture detection
        │                           │                           │
        │                           └──────── EventBus ◄────────┘
        │                                    (locked, 1000-event ring)
        │                                        │
        └──────── WebSocket ◄────────────────────┘
                  (per-client subscriptions)
```

Both worker threads are daemons, so they die with the main thread. The main
thread is owned by `webview.start()`, which blocks until the window closes.

### Startup sequence

1. Install `SIGINT` / `SIGTERM` handlers.
2. `run_web_app(...)` builds the Flask app and starts `socketio.run()` on a
   daemon thread, bound to `localhost` only.
3. `time.sleep(2)` — fixed wait for the server.
4. `hand_tracker.start()` opens the camera and spawns the tracking thread.
5. `time.sleep(1)` — fixed wait for MediaPipe.
6. `webview.create_window(...)` then `webview.start()` blocks the main thread.
   With `--headless`, a `while` sleep loop takes its place.

Steps 3 and 5 are unconditional sleeps, not readiness checks.

### CLI flags

| Flag | Effect |
|---|---|
| `--port N` | Web server port. Default **5000**. |
| `--headless` | No webview window; server and tracker only. |
| `--production` | Exposed to the frontend via `/api/production-mode`. |
| `--verbose` | Debug-level logging. |

The window is always `fullscreen=True, frameless=True`. There is no non-kiosk
window mode and no on-screen chrome — see [Frontend](#7-frontend).

---

## 3. Python modules

| File | Lines | Role |
|---|---|---|
| `main.py` | 198 | Process orchestration, CLI, signals, logging, webview window |
| `hand_tracker.py` | 539 | Camera, MediaPipe, ID tracking, confidence, gestures |
| `web_app.py` | 249 | Flask routes, SocketIO, per-client event subscriptions, CSP |
| `event_system.py` | 101 | `Event`, `HandTrackingEvents`, `EventBus` |

Scene management is entirely frontend-side. There is no `scene_manager.py`.

---

## 4. Hand tracking

`hand_tracker.py` configures MediaPipe for speed over accuracy:

```python
mp.solutions.hands.Hands(
    max_num_hands=4,
    min_detection_confidence=0.6,
    min_tracking_confidence=0.2,
    model_complexity=0,          # fastest model
)
```

The loop reads a frame, mirrors it horizontally so on-screen motion matches the
viewer's motion, converts BGR→RGB, and runs inference. Capture resolution is
never set, so OpenCV uses the camera default. Camera index is hardcoded to `0`.

### Persistent hand IDs

MediaPipe's per-frame ordering is unstable, so `_assign_persistent_ids` does
greedy nearest-neighbour matching on palm centre between frames, with
`max_tracking_distance = 0.08` in normalised units. Matched hands keep their ID;
unmatched detections get a fresh monotonically increasing ID.

If **zero** hands are detected in a frame, all tracks are cleared — a momentary
dropout renumbers every hand.

### Confidence

`_calculate_confidence` returns a blended score, not a raw MediaPipe value. When
MediaPipe handedness confidence is available:

| Component | Weight | Meaning |
|---|---|---|
| `distance` | 0.45 | Apparent hand size — proxy for how close the person is |
| `mediapipe` | 0.35 | Handedness classification score |
| `presence` | 0.10 | Fraction of landmarks with in-range coordinates |
| `visibility` | 0.05 | Mean landmark visibility |
| `stability` | 0.05 | Inverse of inter-frame palm movement |

Bucketed as `high` > 0.85, `medium` > 0.7, else `low`. Distance dominating at
0.45 makes the kiosk favour people standing close to it, which is what gates
waking from idle.

### Gestures

Thumbs-up and thumbs-down only, via `_detect_thumbs_gesture`, comparing
fingertip Y against MCP joint Y. Requires ≥2 of 4 fingers curled and ≥0.05
normalised thumb separation, held ≥0.2 s before an event is emitted.

---

## 5. Event system

`EventBus` is synchronous in-process pub/sub with a `threading.Lock` and a
1,000-event history ring.

Event types (`HandTrackingEvents`):

```
hand_detected     hand_lost       hand_moved      gesture_detected
thumbs_up         thumbs_down     person_detected camera_error
frame_processed   system_ready
scene_changed     scene_transition_start   scene_transition_end
scene_interaction system_idle     system_active
```

Event payload shape:

```json
{
  "type": "hand_moved",
  "data": { "hands": [ /* ... */ ] },
  "timestamp": "2026-08-02T10:26:59.471431",
  "source": "hand_tracker"
}
```

Each hand carries `hand_id`, `landmarks` (21 × `{x, y, z}` normalised),
`palm_center`, `wrist`, `fingertips` (thumb/index/middle/ring/pinky), and
`confidence`.

Behaviours that matter for an always-on process:

- **Handlers run outside the lock.** `emit()` copies the subscriber list under
  the lock and dispatches after releasing it, so one slow WebSocket client
  cannot stall the tracking thread.
- **Handler exceptions are logged, not swallowed** — `logger.exception`, so a
  broken subscriber is visible instead of failing silently for the whole run.
- **History is a `deque(maxlen=1000)`** — self-trimming, no O(n) `pop(0)` on
  the per-frame path.

**Only `hand_moved` and `hand_detected` carry hand payloads.**
`frame_processed` is a heartbeat carrying `hand_count` and `fps` only. Sending
the full landmark blob on both doubled serialization on the server and object
allocation in the browser for no benefit.

---

## 6. HTTP and WebSocket surface

Bound to `localhost` only.

| Route | Method | Purpose |
|---|---|---|
| `/` | GET | Serves `static/index.html` |
| `/scenes/<path>` | GET | Scene files from `static/scenes/` |
| `/static/<path>` | GET | Static assets |
| `/health` | GET | `{"status", "timestamp", "csp_violations"}` |
| `/api/production-mode` | GET | Reflects the `--production` flag |
| `/csp-report` | POST | Browser posts blocked off-box loads here |
| `/api/csp-violations` | GET/DELETE | Inspect or reset blocked off-box loads |

### Offline enforcement

An `@app.after_request` hook attaches a same-origin-only
`Content-Security-Policy` to **every** response, scene iframes included, so the
browser refuses off-box loads outright rather than hanging on DNS. Directives
are in `CSP_DIRECTIVES` at the top of `web_app.py`.

`'unsafe-inline'` and `'unsafe-eval'` are allowed — scenes are self-contained
HTML with inline scripts, and some vendored libraries build functions
dynamically. Neither relaxes origin restrictions, which is the part that
matters here.

Violations are POSTed by the browser to `/csp-report`, kept in a 200-entry ring
buffer, printed to stderr, and surfaced via `/api/csp-violations` and the
`csp_violations` count on `/health`. That makes offline compliance verifiable
at runtime without disconnecting the machine.

WebSocket messages: `connect`, `disconnect`, `subscribe` (`{events: [...]}`),
`unsubscribe`, `get_recent_events`. Each client joins a room keyed by its socket
id and receives only the event types it subscribed to.

`SECRET_KEY` is the hardcoded string `'hand-tracking-secret'` and
`cors_allowed_origins="*"`. Both are acceptable only because the server is
`localhost`-bound on an offline machine.

---

## 7. Frontend

All frontend logic is inline in `static/index.html` across five classes:

| Class | Line | Responsibility |
|---|---|---|
| `ApplicationState` | 765 | Observable key/value store, `subscribe(key, fn)` |
| `ModeManager` | 881 | Four-mode state machine, idle timers, mode-owned scenes |
| `SceneManager` | 1239 | Interactive scene list, auto-cycling, countdown, loading |
| `HandTrackingKiosk` | 1734 | Socket wiring, bootstraps everything above |

### Modes

```
   ┌────────┐   hand seen, confidence > 0.75     ┌─────────────┐
   │  idle  │ ─────────────────────────────────► │ onboarding  │
   └────────┘                                    └─────────────┘
        ▲                                               │
        │                                    completeOnboarding()
        │  45 s with no qualifying hands                │
        │  (warning banner at 40 s)                     ▼
        │                                        ┌──────────┐
        └────────────────────────────────────────│  active  │
                                                 └──────────┘

   `transitioning` is transient and reachable from any of the above.
```

`idle` and `onboarding` are owned by `ModeManager` and map to `scenes/idle.html`
and `scenes/welcome.html`. Both have `duration: 0`, which means "never
auto-advance". `active` hands control to `SceneManager`, which cycles the
interactive scenes.

### Tuning constants

All in `static/index.html`:

| Constant | Value | Line | Meaning |
|---|---|---|---|
| `idleTimeoutMs` | `45_000` | 795 | Inactivity before returning to idle |
| idle warning | `idleTimeoutMs - 5000` | 1148 | Warning banner at 40 s |
| `idleHandConfidenceDetectionLevel` | `0.75` | 888 | Confidence needed to wake |
| `quickScene` | `30` | 1247 | Short scene duration (seconds) |
| `defaultDuration` | `45` | 1248 | Standard scene duration |
| `popularScene` | `60` | 1249 | Long scene duration |

Scene content and the loading contract are documented in [SCENES.md](SCENES.md).

---

## 8. Hardware

| | Requirement |
|---|---|
| Machine | Apple silicon Mac mini — deployment box is **Apple M2**, macOS 15.0.1 |
| Display | 1920 × 1080 |
| Camera | **External USB webcam, mandatory** |
| Python | 3.9.6 (`venv/`) |

### Camera

`cv2.VideoCapture(0)` — always index 0, not configurable by flag. Mac minis have
no built-in camera, so a USB webcam must be attached. Without one,
`HandTracker.start()` emits `camera_error` and returns: the web UI still comes
up and cycles scenes, but no hands are ever detected.

Camera access is granted per-binary under System Settings → Privacy & Security →
Camera, to whatever launches Python (Terminal, or the Python binary). Switching
interpreters — system Python to venv Python — requires a fresh grant.

### Display

Output is whatever the fullscreen webview covers on the primary display. No
projector-specific configuration (keystone, edge blending, resolution override)
exists in this codebase.

---

## 9. Known issues

Ordered by operational impact. Deployment-level risks are in
[DEPLOYMENT.md](DEPLOYMENT.md#8-failure-modes).

1. **The application has no internal supervision or logging of its own.**
   `main.py`, `hand_tracker.py`, and `web_app.py` swallow exceptions with bare
   `except: pass` or `sys.exit(1)` with no message, and `EventBus.emit`
   discards handler exceptions. Crash recovery and log capture come from the
   LaunchAgent installed by `deploy/install-kiosk.sh` — `KeepAlive` relaunches
   the process and `StandardOutPath`/`StandardErrorPath` capture stdout and
   stderr to `logs/`. Anything swallowed internally still never surfaces.
   See [DEPLOYMENT.md](DEPLOYMENT.md).

2. **`main.py` still defaults to port `5000`.** The deployed path is driven by
   `ATLANTIS_PORT` (default `5001`), which `start-atlantis.sh` and the
   LaunchAgent both use. Running `python main.py` bare gets a different port
   than the kiosk.

3. **`EventBus.emit` holds the lock while invoking handlers**, so one slow
   WebSocket handler stalls the tracking thread.

4. **No camera reconnect.** A failed read emits `camera_error`, sleeps 100 ms,
   and retries the same dead handle forever. Unplug/replug needs a restart.

5. **Two `loadScene` implementations** with divergent hardcoded scene-id lists —
   `SceneManager.loadScene` (line 1428) and
   `HandTrackingKiosk.loadScene` (line 2294). See [SCENES.md](SCENES.md#4-the-hardcoded-iframe-list) — this is
   the most common way a newly added scene silently fails.

6. **Duplicate scene id.** `kaleidoscope` appears twice in the scene array.
   Index-based cycling works; any id-based lookup resolves to the first entry.

7. **`HandTrackingKiosk.stop()` has an inverted guard.** `self.running` starts
   `False` and is never set `True` on start; `stop()` returns early *if*
   `running` is true, then sets it true. It works as an already-stopped latch,
   but the field name means the opposite of how it reads, and
   `run_headless()`'s `while not self.running` loop only works by coincidence.

9. **Dependencies are lower-bounded, not pinned.** `requirements.txt` uses
    `>=` throughout, so a fresh install will not reproduce the current
    environment.
