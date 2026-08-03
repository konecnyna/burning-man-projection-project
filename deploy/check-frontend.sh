#!/bin/bash
#
# ATLANTIS Kiosk — frontend sanity check.
#
# WHY THIS EXISTS
#
# `node --check` validates syntax and nothing else. A file can parse perfectly
# while missing an entire class, and the failure mode is silent: the constructor
# call throws a ReferenceError, no JavaScript after it runs, and the projection
# is simply black. Nothing in the Python logs mentions it, /health still answers
# 200, and every scene still serves.
#
# That happened -- a bulk edit removed a class declaration along with the code
# it was aiming at, and it took a while to find because everything downstream
# looked healthy. These checks would have caught it immediately.
#
#   ./deploy/check-frontend.sh
#
# Exit 0 = clean, 1 = something is dangling.
#
set -uo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RED=$'\033[0;31m'; GRN=$'\033[0;32m'; YEL=$'\033[0;33m'; BLU=$'\033[0;34m'; OFF=$'\033[0m'

cd "$REPO_DIR" || exit 1
echo "ATLANTIS frontend check"

python3 - <<'PY'
import re, sys, os, glob

RED = '\033[0;31m'; GRN = '\033[0;32m'; YEL = '\033[0;33m'; BLU = '\033[0;34m'; OFF = '\033[0m'
fails = 0

def sect(t): print(f"\n{BLU}{t}{OFF}")
def ok(m):  print(f"  {GRN}PASS{OFF}  {m}")
def bad(m, d=None):
    global fails
    fails += 1
    print(f"  {RED}FAIL{OFF}  {m}")
    if d: print(f"        {d}")

BUILTIN = {
    'Map','Set','WeakMap','WeakSet','Date','Image','Error','TypeError','RangeError',
    'Audio','WebSocket','Worker','Blob','URL','URLSearchParams','Promise','Array',
    'Object','Function','RegExp','Event','CustomEvent','MutationObserver',
    'IntersectionObserver','ResizeObserver','AbortController','TextDecoder',
    'TextEncoder','FileReader','Float32Array','Float64Array','Uint8Array',
    'Uint8ClampedArray','Uint16Array','Uint32Array','Int8Array','Int16Array',
    'Int32Array','ArrayBuffer','DataView','Path2D','OffscreenCanvas',
    'AudioContext','Notification','Proxy','Intl','WheelEvent','MouseEvent',
    'KeyboardEvent','PointerEvent','TouchEvent','DragEvent','InputEvent',
    # three.js and other vendored globals live on THREE.* so are not bare
}

def scripts_of(path):
    s = open(path, encoding='utf-8', errors='replace').read()
    return s, re.findall(r'<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>', s, re.S)

# ---------------------------------------------------------------- classes
sect("Class references")
for path in ['static/index.html'] + sorted(glob.glob('static/scenes/**/*.html', recursive=True)):
    s, blocks = scripts_of(path)
    js = "\n".join(blocks)
    if not js.strip():
        continue
    defined = set(re.findall(r'^\s*class (\w+)', js, re.M))
    # also count classes defined in vendored files this page pulls in
    for m in re.finditer(r'<script[^>]*\bsrc="([^"]+)"', s):
        src = m.group(1)
        local = None
        if src.startswith('/static/'):
            local = src[1:]
        elif src.startswith('/'):
            local = 'static' + src
        elif not src.startswith(('http:', 'https:', '//')):
            local = os.path.join(os.path.dirname(path), src)
        if local and os.path.exists(local):
            try:
                defined |= set(re.findall(r'^\s*class (\w+)', open(local, encoding='utf-8', errors='replace').read(), re.M))
            except OSError:
                pass
    used = set(re.findall(r'\bnew ([A-Z]\w+)\s*\(', js))
    # THREE.Foo / lib.Foo are namespaced, not bare identifiers
    used -= set(re.findall(r'\bnew (?:\w+)\.([A-Z]\w+)\s*\(', js))
    # ES-module imports bring names in without a `class` declaration here
    for im in re.finditer(r'import\s*\{([^}]*)\}\s*from', js):
        defined |= {n.strip().split(' as ')[-1].strip() for n in im.group(1).split(',') if n.strip()}
    for im in re.finditer(r'import\s+\*\s+as\s+(\w+)\s+from', js):
        defined.add(im.group(1))
    missing = used - defined - BUILTIN
    if missing:
        bad(f"{path}: constructs undefined class(es): {', '.join(sorted(missing))}",
            "a ReferenceError here stops all following JS and renders a black screen")
    else:
        ok(f"{path}: {len(used - BUILTIN)} class reference(s) resolve")

# ------------------------------------------------------- methods on `this`
sect("Method references within classes")
s, blocks = scripts_of('static/index.html')
js = "\n".join(blocks)
# crude but effective: split on class declarations, then compare this.foo(...)
# calls against method definitions in the same class body
parts = re.split(r'\n(?=    class \w+ \{)', js)
for part in parts:
    m = re.match(r'\s*class (\w+)', part)
    if not m:
        continue
    cls = m.group(1)
    defined = set(re.findall(r'^      (?:async )?(\w+)\s*\([^)]*\)\s*\{', part, re.M))
    called = set(re.findall(r'this\.(\w+)\s*\(', part))
    # fields holding functions, and anything inherited from the DOM, are fine
    missing = {c for c in called - defined
               if not re.search(r'this\.' + c + r'\s*=', part)}
    if missing:
        bad(f"class {cls}: calls this.X() with no definition: {', '.join(sorted(missing))}")
    else:
        ok(f"class {cls}: {len(called)} self-call(s) resolve")

# ------------------------------------------------------------------ DOM ids
sect("DOM references in static/index.html")
s, blocks = scripts_of('static/index.html')
js = "\n".join(blocks)
present = set(re.findall(r'\bid="([^"]+)"', s))
used = set(re.findall(r"getElementById\(['\"]([^'\"]+)['\"]\)", js))
# ids that live inside scene iframes are legitimately unreachable from here
iframe_ids = set()
for f in glob.glob('static/scenes/**/*.html', recursive=True):
    iframe_ids |= set(re.findall(r'\bid="([^"]+)"',
                      open(f, encoding='utf-8', errors='replace').read()))
missing = used - present
unreachable = missing & iframe_ids
truly = missing - iframe_ids
if truly:
    bad(f"getElementById for ids that exist nowhere: {', '.join(sorted(truly))}")
else:
    ok(f"{len(used)} getElementById target(s), none unknown")
if unreachable:
    print(f"  {YEL}NOTE{OFF}  reaches for ids that only exist inside scene iframes "
          f"(always null from the parent): {', '.join(sorted(unreachable))}")

# ------------------------------------------------------------ scene wiring
sect("Scene registration")
s = open('static/index.html', encoding='utf-8').read()
arr = re.search(r'this\.scenes = \[(.*?)\n        \];', s, re.S)
if not arr:
    bad("could not locate the SceneManager.scenes array")
else:
    body = arr.group(1)
    entries = []
    for m in re.finditer(r"^\s*(?!//)\s*\{[^}]*?id: '([^']+)'[^}]*?html_file: '([^']+)'", body, re.S | re.M):
        entries.append((m.group(1), m.group(2)))
    iframe_lists = re.findall(r"\[([^\]]*)\]\.includes\(scene\.id\)", s)
    allowed = set()
    for l in iframe_lists:
        allowed |= set(re.findall(r"'([a-z_]+)'", l))
    for sid, f in entries:
        path = 'static/' + f
        if not os.path.exists(path):
            bad(f"scene '{sid}' -> {f} does not exist")
        elif sid not in allowed:
            bad(f"scene '{sid}' is not in any iframe list",
                "it will be injected with innerHTML, so its <script> tags never run")
        else:
            ok(f"scene '{sid}' -> {f}, in the iframe list")

print()
if fails:
    print(f"{RED}{fails} problem(s).{OFF} These do not show up in `node --check`.")
    sys.exit(1)
print(f"{GRN}Frontend check passed.{OFF}")
PY
