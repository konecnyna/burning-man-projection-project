#!/bin/bash
#
# ATLANTIS Kiosk — control the app over SSH.
#
# WHY THIS EXISTS
#
# An SSH session runs in macOS's "Background" session, not "Aqua". Anything
# launched directly from SSH inherits that, which means:
#
#   - no camera. TCC-protected resources are gated on the session, and a
#     Background process has nowhere to draw a permission prompt, so the
#     request dies as NotDetermined (OpenCV reports "not authorized, status 0")
#   - no reliable window. A GUI app hosted in a Background session may not
#     render, and tends to exit without explanation
#
# Check for yourself:  launchctl managername
#   Aqua        -> console session, everything works
#   Background  -> SSH session, camera and window will not
#
# The fix is to never launch the app from the SSH session itself. Instead,
# drive the LaunchAgent, which lives in gui/<uid> — the Aqua session. That
# works over SSH and needs no sudo, because you are targeting your own GUI
# domain.
#
# Usage:
#   ./deploy/kiosk-ctl.sh status     # where it is running, health, camera
#   ./deploy/kiosk-ctl.sh start      # start in the Aqua session
#   ./deploy/kiosk-ctl.sh stop       # stop it
#   ./deploy/kiosk-ctl.sh restart    # restart in place (most useful after edits)
#   ./deploy/kiosk-ctl.sh logs       # follow the application log
#   ./deploy/kiosk-ctl.sh headless   # run here in the SSH session, no window,
#                                    # no camera -- for server-side testing only
#
set -uo pipefail

LABEL="com.atlantis.kiosk"
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
AGENT_PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
DOMAIN="gui/$(id -u)"
PORT="${ATLANTIS_PORT:-5001}"

RED=$'\033[0;31m'; GRN=$'\033[0;32m'; YEL=$'\033[0;33m'; BLU=$'\033[0;34m'; OFF=$'\033[0m'
ok()   { echo "  ${GRN}✓${OFF} $*"; }
warn() { echo "  ${YEL}!${OFF} $*"; }
err()  { echo "  ${RED}✗${OFF} $*" >&2; }
head_() { echo; echo "${BLU}$1${OFF}"; }

agent_installed() { [ -f "$AGENT_PLIST" ]; }
agent_loaded()    { launchctl print "$DOMAIN/$LABEL" >/dev/null 2>&1; }

require_agent() {
    if ! agent_installed; then
        err "LaunchAgent not installed."
        err "Install it first:  ./deploy/install-kiosk.sh"
        err "(the agent load itself needs no sudo; only pmset and stale cleanup do)"
        exit 1
    fi
}

app_pid() {
    pgrep -f 'main\.py' 2>/dev/null | while read -r p; do
        ps -p "$p" -o command= 2>/dev/null | grep -q 'Python' && echo "$p"
    done | head -1
}

cmd_status() {
    head_ "Session"
    local mgr; mgr=$(launchctl managername 2>/dev/null)
    if [ "$mgr" = "Aqua" ]; then
        ok "this shell is in the Aqua (console) session"
    else
        warn "this shell is '$mgr' — an SSH/background session"
        echo "        Do not launch the app directly from here; drive the agent."
    fi

    head_ "LaunchAgent"
    agent_installed && ok "installed: $AGENT_PLIST" || warn "not installed (run ./deploy/install-kiosk.sh)"
    if agent_loaded; then
        ok "loaded in $DOMAIN"
        launchctl print "$DOMAIN/$LABEL" 2>/dev/null \
            | awk -F'= ' '/^\tstate = |^\tpid = |^\tlast exit code = /{gsub(/^\t/,"");print "        "$0}'
    else
        warn "not loaded"
    fi

    head_ "Process"
    local pid; pid=$(app_pid)
    if [ -n "$pid" ]; then
        ok "running, pid $pid, up $(ps -o etime= -p "$pid" | tr -d ' ')"
        # Which session is the app itself in? That determines camera access.
        if launchctl print "$DOMAIN" 2>/dev/null | grep -q "\b$pid\b"; then
            ok "hosted in the Aqua session (camera can work)"
        else
            warn "not hosted by the GUI domain — likely started from a shell"
            echo "        If it was started over SSH, the camera will not work."
        fi
    else
        warn "not running"
    fi

    head_ "Health"
    local h; h=$(curl -fsS -m 4 "http://localhost:$PORT/health" 2>/dev/null)
    [ -n "$h" ] && ok "$h" || warn "no response on port $PORT"

    head_ "Camera"
    if system_profiler SPCameraDataType 2>/dev/null | grep -q 'Model ID\|Unique ID'; then
        ok "hardware present: $(system_profiler SPCameraDataType 2>/dev/null | grep -m1 'Model ID' | sed 's/^ *//')"
    else
        warn "no camera hardware detected"
    fi
    if grep -q 'Could not open camera' "$REPO_DIR/logs/atlantis.log" 2>/dev/null; then
        local last; last=$(grep 'Could not open camera' "$REPO_DIR/logs/atlantis.log" | tail -1 | cut -c1-19)
        warn "last camera failure logged at $last"
    fi
}

cmd_start() {
    require_agent
    if agent_loaded; then
        warn "already loaded — use 'restart' to bounce it"
        exit 0
    fi
    launchctl bootstrap "$DOMAIN" "$AGENT_PLIST" 2>/dev/null \
        || launchctl load -w "$AGENT_PLIST" 2>/dev/null \
        || { err "failed to load"; exit 1; }
    ok "started in the Aqua session"
    sleep 6
    cmd_status
}

cmd_stop() {
    if agent_loaded; then
        launchctl bootout "$DOMAIN/$LABEL" 2>/dev/null || launchctl unload "$AGENT_PLIST" 2>/dev/null
        ok "agent stopped"
    else
        warn "agent was not loaded"
    fi
    # A copy started by hand will not be managed by launchd; clear it too.
    local pid; pid=$(app_pid)
    if [ -n "$pid" ]; then
        kill "$pid" 2>/dev/null && ok "stopped stray process $pid"
    fi
}

cmd_restart() {
    require_agent
    if agent_loaded; then
        launchctl kickstart -k "$DOMAIN/$LABEL" 2>/dev/null && ok "restarted in the Aqua session" \
            || { err "kickstart failed"; exit 1; }
    else
        cmd_start
        return
    fi
    sleep 6
    cmd_status
}

cmd_logs() {
    local f="$REPO_DIR/logs/atlantis.log"
    [ -f "$f" ] || { err "no log at $f"; exit 1; }
    echo "following $f  (Ctrl-C to stop)"
    tail -f "$f"
}

cmd_headless() {
    warn "Headless mode: no window and NO CAMERA (this is an SSH session)."
    warn "Use this only to exercise the server, routes and offline checks."
    echo
    exec env ATLANTIS_BOOT_DELAY=0 "$REPO_DIR/venv/bin/python3" \
        "$REPO_DIR/main.py" --headless --production --port "$PORT"
}

case "${1:-status}" in
    status)   cmd_status ;;
    start)    cmd_start ;;
    stop)     cmd_stop ;;
    restart)  cmd_restart ;;
    logs)     cmd_logs ;;
    headless) cmd_headless ;;
    -h|--help) sed -n '2,40p' "$0" | sed 's/^# \{0,1\}//' ;;
    *) err "Unknown command: $1"; echo "Try: status | start | stop | restart | logs | headless"; exit 2 ;;
esac
