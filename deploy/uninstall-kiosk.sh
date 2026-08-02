#!/bin/bash
#
# ATLANTIS Kiosk — uninstaller.
#
# Removes the LaunchAgent and stops the app. Leaves the repo, the venv, and the
# logs alone.
#
# Power settings are NOT reverted by default — they are machine-level and you
# usually want to keep them. Pass --restore-power to put them back to macOS
# defaults.
#
#   ./deploy/uninstall-kiosk.sh
#   ./deploy/uninstall-kiosk.sh --restore-power
#
set -uo pipefail

LABEL="com.atlantis.kiosk"
AGENT_PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
RESTORE_POWER=0

GRN=$'\033[0;32m'; YEL=$'\033[0;33m'; BLU=$'\033[0;34m'; OFF=$'\033[0m'
ok()   { echo "  ${GRN}✓${OFF} $*"; }
warn() { echo "  ${YEL}!${OFF} $*"; }
step() { echo; echo "${BLU}==>${OFF} $*"; }

while [ $# -gt 0 ]; do
    case "$1" in
        --restore-power) RESTORE_POWER=1; shift ;;
        -h|--help) sed -n '2,18p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
        *) echo "Unknown argument: $1" >&2; exit 2 ;;
    esac
done

echo "ATLANTIS Kiosk uninstaller"

step "Stopping and unloading the LaunchAgent"
if launchctl print "gui/$(id -u)/$LABEL" >/dev/null 2>&1; then
    launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null \
        || launchctl unload "$AGENT_PLIST" 2>/dev/null
    ok "agent unloaded"
else
    warn "agent was not loaded"
fi

if [ -f "$AGENT_PLIST" ]; then
    rm -f "$AGENT_PLIST"
    ok "removed $AGENT_PLIST"
else
    warn "no plist at $AGENT_PLIST"
fi

step "Stopping any remaining app process"
if pgrep -f 'main\.py' >/dev/null 2>&1; then
    pkill -f 'main\.py' && ok "stopped main.py"
    sleep 1
    pgrep -f 'main\.py' >/dev/null 2>&1 && warn "a process is still alive — check manually"
else
    ok "nothing running"
fi

if [ "$RESTORE_POWER" = 1 ]; then
    step "Restoring power settings (requires sudo)"
    sudo pmset -a sleep 10
    sudo pmset -a displaysleep 10
    sudo pmset -a disksleep 10
    ok "power settings restored to typical defaults"
    warn "autorestart left enabled — harmless, disable with: sudo pmset -a autorestart 0"
else
    echo
    warn "power settings left as-is (never sleep, restart after power loss)"
    warn "pass --restore-power to revert them"
fi

echo
echo "${GRN}Uninstalled.${OFF} The repo, venv, and logs/ were not touched."
echo "Reinstall with: ./deploy/install-kiosk.sh"
