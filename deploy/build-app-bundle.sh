#!/bin/bash
#
# Generate deploy/ATLANTIS-Kiosk.app -- the app bundle that exists purely to
# give the kiosk a camera permission macOS will honour.
#
# Why this script exists at all
# -----------------------------
# macOS attributes camera access to the "responsible process". Under launchd
# there is no GUI parent to inherit from, so the responsible process is the
# interpreter itself: com.apple.python3. That identity holds no grant, and
# Apple's Python.app declares no NSCameraUsageDescription, so macOS denies the
# request without ever prompting. OpenCV reports it as
#
#     OpenCV: not authorized to capture video (status 0), requesting...
#
# where "status 0" means *never asked*, not denied. The kiosk boots, cycles
# scenes, and never sees a hand.
#
# The bundle used to be a hand-written .app whose CFBundleExecutable was a
# shell script. That does not work, for two independent reasons:
#
#   1. LaunchServices refuses to launch it. `open` fails with -10669 for any
#      bundle whose main executable is a script, wherever it lives -- verified
#      on this machine against /Applications too. Without LaunchServices there
#      is no app identity, so there is nothing for TCC to attach a grant to.
#   2. It ended with `exec`, which replaces the process image. Even had it
#      launched, the bundle's identity would have been discarded at that
#      moment and the process would once again be plain python.
#
# So the main executable has to be a real Mach-O, and the bundle has to stay
# alive as the *parent* of python -- exactly the shape that makes launching
# from Terminal work, where Terminal holds the grant and its python child
# inherits it.
#
# osacompile builds precisely that, using only tools already on the machine:
# an AppleScript applet whose executable is Apple's signed applet stub. It runs
# start-atlantis.sh via `do shell script` and waits, so python is its child and
# inherits the app's TCC identity.
#
# This keeps the "no build process" constraint intact: nothing is compiled, and
# this runs at install time, not at runtime. install-kiosk.sh calls it.
#
# Why the bundle is not called ATLANTIS.app
# -----------------------------------------
# It used to be, and that exact path is now unusable on the deployment box.
# LaunchServices cached a record for deploy/ATLANTIS.app back when the bundle
# was script-based, and it refuses that path with -10669 forever: `lsregister
# -u`, `lsregister -f`, and a full `lsregister -kill -r` database rebuild all
# leave it broken, while a byte-identical copy of the same bundle at any other
# name in the same directory launches. So the name is load-bearing. If you
# rename it back you will get a kiosk that boots blind and logs nothing useful.
#
# Usage: deploy/build-app-bundle.sh [--dry-run]

set -uo pipefail

DRY_RUN=0
FORCE=0
for arg in "$@"; do
    case "$arg" in
        --dry-run) DRY_RUN=1 ;;
        --force)   FORCE=1 ;;
    esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BUNDLE="$SCRIPT_DIR/ATLANTIS-Kiosk.app"
BUNDLE_ID="xyz.atlantis.kiosk"

# Rebuilding is NOT free, which is why this is idempotent by default.
#
# The signature is ad-hoc, so TCC has no team identifier to anchor the camera
# grant to and pins it to the cdhash instead. Every rebuild produces a new
# cdhash, which silently invalidates the grant -- the kiosk comes back up
# camera-blind and the only symptom is "not authorized ... (status 0)" again.
# Re-granting needs a human at the machine (see deploy/grant-camera.sh), which
# is exactly what is unavailable on site.
#
# So: build only when there is no usable bundle. --force to rebuild anyway,
# and expect to re-grant afterwards.
bundle_is_usable() {
    [ -d "$BUNDLE" ] || return 1
    [ -x "$BUNDLE/Contents/MacOS/applet" ] || return 1
    codesign --verify "$BUNDLE" 2>/dev/null || return 1
    [ "$(/usr/libexec/PlistBuddy -c 'Print :CFBundleIdentifier' \
         "$BUNDLE/Contents/Info.plist" 2>/dev/null)" = "$BUNDLE_ID" ]
}

if [ "$DRY_RUN" = 1 ]; then
    if bundle_is_usable; then
        echo "would keep the existing $BUNDLE (valid; rebuilding would void the camera grant)"
    else
        echo "would build $BUNDLE as an AppleScript applet and ad-hoc sign it"
    fi
    exit 0
fi

if [ "$FORCE" != 1 ] && bundle_is_usable; then
    echo "kept $BUNDLE (already valid; --force to rebuild)"
    exit 0
fi

# The applet resolves the repo from its own location rather than baking an
# absolute path, so the repo can still be moved without a rebuild.
#
# `try` matters: an uncaught error from do shell script puts a modal dialog on
# screen, and this machine runs unattended with nobody to dismiss it. The
# timeout matters for the same reason -- do shell script defaults to two
# minutes, and the kiosk is supposed to run for days.
read -r -d '' APPLESCRIPT <<'AS'
on run
	set appPath to POSIX path of (path to me)
	set repoDir to do shell script "cd " & quoted form of appPath & "/../.. && pwd"
	set launcher to quoted form of (repoDir & "/start-atlantis.sh")
	set logFile to quoted form of (repoDir & "/logs/kiosk.out.log")
	try
		with timeout of 2592000 seconds
			do shell script launcher & " >> " & logFile & " 2>&1"
		end timeout
	end try
end run
AS

rm -rf "$BUNDLE"
if ! osacompile -o "$BUNDLE" -e "$APPLESCRIPT" 2>/dev/null; then
    echo "FATAL: osacompile failed" >&2
    exit 1
fi

PLIST="$BUNDLE/Contents/Info.plist"
set_key() { /usr/libexec/PlistBuddy -c "Set :$1 $2" "$PLIST" 2>/dev/null \
         || /usr/libexec/PlistBuddy -c "Add :$1 $3 $2" "$PLIST" >/dev/null; }

set_key CFBundleIdentifier  "$BUNDLE_ID"    string
set_key CFBundleName        "ATLANTIS"      string
set_key CFBundleDisplayName "ATLANTIS Kiosk" string
# LSUIElement keeps it out of the Dock and the app switcher; the fullscreen
# webview is the only thing the audience should ever see.
set_key LSUIElement         true            bool
set_key NSCameraUsageDescription \
    "ATLANTIS uses the camera to track hand movement. No video is recorded, stored, or transmitted -- frames are processed in memory and discarded." \
    string

# Ad-hoc signature, re-applied every build because the cdhash changes with the
# bundle. Gatekeeper will not *notarize*-approve this, which is fine: launching
# is done by us, not by a user double-clicking a download.
if ! codesign --force --deep --sign - --identifier "$BUNDLE_ID" "$BUNDLE" 2>/dev/null; then
    echo "WARNING: could not ad-hoc sign $BUNDLE" >&2
fi

if ! plutil -lint "$PLIST" >/dev/null 2>&1; then
    echo "FATAL: generated Info.plist is malformed" >&2
    exit 1
fi

echo "built $BUNDLE ($BUNDLE_ID)"
