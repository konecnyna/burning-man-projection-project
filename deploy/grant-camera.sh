#!/bin/bash
#
# ATLANTIS Kiosk — establish the camera permission, once.
#
# Run this on the console (screen sharing counts) after installing, or any
# time `kiosk-ctl.sh status` reports the camera is not open. It needs a human
# to click Allow, so it cannot be part of an unattended boot.
#
# Why a dedicated script
# ----------------------
# macOS attributes camera access to the "responsible process". A grant made
# while the app is launched from a Terminal is a grant to *the terminal* --
# the kiosk inherits it for that run and loses it at the next boot, which is
# what made the camera look like it worked yesterday and not today.
#
# The grant has to be attached to the app bundle's own identity. That only
# happens when nothing already-authorised is standing in as the responsible
# process, so this launches the bundle from Finder rather than from this
# shell. Launching it with `open` from a terminal that already holds a camera
# grant will appear to work and will teach TCC nothing.
#
# Once the grant exists it persists across reboots and launchd launches, and
# the LaunchAgent picks the camera up on the first attempt.
#
# Usage: deploy/grant-camera.sh

set -uo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUNDLE="$REPO_DIR/deploy/ATLANTIS-Kiosk.app"
LABEL="com.atlantis.kiosk"
LOG="$REPO_DIR/logs/atlantis.log"

RED=$'\033[0;31m'; GRN=$'\033[0;32m'; YEL=$'\033[0;33m'; OFF=$'\033[0m'
ok()   { echo "  ${GRN}✓${OFF} $*"; }
warn() { echo "  ${YEL}!${OFF} $*"; }
err()  { echo "  ${RED}✗${OFF} $*" >&2; }

echo "ATLANTIS — camera permission"
echo

if [ ! -d "$BUNDLE" ]; then
    err "missing $BUNDLE"
    err "Run ./deploy/install-kiosk.sh first."
    exit 1
fi

# A background session cannot show the dialog, and the click has to happen on
# the console anyway. Fail loudly rather than silently doing nothing useful.
if [ "$(launchctl managername 2>/dev/null)" != "Aqua" ]; then
    err "this shell is not in the console (Aqua) session"
    err "Screen-share into the machine and run it from a terminal there."
    exit 1
fi

echo "Stopping the kiosk so it can be relaunched with its own identity..."
launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null
# LaunchServices apps are not launchd's children, so booting out the agent
# only removes the `open -W` wrapper. Quit the app itself too.
osascript -e 'tell application id "xyz.atlantis.kiosk" to quit' 2>/dev/null
pkill -f 'ATLANTIS-Kiosk.app/Contents/MacOS/applet' 2>/dev/null
pkill -f 'main.py --production' 2>/dev/null
sleep 3
rm -f "$REPO_DIR/logs/atlantis.pid"

mark=$(date '+%Y-%m-%d %H:%M:%S')
echo
echo "Launching the app from Finder."
echo "${YEL}Click \"Allow\" if macOS asks to use the camera.${OFF}"
echo

if ! osascript -e "tell application \"Finder\" to open POSIX file \"$BUNDLE\"" 2>/dev/null; then
    err "could not ask Finder to open the bundle"
    exit 1
fi

# Long enough for the dialog to be read and answered, plus the tracker's own
# open-retry window.
for _ in $(seq 1 24); do
    sleep 5
    if awk -v m="$mark" '$0 >= m' "$LOG" 2>/dev/null | grep -q 'Camera .* opened'; then
        echo
        ok "camera opened — the grant is recorded"
        echo
        echo "Now put it back under the LaunchAgent:"
        echo "    ./deploy/kiosk-ctl.sh restart"
        echo "    ./deploy/kiosk-ctl.sh status"
        exit 0
    fi
done

echo
err "the camera still did not open"
echo
echo "  Check System Settings → Privacy & Security → Camera and confirm"
echo "  ATLANTIS is listed and enabled. If it is listed but the camera stays"
echo "  shut, the ad-hoc signature may have changed (any rebuild of the"
echo "  bundle voids the grant) — toggle it off and on, then run this again."
echo
echo "  Recent camera lines:"
awk -v m="$mark" '$0 >= m' "$LOG" 2>/dev/null | grep -i camera | tail -5 | sed 's/^/    /'
exit 1
