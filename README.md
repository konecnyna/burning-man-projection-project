# ATLANTIS Hand Tracking Kiosk

An unattended interactive installation. A camera watches for hands, MediaPipe
turns them into landmark coordinates, and a fullscreen browser renders WebGL and
Canvas scenes that the audience controls by moving their hands.

Runs as a single Python process on a Mac mini. No build step, no internet.

**Deployment machine:** Mac mini 2023 (`Mac14,3`), Apple M2, 8 GB, macOS
Sequoia 15.0.1, 1920×1080, plus a **required external USB webcam**. The 8 GB
is the binding constraint — see
[ARCHITECTURE.md](ARCHITECTURE.md#8-hardware).

```
camera ──► MediaPipe ──► EventBus ──► WebSocket ──► fullscreen webview
                                                     └── scene iframes
```

---

## Quick start

```bash
# One-time setup
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Development
python main.py --port 5000 --verbose

# Production — exactly what the kiosk runs at boot
./start-atlantis.sh          # venv + --production + port 5001
```

To make the machine boot into the app and stay in it:

```bash
./deploy/install-kiosk.sh --dry-run    # preview
./deploy/install-kiosk.sh              # install
./deploy/verify-kiosk.sh               # preflight check, exit 0 = safe to leave
```

Developing over SSH? Camera access needs the console session — see
[DEPLOYMENT.md §5b](DEPLOYMENT.md#5b-working-over-ssh):

```bash
./deploy/kiosk-ctl.sh console    # launch via Terminal.app, camera works
./deploy/kiosk-ctl.sh status     # session, launcher, health, camera
```

Then check it's alive:

```bash
curl http://localhost:5000/health
```

A **USB webcam is required** — Mac minis have no built-in camera. Without one
the UI still comes up and cycles scenes, but no hands are ever detected.

---

## Documentation

| Doc | What's in it |
|---|---|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Process/thread model, hand tracking, event system, HTTP surface, frontend state machine, hardware, known issues |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Boot chain, power-loss recovery, camera permissions, kiosk hardening, risks, pre-event checklist |
| [SCENES.md](SCENES.md) | Scene inventory, loading rules, hand-data contract, how to add a scene |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | Symptom-first fixes |
| [CLAUDE.md](CLAUDE.md) | Instructions for AI assistants working in this repo |
| [PRD.md](PRD.md) | Product requirements and success metrics |
| [planning.md](planning.md) | Original technical planning notes |
| [TASKS.md](TASKS.md) / [todo.md](todo.md) | Work tracking |

---

## Layout

```
main.py               Process orchestration, CLI, webview window
hand_tracker.py       Camera, MediaPipe, ID tracking, confidence, gestures
web_app.py            Flask routes + SocketIO
event_system.py       EventBus and event type constants
start-atlantis.sh     Production launcher — the one supported way to start it

deploy/
  install-kiosk.sh    Make this machine boot into the app (idempotent)
  verify-kiosk.sh     Preflight the whole boot chain
  uninstall-kiosk.sh  Remove the LaunchAgent
  *.plist.in          LaunchAgent template (edit this, not the installed copy)

static/
  index.html          The entire frontend — state, modes, scenes
  scenes/             One directory per scene, plus idle.html and welcome.html
  libs/               Vendored socket.io, three.js
  fonts/              Local @font-face fonts
```

---

## How it behaves

Four modes, driven by whether a confident hand is visible:

```
idle ──(hand, confidence > 0.75)──► onboarding ──► active ──(45s idle)──► idle
```

- **idle** — screensaver, waiting for hands
- **onboarding** — instructions
- **active** — cycles the interactive scenes on a timer (~4 min 15 s per loop)

Falls back to idle after **45 seconds** with no qualifying hand, with a warning
banner at 40 s.

Enabled scenes: kaleidoscope (30 s), fluid simulation (60 s), cosmic symbolism
(60 s), tie dye (45 s), kaleidoscope (60 s). Several more are written and
commented out — see [SCENES.md](SCENES.md#2-scene-inventory).

---

## Operations

```bash
# Is it running?
ps aux | grep '[m]ain.py'
lsof -iTCP -sTCP:LISTEN -P -n | grep Python

# Health
curl http://localhost:5001/health

# Logs (rotating, 5MB x 3)
tail -f logs/atlantis.log
```

Before leaving the installation unattended, run the
`./deploy/verify-kiosk.sh` — see
[DEPLOYMENT.md](DEPLOYMENT.md#9-before-you-leave-it-unattended).

---

## Constraints

- **It must operate offline. This is the first principle.** The installation
  has no internet — not slow internet, none. Every library, font, and image is
  vendored. Anything that reaches out hangs on DNS and then fails, which on
  site looks like a frozen scene. Enforced by `./deploy/check-offline.sh`,
  which also runs inside `verify-kiosk.sh`. See
  [the offline rule](SCENES.md#8-offline-rule).
- **No build process.** Python plus static files, nothing to compile.
- **Camera-only input.** No touch, no keyboard, no mouse for the audience.
- **Unattended.** It has to come back on its own after a power cut — see
  [DEPLOYMENT.md](DEPLOYMENT.md).
