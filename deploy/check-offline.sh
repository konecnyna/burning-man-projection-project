#!/bin/bash
#
# ATLANTIS Kiosk — offline compliance check.
#
# The installation runs with no internet. Anything that reaches out at runtime
# hangs on DNS and then fails, which on site looks like a frozen or broken
# scene. This scans everything served to the browser for references that would
# do that.
#
# Run it before every deployment, and after adding or changing any scene.
#
#   ./deploy/check-offline.sh              # fail on violations
#   ./deploy/check-offline.sh --verbose    # also list attribution-only URLs
#
# Exit 0 = clean, 1 = at least one violation.
#
# Checks:
#   1. Remote resource loads — <script>/<link>/<img>/<iframe> src|href off-box
#   2. Remote CSS           — @import or url() off-box
#   3. Runtime requests     — fetch/XHR/WebSocket/script-injection to a remote
#   4. Third-party hosts    — known trackers, social widgets, CDNs
#   5. Local assets         — every local src/href resolves on disk
#   6. Python               — no pip at startup, MediaPipe models present
#
# Commented-out code is not a violation. HTML (<!-- -->) and CSS/JS block
# (/* */) comments are blanked before checks 1, 2 and 5, with line numbers
# preserved. Author attributions in vendored libraries are shown by --verbose.
#
# Check 4 scans raw, because a live tracker reference can be assembled from
# string fragments. Known-neutralized files go in deploy/offline-allowlist.txt
# with a reason.
#
set -uo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ALLOWLIST="$REPO_DIR/deploy/offline-allowlist.txt"
VERBOSE=0
VIOLATIONS=0

RED=$'\033[0;31m'; GRN=$'\033[0;32m'; YEL=$'\033[0;33m'; BLU=$'\033[0;34m'; OFF=$'\033[0m'
sect() { echo; echo "${BLU}$1${OFF}"; }
pass() { echo "  ${GRN}PASS${OFF}  $1"; }
bad()  { echo "  ${RED}FAIL${OFF}  $1"; VIOLATIONS=$((VIOLATIONS + 1)); }
note() { echo "        $1"; }

case "${1:-}" in --verbose|-v) VERBOSE=1 ;; esac

cd "$REPO_DIR" || exit 1

echo "ATLANTIS offline compliance check"
echo "  repo: $REPO_DIR"

# ------------------------------------------------------------ scan corpus
# Mirror the served HTML/CSS with comment bodies blanked out, so commented
# code cannot trigger a violation. Newlines are preserved so reported line
# numbers still match the real file.
SCAN=$(mktemp -d) || { echo "cannot create temp dir" >&2; exit 2; }
trap 'rm -rf "$SCAN"' EXIT

python3 - "$REPO_DIR" "$SCAN" <<'PY'
import os, re, sys
repo, out = sys.argv[1], sys.argv[2]
blank = lambda m: re.sub(r"[^\n]", " ", m.group(0))
for top in ("static", "templates"):
    base = os.path.join(repo, top)
    for root, _, files in os.walk(base):
        for fn in files:
            if not fn.lower().endswith((".html", ".htm", ".css")):
                continue
            src = os.path.join(root, fn)
            rel = os.path.relpath(src, repo)
            dst = os.path.join(out, rel)
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            try:
                t = open(src, encoding="utf-8", errors="replace").read()
            except OSError:
                continue
            t = re.sub(r"<!--.*?-->", blank, t, flags=re.S)
            t = re.sub(r"/\*.*?\*/", blank, t, flags=re.S)
            open(dst, "w", encoding="utf-8").write(t)
PY

is_allow() {
    [ -f "$ALLOWLIST" ] || return 1
    grep -v '^[[:space:]]*#' "$ALLOWLIST" | grep -v '^[[:space:]]*$' \
        | cut -d'|' -f1 | sed 's/[[:space:]]*$//' | grep -qxF "$1"
}
allow_reason() {
    grep -v '^[[:space:]]*#' "$ALLOWLIST" 2>/dev/null | grep -F "$1" \
        | cut -d'|' -f2- | sed 's/^[[:space:]]*//' | head -1
}

# ------------------------------------------- 1. structural remote loads
sect "Remote resource loads"

STRUCTURAL=$( (cd "$SCAN" && grep -rnoiE \
    '<(script|link|img|iframe|source|video|audio|embed)[^>]+(src|href)[[:space:]]*=[[:space:]]*"?'"'"'?(https?:)?//[^"'"'"' >]+' \
    . 2>/dev/null) | sed 's|^\./||' || true)

if [ -z "$STRUCTURAL" ]; then
    pass "no tag loads a remote URL"
else
    while IFS= read -r line; do
        [ -n "$line" ] || continue
        bad "remote resource load"
        note "$line"
    done <<< "$STRUCTURAL"
fi

# ------------------------------------------------------- 2. remote CSS
sect "Remote CSS"

CSSHIT=$( (cd "$SCAN" && grep -rnoiE \
    '@import[^;]*(https?:)?//|url\([[:space:]]*"?'"'"'?(https?:)?//[^)]+' \
    . 2>/dev/null) | sed 's|^\./||' || true)

if [ -z "$CSSHIT" ]; then
    pass "no @import or url() pointing off-box"
else
    while IFS= read -r line; do
        [ -n "$line" ] || continue
        bad "remote CSS reference"
        note "$line"
    done <<< "$CSSHIT"
fi

# -------------------------------------------------- 3. runtime requests
sect "Runtime network calls"

# grep -E has no lookaheads, so localhost is filtered afterwards.
RUNTIME=$(grep -rnoiE \
    '(fetch|importScripts|navigator\.sendBeacon)\([[:space:]]*"?'"'"'?(https?:)?//|\.open\([[:space:]]*"?'"'"'?(GET|POST)"?'"'"'?,[[:space:]]*"?'"'"'?(https?:)?//|\.src[[:space:]]*=[[:space:]]*"?'"'"'?(https?:)?//|new[[:space:]]+WebSocket\([[:space:]]*"?'"'"'?wss?://' \
    static templates 2>/dev/null \
    | grep -viE '//(localhost|127\.0\.0\.1)' || true)

RUNTIME_HITS=0
if [ -n "$RUNTIME" ]; then
    while IFS= read -r line; do
        [ -n "$line" ] || continue
        f="${line%%:*}"
        # Allowlisted files are neutralized elsewhere; see the reason there.
        is_allow "$f" && continue
        bad "runtime request to a remote URL"
        note "$line"
        RUNTIME_HITS=$((RUNTIME_HITS + 1))
    done <<< "$RUNTIME"
fi
[ "$RUNTIME_HITS" = 0 ] && \
    pass "no fetch/XHR/WebSocket/script-injection to a remote URL"

# --------------------------------------------------- 4. third-party hosts
sect "Third-party trackers and widgets"

TRACKERS='sharethis\.com|google-analytics\.com|googletagmanager\.com|doubleclick\.net|connect\.facebook\.net|platform\.twitter\.com|apis\.google\.com|cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com|unpkg\.com|ajax\.googleapis\.com|fonts\.googleapis\.com|fonts\.gstatic\.com|code\.jquery\.com'


# macOS bash 3.2 has no mapfile.
HITFILES=$(grep -rlEi "$TRACKERS" static templates 2>/dev/null || true)

if [ -z "$HITFILES" ]; then
    pass "no known tracker, widget, or CDN hostnames"
else
    while IFS= read -r f; do
        [ -n "$f" ] || continue
        count=$(grep -oEi "$TRACKERS" "$f" 2>/dev/null | wc -l | tr -d ' ')
        hosts=$(grep -oEi "$TRACKERS" "$f" 2>/dev/null | sort -u | tr '\n' ' ')
        if is_allow "$f"; then
            echo "  ${YEL}ALLOW${OFF} $f ($count refs: $hosts)"
            note "reason: $(allow_reason "$f")"
        else
            bad "$f ($count refs)"
            note "hosts: $hosts"
            note "Neutralize it, or add it to deploy/offline-allowlist.txt with a reason."
        fi
    done <<< "$HITFILES"
fi

# --------------------------------------------------- 5. local asset targets
sect "Local asset resolution"

MISSING=0
CHECKED=0
REFS=$( (cd "$SCAN" && grep -rnoE '(src|href)="[^"]+"' --include='*.html' . 2>/dev/null) \
        | sed 's|^\./||' || true)

if [ -n "$REFS" ]; then
    while IFS= read -r ref; do
        [ -n "$ref" ] || continue
        file="${ref%%:*}"
        # BSD sed has no \| alternation — use -E.
        path=$(echo "$ref" | sed -E 's/^[^:]*:[0-9]+://; s/^(src|href)="//; s/"$//')

        case "$path" in
            ''|'#'*|data:*|mailto:*|javascript:*|http:*|https:*|//*) continue ;;
            *'${'*|*'{{'*) continue ;;   # JS template literal / Jinja
        esac
        path="${path%%\?*}"; path="${path%%#*}"
        [ -n "$path" ] || continue
        case "$(basename "$path")" in
            *.*) : ;;
            *)   continue ;;             # extensionless -> a route, not a file
        esac

        case "$path" in
            /static/*) target="$REPO_DIR/${path#/}" ;;
            /scenes/*) target="$REPO_DIR/static/${path#/}" ;;
            /*)        target="$REPO_DIR/static${path}" ;;
            *)         target="$REPO_DIR/$(dirname "$file")/$path" ;;
        esac

        CHECKED=$((CHECKED + 1))
        if [ ! -e "$target" ]; then
            bad "broken local reference: $file"
            note "-> $path"
            MISSING=$((MISSING + 1))
        fi
    done <<< "$REFS"
fi

[ "$MISSING" = 0 ] && pass "all $CHECKED local src/href references resolve on disk"

# Resolving on disk is not the same as resolving over HTTP. static/index.html
# is served at "/", so a relative href there resolves to /<path>, which has no
# Flask route even though the file exists under static/. Scene files are served
# at /scenes/<name>/, where relative paths do work.
RELREFS=$( (cd "$SCAN" && grep -noE '(src|href)="[^"/][^":]*"' static/index.html 2>/dev/null) \
           | grep -vE '\$\{|\{\{' || true)
if [ -z "$RELREFS" ]; then
    pass "static/index.html uses absolute paths (it is served at /)"
else
    while IFS= read -r line; do
        [ -n "$line" ] || continue
        bad "relative reference in static/index.html — served at / so this 404s"
        note "static/index.html:$line"
        note "Prefix with /static/ ."
    done <<< "$RELREFS"
fi

# ---------------------------------------------------------- 6. attribution
if [ "$VERBOSE" = 1 ]; then
    sect "Hosts appearing anywhere in served files (mostly attribution)"
    grep -rhoE 'https?://[a-zA-Z0-9.-]+' static templates 2>/dev/null \
        | sort | uniq -c | sort -rn | head -25 | sed 's/^/       /'
fi

# --------------------------------------------------------------- 7. python
sect "Python dependencies"

if grep -qE '^[[:space:]]*pip install' "$REPO_DIR/start-atlantis.sh" 2>/dev/null; then
    bad "start-atlantis.sh runs 'pip install' at startup"
    note "Offline, pip blocks on PyPI and retries for minutes before failing."
else
    pass "launcher does not pip install at startup"
fi

if grep -rqE '^\s*(import requests|import urllib|from urllib)' "$REPO_DIR"/*.py 2>/dev/null; then
    bad "application Python imports an HTTP client"
    note "$(grep -rlE '^\s*(import requests|import urllib|from urllib)' "$REPO_DIR"/*.py | tr '\n' ' ')"
else
    pass "application Python imports no HTTP client"
fi

if [ -d "$REPO_DIR/venv" ]; then
    if find "$REPO_DIR/venv" -name 'hand_landmark_lite.tflite' 2>/dev/null | grep -q .; then
        pass "MediaPipe hand models present locally (no download at runtime)"
    else
        bad "MediaPipe hand landmark models missing from venv"
    fi
else
    echo "  ${YEL}SKIP${OFF}  no venv/ to check"
fi

# ----------------------------------------------------------------- result
echo
if [ "$VIOLATIONS" = 0 ]; then
    echo "${GRN}Offline check passed.${OFF} Nothing served will reach the network."
else
    echo "${RED}$VIOLATIONS violation(s).${OFF} These fail on site, where there is no internet."
fi
exit $(( VIOLATIONS > 0 ? 1 : 0 ))
