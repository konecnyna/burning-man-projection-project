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

# ---------------------------------------------------------------------------
# Single instance.
#
# Two copies fight over the port and the camera, and the loser dies in a way
# that looks like the app crashing. This can happen easily: KeepAlive
# relaunching while a stale process lingers, or someone starting it by hand
# next to the LaunchAgent.
#
# `exec` at the end of this script replaces the shell with Python, keeping the
# same PID, so $$ recorded here stays the live process ID.
# ---------------------------------------------------------------------------
if [ -f "$PIDFILE" ]; then
    existing=$(cat "$PIDFILE" 2>/dev/null)
    if [ -n "$existing" ] && kill -0 "$existing" 2>/dev/null; then
        # Confirm it is actually ours and not a recycled PID.
        if ps -p "$existing" -o command= 2>/dev/null | grep -q 'main\.py'; then
            log "ALREADY RUNNING as PID $existing — refusing to start a second copy."
            log "  Stop it first:  kill $existing"
            log "  Or under the LaunchAgent:  launchctl kickstart -k gui/\$(id -u)/com.atlantis.kiosk"
            exit 1
        fi
    fi
    log "Removing stale pidfile (PID ${existing:-unknown} is gone)"
    rm -f "$PIDFILE"
fi

# Belt and braces: if anything else already holds the port, do not pile on.
if lsof -iTCP:"$ATLANTIS_PORT" -sTCP:LISTEN -P -n >/dev/null 2>&1; then
    holder=$(lsof -iTCP:"$ATLANTIS_PORT" -sTCP:LISTEN -P -n 2>/dev/null | awk 'NR==2 {print $2}')
    log "Port $ATLANTIS_PORT is already in use by PID ${holder:-unknown} — refusing to start."
    exit 1
fi

echo $$ > "$PIDFILE"
trap 'rm -f "$PIDFILE"' EXIT INT TERM

log "ATLANTIS starting — dir=$SCRIPT_DIR port=$ATLANTIS_PORT pid=$$"

if [ "$ATLANTIS_BOOT_DELAY" -gt 0 ] 2>/dev/null; then
    log "Waiting ${ATLANTIS_BOOT_DELAY}s for the desktop to settle"
    sleep "$ATLANTIS_BOOT_DELAY"
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
