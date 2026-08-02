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

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

log "ATLANTIS starting — dir=$SCRIPT_DIR port=$ATLANTIS_PORT"

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
