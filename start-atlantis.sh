#!/bin/bash
#
# ATLANTIS Hand Tracking Kiosk — launcher.
#
# The single supported way to start the app. Used both by the LaunchAgent
# (deploy/install-kiosk.sh) and by hand. Starting the app any other way means
# what you are testing is not what will come back after a reboot.
#
#   ./start-atlantis.sh                  # port 5001, production
#   ATLANTIS_PORT=5000 ./start-atlantis.sh
#   ATLANTIS_BOOT_DELAY=0 ./start-atlantis.sh   # skip the settle delay
#
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

# Single source of truth for the port. The LaunchAgent passes this in.
ATLANTIS_PORT="${ATLANTIS_PORT:-5001}"

# Seconds to wait before starting, so the desktop is up when launched at login.
ATLANTIS_BOOT_DELAY="${ATLANTIS_BOOT_DELAY:-5}"

mkdir -p "$SCRIPT_DIR/logs"

PIDFILE="$SCRIPT_DIR/logs/atlantis.pid"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

log "ATLANTIS starting — dir=$SCRIPT_DIR port=$ATLANTIS_PORT pid=$$"

# ---------------------------------------------------------------------------
# The settle delay comes FIRST, before the single-instance guards below.
#
# It used to come after them, which defeated both: two copies starting at
# login (LaunchAgent + a Login Item, say) would each run the guards while the
# other was still asleep, see a free port and no live process, and both
# proceed. Delaying first means the guards run against real state.
# ---------------------------------------------------------------------------
if [ "$ATLANTIS_BOOT_DELAY" -gt 0 ] 2>/dev/null; then
    log "Waiting ${ATLANTIS_BOOT_DELAY}s for the desktop to settle"
    sleep "$ATLANTIS_BOOT_DELAY"
fi

# ---------------------------------------------------------------------------
# Single instance.
#
# Two copies fight over the port and the camera, and the loser dies in a way
# that looks like the app crashing. This can happen easily: KeepAlive
# relaunching while a stale process lingers, or someone starting it by hand
# next to the LaunchAgent.
#
# `exec` at the end of this script replaces the shell with Python, keeping the
# same PID, so $$ recorded here stays the live process ID -- which is why the
# liveness check below has to accept BOTH forms. Between here and the exec we
# are still bash running this script; only afterwards are we `main.py`. The
# old check matched `main.py` alone, so a copy that was still in its settle
# delay looked like a recycled PID and got its pidfile deleted out from under
# it. Under the LaunchAgent the bundle execs us, so `MacOS/atlantis` can show
# up too if we are read at exactly the wrong moment.
# ---------------------------------------------------------------------------
ATLANTIS_PROC_RE='start-atlantis\.sh|main\.py|MacOS/atlantis'

# Atomic claim: with noclobber, `>` fails rather than truncates if the file
# already exists, and the test-and-create happens in one syscall. Two copies
# racing here cannot both win, however closely they are interleaved.
claim_pidfile() { (set -o noclobber; echo $$ > "$PIDFILE") 2>/dev/null; }

# Is this PID one of ours, or a number the kernel has since handed to someone
# else? Guards against acting on a recycled PID from a stale pidfile.
is_ours() { ps -p "$1" -o command= 2>/dev/null | grep -Eq "$ATLANTIS_PROC_RE"; }

if ! claim_pidfile; then
    existing=$(cat "$PIDFILE" 2>/dev/null)
    if [ -n "$existing" ] && kill -0 "$existing" 2>/dev/null && is_ours "$existing"; then
        log "ALREADY RUNNING as PID $existing — refusing to start a second copy."
        log "  Stop it first:  kill $existing"
        log "  Or under the LaunchAgent:  launchctl kickstart -k gui/\$(id -u)/com.atlantis.kiosk"
        exit 1
    fi
    log "Removing stale pidfile (PID ${existing:-unknown} is not a live ATLANTIS)"
    rm -f "$PIDFILE"
    # Re-claim atomically. If another copy took it in the gap, it won: back off
    # rather than racing it, so exactly one of us continues.
    if ! claim_pidfile; then
        log "Another copy claimed the pidfile first — refusing to start."
        exit 1
    fi
fi

# From here on we own the pidfile and must clean it up on every exit path.
trap 'rm -f "$PIDFILE"' EXIT INT TERM

# Belt and braces: if anything else already holds the port, do not pile on.
# Python would otherwise fail to bind but keep running (see run_web_app), and
# open a second fullscreen window onto the *other* instance's server.
if lsof -iTCP:"$ATLANTIS_PORT" -sTCP:LISTEN -P -n >/dev/null 2>&1; then
    holder=$(lsof -iTCP:"$ATLANTIS_PORT" -sTCP:LISTEN -P -n 2>/dev/null | awk 'NR==2 {print $2}')
    log "Port $ATLANTIS_PORT is already in use by PID ${holder:-unknown} — refusing to start."
    exit 1
fi

if [ ! -d venv ]; then
    log "FATAL: venv/ not found in $SCRIPT_DIR"
    log "Run: python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
    exit 1
fi

# shellcheck disable=SC1091
source venv/bin/activate

if ! python3 -c "import mediapipe, flask, cv2" 2>/dev/null; then
    log "ERROR: dependencies are not importable in venv/"
    #
    # Deliberately NOT running `pip install` here.
    #
    # This installation runs with no internet. Offline, pip blocks on PyPI
    # DNS and retries for minutes before failing, and under the LaunchAgent's
    # KeepAlive that turns into a silent restart loop with no visible cause.
    # Failing immediately with an actionable message is far better on site.
    #
    # Dependencies are part of provisioning, not of starting up. Run this
    # while you still have a network:
    #
    log "  Dependencies must be installed ahead of time, while online:"
    log "      source venv/bin/activate && pip install -r requirements.txt"
    log "  Then verify with: ./deploy/verify-kiosk.sh"
    exit 1
fi

log "Interpreter: $(command -v python3)"
log "Launching main.py --production --port $ATLANTIS_PORT"

# exec so the Python process replaces this shell. The LaunchAgent then tracks
# Python's own PID, and SIGTERM on shutdown reaches Python instead of bash.
exec python3 main.py --production --port "$ATLANTIS_PORT"
