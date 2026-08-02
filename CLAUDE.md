# Claude AI Assistant Instructions

Instructions for AI assistants working in this repository.

## Project

ATLANTIS Hand Tracking Kiosk — an unattended interactive installation. A USB
camera feeds MediaPipe hand tracking; landmark coordinates stream over a local
WebSocket into a fullscreen embedded browser rendering scenes the audience
controls with their hands. Single Python process, no build step, fully offline.

**Read [ARCHITECTURE.md](ARCHITECTURE.md) before making changes.** It is the
authoritative description of how the system works. [SCENES.md](SCENES.md) covers
the scene system, [DEPLOYMENT.md](DEPLOYMENT.md) covers boot and unattended
operation, [TROUBLESHOOTING.md](TROUBLESHOOTING.md) is symptom-first.

## Session startup

1. Read `ARCHITECTURE.md` to understand the current system.
2. Check `TASKS.md` and `todo.md` for priorities.
3. Don't start coding before you know what state the project is in.

## Task management

- Check `TASKS.md` before starting work.
- Mark tasks complete as soon as they are done.
- Add newly discovered work to `TASKS.md` rather than silently expanding scope.
- Break large tasks into actionable items.

## Hard constraints

These are non-negotiable and break the installation if violated.

1. **IT MUST OPERATE OFFLINE. This is the first principle of the project.**
   The deployment has no internet at all. Anything that reaches out hangs on
   DNS, then fails, and on site that looks like a frozen or broken scene.
   Every library, font, and image must be vendored locally and referenced
   relatively. No CDN links, no Google Fonts, no analytics, no social widgets.

   The browser enforces this at runtime: Flask attaches a same-origin-only
   Content-Security-Policy to every response (`CSP_DIRECTIVES` in
   `web_app.py`), so a scene physically cannot load off-box. Blocked attempts
   are logged to `/csp-report` and surfaced at `/api/csp-violations`.

   **Never assert offline-safety — check it:**
   ```bash
   ./deploy/check-offline.sh                                  # static scan
   curl -s localhost:5001/api/csp-violations | python3 -m json.tool   # runtime
   ```
   Run it after touching anything under `static/`. If a vendored bundle
   contains unavoidable remote URLs, neutralize its entry points and record
   the reason in `deploy/offline-allowlist.txt`. The allowlist is not for
   silencing the check.
2. **No build process.** Python plus static files. Nothing that requires
   compiling, bundling, or a package manager at runtime.
3. **Camera-only input.** No touch, keyboard, or mouse interaction for the
   audience.
4. **Unattended operation.** Every change must survive running for days without
   a human present. Fail soft, never block on a prompt.
5. **Performance.** Hand tracking must stay responsive — MediaPipe is configured
   at `model_complexity=0` deliberately. Don't add per-frame work to the
   tracking loop.
6. **8 GB of RAM, total.** The deployment box is a Mac mini 2023 (`Mac14,3`),
   Apple M2, **8 GB unified**, macOS Sequoia 15.0.1. macOS, Python/MediaPipe
   and WebKit's helper processes all share it; the idle floor is already
   ~356 MB. Under pressure macOS kills the webview's content process, which
   closes the window and exits the app with status 0 — no crash, no traceback.
   Treat memory as the scarcest resource: no new per-frame allocations, and
   prefer 2D canvas scenes to WebGL ones where the effect allows.
   See [ARCHITECTURE.md §8](ARCHITECTURE.md#8-hardware).

## Code guidelines

- Follow existing patterns; match surrounding style.
- Python classes should hold a single responsibility.
- Preserve the pipboy/terminal aesthetic in UI work.
- Prefer editing existing files to creating new ones.
- Document architectural changes in `ARCHITECTURE.md`.
- Test before marking a task complete.

## Where things actually are

| Concern | File |
|---|---|
| Process orchestration, CLI, webview | `main.py` |
| Camera, MediaPipe, IDs, confidence, gestures | `hand_tracker.py` |
| Flask routes, SocketIO | `web_app.py` |
| Event bus and event constants | `event_system.py` |
| **All** frontend logic — state, modes, scenes | `static/index.html` |
| Individual scenes | `static/scenes/<name>/index.html` |
| Idle and welcome screens | `static/scenes/idle.html`, `static/scenes/welcome.html` |
| Production launcher | `start-atlantis.sh` |

**Scene management is entirely frontend-side.** There is no `scene_manager.py`.
The relevant classes are `ModeManager` (line 881) and `SceneManager`
(line 1239) inside `static/index.html`.

## Commands

```bash
# Setup
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Development
python main.py --port 5000 --verbose

# Production — what the kiosk runs at boot
./start-atlantis.sh          # venv + --production + port 5001

# Health
curl http://localhost:5000/health

# Logs — rotating, capped at 5MB x 3
tail -f logs/atlantis.log
```

Boot / kiosk setup — everything is generated from the repo, nothing is
configured by hand:

```bash
./deploy/install-kiosk.sh --dry-run   # preview every change
./deploy/install-kiosk.sh             # install the LaunchAgent + power settings
./deploy/verify-kiosk.sh              # preflight; exit 0 = safe to leave
./deploy/uninstall-kiosk.sh           # remove
./deploy/kiosk-ctl.sh status          # works over SSH; also says which session
```

The window is always fullscreen and frameless. There is **no on-screen chrome
and no debug UI** — the display shows only the active scene. Manual override is
keyboard-only: **N**/**→** next scene, **P**/**←** previous.

**Logs** go to `logs/atlantis.log` (rotating, 5MB x 3 = 20MB cap) and to stdout,
which the LaunchAgent captures in `logs/kiosk.{out,err}.log`.

**Never hand-edit `~/Library/LaunchAgents/com.atlantis.kiosk.plist`** — it is
generated from `deploy/com.atlantis.kiosk.plist.in` and the next install
overwrites it. Change the template.

## Traps

Things that will waste your time if you don't know them.

- **Adding a scene requires editing the hardcoded iframe list** at
  `static/index.html:1446`. Miss it and the scene loads via `innerHTML`, which
  does not execute `<script>` tags — it renders as dead markup with no error.
  See [SCENES.md §4](SCENES.md#4-the-hardcoded-iframe-list).
- **There are two `loadScene` implementations** with divergent scene-id lists —
  `SceneManager.loadScene` (1428) for cycling scenes,
  `HandTrackingKiosk.loadScene` (2294) for idle/onboarding. Make sure you edit the right one.
- **`hand_moved` and `hand_detected` carry hand payloads; `frame_processed`
  does not** — it is a heartbeat with `hand_count` and `fps`. Do not put the
  landmark blob back on it. Anything on those paths runs 30–60×/second.
- **Hand IDs are reissued** whenever a frame detects zero hands. Never treat
  `hand_id` as durable.
- **The parent filters hands to `confidence.overall >= 0.7`** before scene
  handlers see them; scenes with their own WebSocket get unfiltered data.
- **An SSH session cannot run this app properly.** SSH is macOS's `Background`
  session; the console is `Aqua`. Anything launched from SSH gets no camera
  (TCC has nowhere to prompt, so OpenCV reports "not authorized, status 0")
  and no reliable window. Check with `launchctl managername`. Drive the
  LaunchAgent instead — `./deploy/kiosk-ctl.sh restart` — which runs in Aqua
  and needs no sudo. See [DEPLOYMENT.md §5b](DEPLOYMENT.md#5b-working-over-ssh).
- **Only ever run one instance.** Two copies fight over the port and camera.
  `start-atlantis.sh` refuses to start a second, via a pidfile and a port
  check.
- **This process runs for days.** Anything keyed by `hand_id` must be pruned to
  the live set every frame — IDs increase monotonically and are reissued after
  any frame with no detections. `_prune_gesture_state()` is the pattern.

## Key tuning constants

All in `static/index.html`:

| Constant | Value | Line |
|---|---|---|
| `idleTimeoutMs` | `45_000` | 795 |
| `idleHandConfidenceDetectionLevel` | `0.75` | 888 |
| `quickScene` / `defaultDuration` / `popularScene` | `30` / `45` / `60` | 1247–1249 |

In `hand_tracker.py`: `max_num_hands=4`, `min_detection_confidence=0.6`,
`min_tracking_confidence=0.2`, `model_complexity=0`, `max_tracking_distance=0.08`.

## Testing checklist

- [ ] Hand tracking responsive — check `fps` in `logs/atlantis.log`
- [ ] All enabled scenes load and respond to hands
- [ ] Idle timeout fires at 45 s; warning banner at 40 s
- [ ] Waking from idle works at a realistic standing distance
- [ ] No `https://` references in any new scene
- [ ] Fullscreen kiosk window still frameless
- [ ] `./start-atlantis.sh` works from a clean shell

## Notifications

If `apple-notifier-mcp` is available, send a notification when a task completes
or when user input is needed. If it isn't installed, don't block on it — mention
the install command once and move on:

```bash
claude mcp add notification -- npx -y @smithery/cli install apple-notifier-mcp --client claude
```
