# ATLANTIS Kiosk — Scene System

How scenes are loaded, how they receive hand data, and how to add one.

- [1. What a scene is](#1-what-a-scene-is)
- [2. Scene inventory](#2-scene-inventory)
- [3. How a scene gets loaded](#3-how-a-scene-gets-loaded)
- [4. The hardcoded iframe list](#4-the-hardcoded-iframe-list)
- [5. Getting hand data into a scene](#5-getting-hand-data-into-a-scene)
- [6. Hand data shape](#6-hand-data-shape)
- [7. Adding a new scene](#7-adding-a-new-scene)
- [8. Offline rule](#8-offline-rule)

Related: [ARCHITECTURE.md](ARCHITECTURE.md)

---

## 1. What a scene is

A self-contained HTML file under `static/scenes/<name>/index.html` that renders
something interactive and reacts to hand positions. Scenes are swapped in and
out of `#scene-container` in `static/index.html` and cycle on a timer while the
kiosk is in `active` mode.

Two scenes are special and owned by `ModeManager` rather than the cycle:

| Scene | File | Purpose |
|---|---|---|
| `idle` | `static/scenes/idle.html` | Screensaver — "show hands to begin" |
| `onboarding` | `static/scenes/welcome.html` | Instructions before the cycle starts |

Both are registered with `duration: 0`, which means "never auto-advance".

---

## 2. Scene inventory

**Enabled** in the `SceneManager.scenes` array (`static/index.html`, line 1516):

| Order | id | Duration | Directory |
|---|---|---|---|
| 1 | `kaleidoscope` | 30 s | `scenes/kaleidoscope/` |
| 2 | `fluidsim` | 60 s | `scenes/fluidsim/` |
| 3 | `cosmic_symbolism` | 60 s | `scenes/cosmic-symbolism/` |
| 4 | `tie_dye` | 45 s | `scenes/tie-dye/` |
| 5 | `kaleidoscope` | 60 s | `scenes/kaleidoscope/` |

Full cycle ≈ 4 min 15 s.

`kaleidoscope` appears twice with the same `id`. Cycling is index-based so both
entries play, but any lookup by id resolves to the first.

**Present on disk, commented out of the array:** `orbits`, `pong`
("Dong Pong"), `psychedelic-waves`, `wireframe-geometry`, `finger-paint`.

**Present on disk, never referenced:** `particle-love`.

Durations come from three constants on `SceneManager`: `quickScene = 30`,
`defaultDuration = 45`, `popularScene = 60`.

---

## 3. How a scene gets loaded

There are **two** `loadScene` implementations, on different code paths:

| Method | Line | Used by | Loads |
|---|---|---|---|
| `SceneManager.loadScene` | 1752 | The active-mode cycle | The interactive scenes |
| `HandTrackingKiosk.loadScene` | 2718 | `ModeManager` via `loadSceneCallback` | `idle`, `onboarding` |

Both do the same thing: check the scene's `id` against a hardcoded list. If the
id is in the list, the scene is injected as an **iframe**. If it is not, the file
is `fetch`ed and dropped into the container with `innerHTML`.

```js
if ([...].includes(scene.id)) {
  container.innerHTML = `<iframe id="scene-iframe" src="/${scene.html_file}" ...></iframe>`;
  setTimeout(() => { this.currentSceneIframe = iframe.contentWindow; }, 1000);
} else {
  const html = await (await fetch(`/${scene.html_file}`)).text();
  container.innerHTML = html;
}
```

After an iframe loads there is a fixed **1-second** `setTimeout` before
`currentSceneIframe` is set. Messages sent to the scene before that are dropped.

---

## 4. The hardcoded iframe list

This is the most common way a new scene silently fails.

`innerHTML` **does not execute `<script>` tags**. A scene that is not in the
iframe list gets injected as inert markup — it renders whatever static HTML it
has and no JavaScript ever runs. There is no error.

The two lists have diverged:

| List | Line | Contents |
|---|---|---|
| `SceneManager.loadScene` | 1794 | `fluidsim`, `cosmic_symbolism`, `psychedelic_waves`, `tie_dye`, `orbits`, `wireframe_geometry`, `pong`, `kaleidoscope`, `finger_paint`, `idle` |
| `HandTrackingKiosk.loadScene` | 2737 | `fluidsim`, `cosmic_symbolism`, `psychedelic_waves`, `tie_dye`, `orbits`, `finger_paint`, `idle`, `onboarding` |

Each list happens to cover what its own path needs today, so nothing is broken
right now. But adding a cycling scene means editing the list at **line 1794**,
and it is easy to edit the wrong one.

---

## 5. Getting hand data into a scene

Three mechanisms exist. Pick one.

### A. Own WebSocket (what `kaleidoscope` does — recommended)

The scene connects straight to the server and subscribes for itself. Simplest
and least coupled to the parent frame.

```html
<script src="/static/libs/socket.io.min.js"></script>
<script>
  const socket = io();

  socket.on('connect', () => {
    socket.emit('subscribe', {
      events: ['hand_moved', 'hand_detected', 'frame_processed']
    });
  });

  socket.on('event', (event) => {
    if (event.data.hands) handleHands(event.data.hands);
  });
</script>
```

Event `type` values are the raw names from `HandTrackingEvents` — `hand_moved`,
`hand_detected`, `hand_lost`, `frame_processed`, `thumbs_up`, `thumbs_down`.

### B. Generic parent `postMessage` (the fallback)

If a scene has no entry in `SceneManager.sceneHandlers`, `callSceneHandler`
derives a message type from the handler method name and posts it:

```js
const messageType = method.replace('on', '').toLowerCase();
// onHandMove     -> 'handmove'
// onHandDetected -> 'handdetected'
// onHandLost     -> 'handlost'
this.currentSceneIframe.postMessage({ type: messageType, data: args[0] }, '*');
```

Here `data` **is the hands array itself**, not `{hands: [...]}`.

```js
window.addEventListener('message', (e) => {
  if (e.data.type === 'handmove') handleHands(e.data.data);
});
```

### C. Explicit parent handler

Register an object on `SceneManager.sceneHandlers` (see `initializeSceneHandlers`,
line 1853) with any of `onInit`, `onHandDetected`, `onHandMove`, `onHandLost`,
`onThumbsUp`, `onThumbsDown`, `onCleanup`, `onDestroy`. `pong` and
`wireframe_geometry` use this to post a different shape:

```js
sceneManager.currentSceneIframe.postMessage({
  type: 'hand_move',
  data: { landmarks: hands }
}, '*');
```

**An explicit handler suppresses the generic fallback** — `callSceneHandler`
returns as soon as it finds one, so mechanism B never fires for that scene.

---

## 6. Hand data shape

Every mechanism ultimately carries the same per-hand object:

```json
{
  "hand_id": 0,
  "landmarks": [ { "x": 0.51, "y": 0.42, "z": -0.03 }, "... 21 total ..." ],
  "palm_center": { "x": 0.50, "y": 0.45, "z": -0.01 },
  "wrist":       { "x": 0.50, "y": 0.60, "z": 0.00 },
  "fingertips": {
    "thumb":  { "x": 0.44, "y": 0.40, "z": -0.02 },
    "index":  { "x": 0.52, "y": 0.30, "z": -0.04 },
    "middle": { "x": 0.55, "y": 0.29, "z": -0.04 },
    "ring":   { "x": 0.58, "y": 0.32, "z": -0.03 },
    "pinky":  { "x": 0.61, "y": 0.36, "z": -0.02 }
  },
  "confidence": {
    "overall": 0.87, "quality": "high",
    "distance": 0.9, "mediapipe": 0.98, "presence": 1.0,
    "visibility": 0.95, "stability": 0.88, "hand_size": 0.1342
  }
}
```

Notes for scene authors:

- **All coordinates are normalised 0–1**, origin top-left. Multiply by
  `window.innerWidth` / `window.innerHeight`.
- **The frame is already mirrored** by `cv2.flip` in the tracker, so `x`
  increases to the viewer's right. Do not flip again.
- **`landmarks` uses standard MediaPipe indices** — 0 wrist, 4 thumb tip,
  8 index tip, 12 middle tip, 16 ring tip, 20 pinky tip.
- **Up to 4 hands** (`max_num_hands=4`).
- **`hand_id` is stable while the hand is tracked**, but every id is reissued if
  a frame detects zero hands. Do not treat ids as durable across dropouts.
- **The parent pre-filters to `confidence.overall >= 0.7`** before scene
  handlers see anything (`processHandEvent`). Scenes using their own WebSocket
  (mechanism A) receive **unfiltered** hands and should filter themselves.

---

## 7. Adding a new scene

1. **Create the file**

   ```
   static/scenes/my-scene/index.html
   ```

   Self-contained: inline CSS/JS or local relative assets. See §8.

2. **Register it** in the `SceneManager.scenes` array (`static/index.html`,
   line 1516):

   ```js
   {
     id: 'my_scene',
     name: 'My Scene',
     description: 'What it does',
     duration: this.quickScene,          // 30 | 45 | 60
     html_file: 'scenes/my-scene/index.html',
     background_color: '#000000'
   },
   ```

   Use a unique `id`. Underscores in the id, hyphens in the directory, matching
   the existing convention.

3. **Add the id to the iframe list at line 1794.** Skipping this is the failure
   in §4 — the scene will load as dead markup with no error.

4. **Wire up hand data** using mechanism A from §5 unless you have a reason not
   to.

5. **Test it**

   ```bash
   source venv/bin/activate
   python main.py --port 5000
   ```

   Use the HUD's next/previous scene controls to jump straight to it. Open
   `http://localhost:5000/video_feed` in a second window to confirm the tracker
   is actually seeing hands.

### Enabling a commented-out scene

`orbits`, `pong`, `psychedelic_waves`, `wireframe_geometry`, and `finger_paint`
are already written and already in the line-1794 iframe list. Uncomment their
block in the scenes array and they work.

---

## 8. Offline rule

**The installation has no internet.** Every asset must be local and
relatively-referenced.

- No CDN `<script src="https://...">`, no Google Fonts, no remote images.
- Shared libraries live in `static/libs/` (`socket.io.min.js`, `three.min.js`).
- Fonts live in `static/fonts/` with local `@font-face` CSS.
- Scene-specific vendored libraries live inside the scene's own directory.

Check a new scene before committing:

```bash
grep -rnE 'https?://' static/scenes/my-scene/
```

Any hit that is not a comment, an XML namespace, or a DOCTYPE URL is a bug that
will surface as a broken scene on the playa and nowhere else.
