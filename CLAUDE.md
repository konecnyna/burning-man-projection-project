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
| **All** frontend logic — state, modes, scenes, HUD | `static/index.html` |
| Individual scenes | `static/scenes/<name>/index.html` |
| Idle and welcome screens | `static/scenes/idle.html`, `static/scenes/welcome.html` |
| Production launcher | `start-atlantis.sh` |

**Scene management is entirely frontend-side.** There is no `scene_manager.py`.
The relevant classes are `ModeManager` (line 1137) and `SceneManager`
(line 1501) inside `static/index.html`.

`hand_detector.py`, `hand_visualizer.py`, and `templates/index.html` are unused
— don't wire new work into them.

## Commands

```bash
# Setup
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Development — debug HUD visible
python main.py --port 5000

# Production — what the kiosk runs at boot
./start-atlantis.sh          # venv + --production + port 5001

# Health
curl http://localhost:5000/health

# See what the tracker sees
open http://localhost:5000/video_feed
```

Boot / kiosk setup — everything is generated from the repo, nothing is
configured by hand:

```bash
./deploy/install-kiosk.sh --dry-run   # preview every change
./deploy/install-kiosk.sh             # install the LaunchAgent + power settings
./deploy/verify-kiosk.sh              # preflight; exit 0 = safe to leave
./deploy/uninstall-kiosk.sh           # remove
```

`--kiosk` is parsed but never read. The window is always fullscreen and
frameless. Don't tell users to pass it.

**Logs** come from the LaunchAgent capturing stdout/stderr, at
`logs/kiosk.{out,err}.log`. The application writes no log file of its own.

**Never hand-edit `~/Library/LaunchAgents/com.atlantis.kiosk.plist`** — it is
generated from `deploy/com.atlantis.kiosk.plist.in` and the next install
overwrites it. Change the template.

## Traps

Things that will waste your time if you don't know them.

- **Adding a scene requires editing the hardcoded iframe list** at
  `static/index.html:1794`. Miss it and the scene loads via `innerHTML`, which
  does not execute `<script>` tags — it renders as dead markup with no error.
  See [SCENES.md §4](SCENES.md#4-the-hardcoded-iframe-list).
- **There are two `loadScene` implementations** with divergent scene-id lists —
  `SceneManager.loadScene` (1752) for cycling scenes, `HandTrackingKiosk.loadScene`
  (2718) for idle/onboarding. Make sure you edit the right one.
- **`EventBus.emit` swallows all handler exceptions** and holds its lock while
  calling handlers. A broken subscriber fails silently; a slow one stalls the
  tracking thread.
- **`hand_moved` and `frame_processed` fire every frame** with full landmark
  payloads for up to 4 hands. Anything you add to those paths runs 30–60×/second.
- **Hand IDs are reissued** whenever a frame detects zero hands. Never treat
  `hand_id` as durable.
- **The parent filters hands to `confidence.overall >= 0.7`** before scene
  handlers see them; scenes with their own WebSocket get unfiltered data.
- **`HandTrackingKiosk.stop()` has an inverted `self.running` guard.** It works,
  but reads backwards. Don't "fix" it without tracing `run_headless()`.

## Key tuning constants

All in `static/index.html`:

| Constant | Value | Line |
|---|---|---|
| `idleTimeoutMs` | `45_000` | 868 |
| `idleHandConfidenceDetectionLevel` | `0.75` | 1145 |
| `quickScene` / `defaultDuration` / `popularScene` | `30` / `45` / `60` | 1511–1513 |

In `hand_tracker.py`: `max_num_hands=4`, `min_detection_confidence=0.6`,
`min_tracking_confidence=0.2`, `model_complexity=0`, `max_tracking_distance=0.08`.

## Testing checklist

- [ ] Hand tracking responsive — check FPS on `/video_feed`
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
