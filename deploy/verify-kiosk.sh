#!/bin/bash
#
# ATLANTIS Kiosk — preflight check.
#
# Verifies every link in the chain that makes this machine boot into the app
# and stay in it. Run before leaving the installation unattended.
#
# Exits 0 if everything passes, 1 if any check fails. Warnings do not fail.
#
#   ./deploy/verify-kiosk.sh
#
set -uo pipefail

LABEL="com.atlantis.kiosk"
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
AGENT_PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
PORT="${ATLANTIS_PORT:-5001}"

RED=$'\033[0;31m'; GRN=$'\033[0;32m'; YEL=$'\033[0;33m'; BLU=$'\033[0;34m'; OFF=$'\033[0m'
FAILED=0
pass() { echo "  ${GRN}PASS${OFF}  $1"; }
fail() { echo "  ${RED}FAIL${OFF}  $1"; [ $# -gt 1 ] && echo "        ${2}"; FAILED=1; }
warn() { echo "  ${YEL}WARN${OFF}  $1"; [ $# -gt 1 ] && echo "        ${2}"; }
sect() { echo; echo "${BLU}$1${OFF}"; }

echo "ATLANTIS kiosk preflight — $(date '+%Y-%m-%d %H:%M:%S')"
echo "  repo: $REPO_DIR"

# --------------------------------------------------------------------- repo
sect "Repo"

[ -x "$REPO_DIR/start-atlantis.sh" ] \
    && pass "start-atlantis.sh is executable" \
    || fail "start-atlantis.sh missing or not executable" "chmod +x start-atlantis.sh"

if [ -d "$REPO_DIR/venv" ]; then
    if "$REPO_DIR/venv/bin/python3" -c "import mediapipe, flask, cv2" 2>/dev/null; then
        pass "venv imports mediapipe, flask, cv2"
    else
        fail "venv exists but imports fail" "source venv/bin/activate && pip install -r requirements.txt"
    fi
else
    fail "venv/ not found" "python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
fi

# --------------------------------------------------------------- launchagent
sect "LaunchAgent"

if [ -f "$AGENT_PLIST" ]; then
    pass "plist installed at $AGENT_PLIST"

    if grep -q "$REPO_DIR/start-atlantis.sh" "$AGENT_PLIST"; then
        pass "plist points at this repo"
    else
        fail "plist points somewhere else" "re-run ./deploy/install-kiosk.sh"
    fi

    grep -q '<key>KeepAlive</key>' "$AGENT_PLIST" \
        && pass "KeepAlive set (restarts on crash)" \
        || fail "KeepAlive missing" "a crash would leave the installation dark"

    grep -q '<key>RunAtLoad</key>' "$AGENT_PLIST" \
        && pass "RunAtLoad set (starts at login)" \
        || fail "RunAtLoad missing"
else
    fail "not installed" "run ./deploy/install-kiosk.sh"
fi

if launchctl print "gui/$(id -u)/$LABEL" >/dev/null 2>&1; then
    pass "agent is loaded"
    state=$(launchctl print "gui/$(id -u)/$LABEL" 2>/dev/null | awk -F'= ' '/^\tstate = /{print $2; exit}')
    [ -n "$state" ] && echo "        state: $state"
else
    fail "agent is not loaded" "launchctl bootstrap gui/$(id -u) $AGENT_PLIST"
fi

# ------------------------------------------------------------------ conflicts
sect "Conflicts"

if osascript -e 'tell application "System Events" to get the name of every login item' 2>/dev/null \
   | grep -q 'start-atlantis.sh'; then
    fail "a Login Item also starts the app" "two copies will fight over the port; re-run install-kiosk.sh"
else
    pass "no conflicting Login Item"
fi

stale_found=0
for p in "$HOME/Library/LaunchAgents/pm2.atlantis.plist" \
         "$HOME/Desktop/atlantis.workflow" \
         "/Library/LaunchDaemons/com.atlantis.burningman2024.plist"; do
    [ -e "$p" ] && { warn "stale autostart artifact: $p"; stale_found=1; }
done
[ "$stale_found" = 0 ] && pass "no stale autostart artifacts"

# macOS pgrep has no -c, so count lines.
running=$(pgrep -f 'main\.py' 2>/dev/null | wc -l | tr -d ' ')
case "$running" in
    0) fail "app is not running" "launchctl kickstart -k gui/$(id -u)/$LABEL" ;;
    1) pass "exactly one app process running" ;;
    *) fail "$running app processes running" "kill the extras; only the LaunchAgent should start it" ;;
esac

# ------------------------------------------------------------------- offline
sect "Offline compliance"

if [ -x "$REPO_DIR/deploy/check-offline.sh" ]; then
    if "$REPO_DIR/deploy/check-offline.sh" >/dev/null 2>&1; then
        pass "nothing served reaches the network"
    else
        fail "offline violations present" "run ./deploy/check-offline.sh for detail"
    fi
else
    warn "deploy/check-offline.sh missing or not executable"
fi

# ---------------------------------------------------------------- boot chain
sect "Boot chain"

autologin=$(defaults read /Library/Preferences/com.apple.loginwindow autoLoginUser 2>/dev/null)
if [ -n "$autologin" ]; then
    pass "auto-login enabled for '$autologin'"
    [ "$autologin" = "$(whoami)" ] || warn "auto-login user is not $(whoami)" "the agent only loads for $(whoami)"
else
    fail "auto-login is not set" "System Settings > Users & Groups > Automatically log in as"
fi

if fdesetup status 2>/dev/null | grep -q 'FileVault is Off'; then
    pass "FileVault off (required for auto-login)"
else
    fail "FileVault is on" "it blocks auto-login; the kiosk will not boot unattended"
fi

# ---------------------------------------------------------------------- power
sect "Power"

check_pmset() {
    local key="$1" want="$2" desc="$3"
    local got
    got=$(pmset -g | awk -v k="$key" '$1==k {print $2; exit}')
    if [ "$got" = "$want" ]; then
        pass "$desc ($key=$got)"
    else
        fail "$desc — $key is '$got', want '$want'" "sudo pmset -a $key $want"
    fi
}

check_pmset autorestart  1 "restarts after power failure"
check_pmset sleep        0 "never sleeps"
check_pmset displaysleep 0 "display never blanks"
check_pmset disksleep    0 "disk never spins down"

ss=$(defaults -currentHost read com.apple.screensaver idleTime 2>/dev/null || echo unset)
[ "$ss" = "0" ] && pass "screen saver disabled" \
                || warn "screen saver idleTime is '$ss'" "defaults -currentHost write com.apple.screensaver idleTime -int 0"

# -------------------------------------------------------------------- runtime
sect "Runtime"

if system_profiler SPCameraDataType 2>/dev/null | grep -q 'Model ID\|Unique ID'; then
    pass "camera detected"
else
    fail "no camera detected" "a USB webcam is required; Mac minis have none built in"
fi

if curl -fsS -m 5 "http://localhost:$PORT/health" >/dev/null 2>&1; then
    pass "/health responding on port $PORT"
else
    bound=$(lsof -iTCP -sTCP:LISTEN -P -n 2>/dev/null | awk '/Python/{print $9}' | head -1)
    if [ -n "$bound" ]; then
        fail "/health not responding on $PORT, but Python is listening on $bound" \
             "port mismatch — the agent sets ATLANTIS_PORT; re-run install-kiosk.sh"
    else
        fail "/health not responding on port $PORT" "check logs/kiosk.err.log"
    fi
fi

# --------------------------------------------------------------------- result
echo
if [ "$FAILED" = 0 ]; then
    echo "${GRN}All checks passed.${OFF} Safe to leave unattended."
    echo "Still worth doing once on site: sudo shutdown -r now"
else
    echo "${RED}Some checks failed.${OFF} Fix the items above before leaving it unattended."
fi
exit "$FAILED"
