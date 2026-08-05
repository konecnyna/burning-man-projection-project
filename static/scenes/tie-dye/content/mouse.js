// Socket.IO removed for iframe compatibility

window.requestSmoothMouse = (function () {
//http://code.google.com/p/chromium/issues/detail?id=5598
// ios
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback,  element) {
      window.setTimeout(callback, 1000 / 60);
    };
})();



var Mouse = window.Mouse;

Mouse = {
  x: -1,
  y: -1,
  xA: [window.innerWidth / 2],
  yA: [window.innerHeight / 2],
  xDown: -1,
  xUp: -1,
  yDown: -1,
  yUp: -1,
  up: true,
  clicks: 0
};

/* ----------------------------------------------------------------- chains
   One trailing ribbon per pointer.

   The original kept exactly one, in module-level `pos` plus `Mouse.xA/yA`.
   The kiosk sees up to four hands at once (max_num_hands=4), so that state is
   now per-pointer and this file holds a list of them. Mouse.xA/yA stay
   aliased to the first chain, because canvas.js reads them.

   The mouse is just another pointer here -- dev convenience only, since the
   audience is camera-only. It is exempt from the staleness sweep below: a
   stationary mouse should keep drawing, a hand that stopped being reported
   should not.
   ------------------------------------------------------------------------ */
var CHAIN_LINKS = 64;
var MOUSE_CHAIN = 'mouse';
// A hand that has not been reported for this long has left. hand_lost carries
// no payload, so it cannot say which hand went -- expiry is what prunes them.
var CHAIN_STALE_MS = 250;

Mouse.chains = [];

// Walks the colour wheel rather than indexing into it by position in the list:
// after a prune, a new hand taking a departed hand's slot would otherwise be
// handed the same hue as the neighbour still drawing next to it.
var nextHueShift = 0;

function makeChain(id, x, y) {
  var c = {
    id: id,
    x: x,
    y: y,
    lastSeen: Date.now(),
    // Each pointer gets its own place on the colour wheel, so two people can
    // tell which ribbon is theirs.
    hueShift: nextHueShift,
    pos: [],
    xA: [],
    yA: []
  };
  nextHueShift = (nextHueShift + 70) % 360;
  // Preallocated and seeded at the pointer. This runs for days and the
  // smoothing loop writes every link every frame -- growing these lazily
  // would allocate on the animation path.
  for (var i = 0; i <= CHAIN_LINKS; i++) {
    c.pos[i] = [x, y];
    c.xA[i] = x;
    c.yA[i] = y;
  }
  return c;
}

function chainFor(id, x, y) {
  for (var i = 0; i < Mouse.chains.length; i++) {
    if (Mouse.chains[i].id === id) return Mouse.chains[i];
  }
  var c = makeChain(id, x, y);
  Mouse.chains.push(c);
  return c;
}

Mouse.events = {};
Mouse.events.move = function (e) {
  // ios
  if ("touches" in e) e = e.touches[0];
  if (e.pageX === Mouse.x && e.pageY === Mouse.y) { return; }
  Mouse.x = e.pageX;
  Mouse.y = e.pageY;
  var c = chainFor(MOUSE_CHAIN, Mouse.x, Mouse.y);
  c.x = Mouse.x;
  c.y = Mouse.y;
};

Mouse.path = [];
Mouse.path.x = [];
Mouse.path.y = [];
Mouse.path.capture = function (x, y) {
  Mouse.path.x.unshift([x]);
  Mouse.path.y.unshift([y]);
  while (Mouse.path.x.length > 32) {
    Mouse.path.x.pop();
    Mouse.path.y.pop();
  }
};
// Ease one link of a chain toward the link ahead of it. Both branches of the
// original's if/else were the same lerp, so this is that lerp.
function advanceLink(c, a, followSpeed, x, y) {
  var p = c.pos[a];
  p[0] += (x - p[0]) / followSpeed;
  p[1] += (y - p[1]) / followSpeed;
  c.xA[a] = Math.round(p[0]);
  c.yA[a] = Math.round(p[1]);
}

Mouse.events.up = function (e) {
  Mouse.down = false;
  Mouse.up = true;
  Mouse.xUp = Mouse.x;
  Mouse.yUp = Mouse.y;
};

Mouse.events.down = function (e) {
  if ("touches" in e) {
    e.preventDefault();
    e = e.touches[0];
  }
  Mouse.down = true;
  Mouse.up = false;
  Mouse.clicks += 1;
  Mouse.xDown = Mouse.x;
  Mouse.yDown = Mouse.y  
  Mouse.xUp = Mouse.x;
  Mouse.yUp = Mouse.y;
};

function smoothMouse() {
  var now = Date.now();

  // Drop chains for hands that stopped being reported. This is the prune that
  // keeps the list bounded across days of running -- hand ids are reissued
  // after any frame with no detections, so nothing here may assume an id is
  // durable. Filtering in place, since this is the animation path.
  var kept = 0;
  for (var n = 0; n < Mouse.chains.length; n++) {
    var chain = Mouse.chains[n];
    var fresh = chain.id === MOUSE_CHAIN || (now - chain.lastSeen) < CHAIN_STALE_MS;
    if (fresh) Mouse.chains[kept++] = chain;
  }
  Mouse.chains.length = kept;

  for (var m = 0; m < Mouse.chains.length; m++) {
    var c = Mouse.chains[m];
    if (c.x === -1 && c.y === -1) continue;
    advanceLink(c, 0, 2, c.x, c.y);
    for (var i = 1; i <= CHAIN_LINKS; i++) {
      advanceLink(c, i, 2, c.xA[i - 1], c.yA[i - 1]);
    }
  }

  // canvas.js reads Mouse.xA/yA and Mouse.path; keep them on the first chain.
  var head = Mouse.chains[0];
  if (head) {
    Mouse.xA = head.xA;
    Mouse.yA = head.yA;
    Mouse.path.capture(head.xA[0], head.yA[0]);
  }

  window.Mouse = Mouse;
  window.requestSmoothMouse(smoothMouse);
}
smoothMouse();

document.addEventListener("mousemove", Mouse.events.move);

document.addEventListener("touchmove", Mouse.events.move);
document.addEventListener("mousedown", Mouse.events.down);

document.addEventListener("touchstart", Mouse.events.down);
document.addEventListener("touchend", Mouse.events.up);
document.addEventListener("mouseup", Mouse.events.up);



// Handle hand detection data via postMessage from parent window
window.addEventListener('message', (event) => {
  if (event.data.type === 'handmove' && event.data.data) {
    try {
      const hands = event.data.data;
      const now = Date.now();

      // Every hand draws its own ribbon. Chains are looked up by hand id and
      // kept alive by this timestamp; smoothMouse expires the ones that stop
      // arriving. Nothing here holds an id across a gap, because ids are
      // reissued whenever a frame detects no hands.
      for (const hand of hands) {
        if (!hand.palm_center) continue;
        const posX = hand.palm_center.x * window.innerWidth;
        const posY = hand.palm_center.y * window.innerHeight;
        const c = chainFor('hand:' + hand.hand_id, posX, posY);
        c.x = posX;
        c.y = posY;
        c.lastSeen = now;
      }

      // canvas.js still reads these; point them at the first hand.
      if (Mouse.chains.length) {
        Mouse.x = Mouse.chains[0].x;
        Mouse.y = Mouse.chains[0].y;
      }
    } catch (e) {
      console.trace(e);
    }
  }
  // No 'handlost' branch: it carries no payload, so it cannot say which hand
  // went. Expiry in smoothMouse is what removes them, one at a time.
});