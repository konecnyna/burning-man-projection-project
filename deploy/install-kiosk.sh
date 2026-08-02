#!/bin/bash
#
# ATLANTIS Kiosk — installer.
#
# Makes this machine boot into the app and stay in it. Idempotent: safe to run
# repeatedly. Everything it installs is generated from files in this repo, so
# the repo stays the single source of truth.
#
# What it does:
#   1. Validates the repo (venv, launcher, template)
#   2. Renders deploy/com.atlantis.kiosk.plist.in into ~/Library/LaunchAgents/
#   3. Loads the LaunchAgent (RunAtLoad + KeepAlive)
#   4. Sets power management so the machine never sleeps and recovers from
#      power loss                                                    [sudo]
#   5. Disables the screen saver
#   6. Removes legacy autostart artifacts that would conflict        [sudo]
#
# Usage:
#   ./deploy/install-kiosk.sh              # interactive
#   ./deploy/install-kiosk.sh --dry-run    # show what would change
#   ./deploy/install-kiosk.sh --yes        # no prompts
#   ./deploy/install-kiosk.sh --port 5001
#
set -uo pipefail

LABEL="com.atlantis.kiosk"
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEMPLATE="$REPO_DIR/deploy/$LABEL.plist.in"
AGENT_DIR="$HOME/Library/LaunchAgents"
AGENT_PLIST="$AGENT_DIR/$LABEL.plist"
PORT="5001"
DRY_RUN=0
ASSUME_YES=0

RED=$'\033[0;31m'; GRN=$'\033[0;32m'; YEL=$'\033[0;33m'; BLU=$'\033[0;34m'; OFF=$'\033[0m'
ok()   { echo "  ${GRN}✓${OFF} $*"; }
warn() { echo "  ${YEL}!${OFF} $*"; }
err()  { echo "  ${RED}✗${OFF} $*" >&2; }
step() { echo; echo "${BLU}==>${OFF} $*"; }
run()  { if [ "$DRY_RUN" = 1 ]; then echo "      would run: $*"; else "$@"; fi; }
# Confirmation of something that was actually changed. Stays honest in dry-run.
did()  { if [ "$DRY_RUN" = 1 ]; then echo "  ${YEL}~${OFF} would have: $*"; else ok "$*"; fi; }

while [ $# -gt 0 ]; do
    case "$1" in
        --dry-run) DRY_RUN=1; shift ;;
        --yes|-y)  ASSUME_YES=1; shift ;;
        --port)    PORT="$2"; shift 2 ;;
        -h|--help) sed -n '2,30p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
        *) err "Unknown argument: $1"; exit 2 ;;
    esac
done

confirm() {
    [ "$ASSUME_YES" = 1 ] && return 0
    [ "$DRY_RUN" = 1 ] && return 0
    read -r -p "  $1 [y/N] " reply
    [[ "$reply" =~ ^[Yy]$ ]]
}

echo "ATLANTIS Kiosk installer"
echo "  repo: $REPO_DIR"
echo "  port: $PORT"
[ "$DRY_RUN" = 1 ] && echo "  ${YEL}DRY RUN — nothing will be changed${OFF}"

# ---------------------------------------------------------------- 1. validate
step "Validating the repo"

fail=0
[ -f "$TEMPLATE" ]                    && ok "template present" || { err "missing $TEMPLATE"; fail=1; }
[ -f "$REPO_DIR/start-atlantis.sh" ]  && ok "launcher present" || { err "missing start-atlantis.sh"; fail=1; }
[ -f "$REPO_DIR/main.py" ]            && ok "main.py present"  || { err "missing main.py"; fail=1; }

if [ -x "$REPO_DIR/start-atlantis.sh" ]; then
    ok "launcher is executable"
else
    warn "launcher not executable — fixing"
    run chmod +x "$REPO_DIR/start-atlantis.sh"
fi

if [ -d "$REPO_DIR/venv" ]; then
    ok "venv/ present"
    if "$REPO_DIR/venv/bin/python3" -c "import mediapipe, flask, cv2" 2>/dev/null; then
        ok "mediapipe, flask, cv2 import cleanly"
    else
        warn "venv exists but imports fail — the launcher will pip install on first run"
    fi
else
    err "venv/ not found. Create it first:"
    err "    python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
    fail=1
fi

[ "$fail" = 1 ] && { echo; err "Validation failed. Nothing changed."; exit 1; }

# ------------------------------------------------------------- 2. app bundle
step "Preparing the app bundle (TCC identity for camera access)"

BUNDLE="$REPO_DIR/deploy/ATLANTIS.app"
if [ -d "$BUNDLE" ]; then
    ok "bundle present"
    run chmod +x "$BUNDLE/Contents/MacOS/atlantis"
    # Ad-hoc signature gives TCC a stable identity to attach the grant to.
    # Re-sign every install: the cdhash changes whenever the bundle changes.
    if [ "$DRY_RUN" = 1 ]; then
        echo "      would ad-hoc sign $BUNDLE"
    elif codesign --force --sign - --identifier xyz.atlantis.kiosk "$BUNDLE" 2>/dev/null; then
        ok "ad-hoc signed as xyz.atlantis.kiosk"
    else
        warn "could not sign the bundle; camera prompting may not work"
    fi
else
    err "missing $BUNDLE"
    exit 1
fi

# ------------------------------------------------------------------ 3. render
step "Installing the LaunchAgent"

run mkdir -p "$AGENT_DIR" "$REPO_DIR/logs"

if [ "$DRY_RUN" = 1 ]; then
    echo "      would render $TEMPLATE -> $AGENT_PLIST"
else
    sed -e "s|__ATLANTIS_DIR__|$REPO_DIR|g" \
        -e "s|__ATLANTIS_PORT__|$PORT|g" \
        "$TEMPLATE" > "$AGENT_PLIST"

    if plutil -lint "$AGENT_PLIST" >/dev/null 2>&1; then
        ok "rendered and valid: $AGENT_PLIST"
    else
        err "rendered plist is malformed — removing"
        rm -f "$AGENT_PLIST"
        exit 1
    fi
fi

# Reload: bootout is the modern form, unload the fallback for older macOS.
run launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null
run launchctl unload "$AGENT_PLIST" 2>/dev/null

if [ "$DRY_RUN" = 1 ]; then
    echo "      would load $LABEL"
elif launchctl bootstrap "gui/$(id -u)" "$AGENT_PLIST" 2>/dev/null \
  || launchctl load -w "$AGENT_PLIST" 2>/dev/null; then
    ok "loaded $LABEL (RunAtLoad + KeepAlive)"
else
    err "failed to load the LaunchAgent"
    exit 1
fi

# ------------------------------------------------------- 4. legacy conflicts
step "Checking for conflicting autostart entries"

# A Login Item pointing at the launcher would start a second copy that fights
# the LaunchAgent for the port.
if osascript -e 'tell application "System Events" to get the name of every login item' 2>/dev/null \
   | grep -q 'start-atlantis.sh'; then
    warn "Login Item 'start-atlantis.sh' would start a second copy"
    if confirm "Remove the Login Item? (the LaunchAgent replaces it)"; then
        run osascript -e 'tell application "System Events" to delete login item "start-atlantis.sh"'
        did "Login Item removed"
    else
        warn "left in place — expect port conflicts on next boot"
    fi
else
    ok "no conflicting Login Item"
fi

# Stale artifacts from earlier setups. All point at paths that no longer exist.
declare -a STALE_USER=(
    "$HOME/Library/LaunchAgents/pm2.atlantis.plist"
    "$HOME/Desktop/atlantis.workflow"
)
STALE_SYSTEM="/Library/LaunchDaemons/com.atlantis.burningman2024.plist"

found_stale=0
for p in "${STALE_USER[@]}"; do
    [ -e "$p" ] && { warn "stale: $p"; found_stale=1; }
done
[ -e "$STALE_SYSTEM" ] && { warn "stale: $STALE_SYSTEM (system domain, needs sudo)"; found_stale=1; }

if [ "$found_stale" = 0 ]; then
    ok "no stale autostart artifacts"
elif confirm "Remove these stale entries?"; then
    for p in "${STALE_USER[@]}"; do
        if [ -e "$p" ]; then
            case "$p" in *.plist) run launchctl unload "$p" 2>/dev/null ;; esac
            run rm -rf "$p"
            did "removed $p"
        fi
    done
    if [ -e "$STALE_SYSTEM" ]; then
        run sudo launchctl bootout "system/com.atlantis.burningman2024" 2>/dev/null
        run sudo rm -f "$STALE_SYSTEM"
        did "removed $STALE_SYSTEM"
    fi
else
    warn "left in place"
fi

# ------------------------------------------------------------------ 5. power
step "Configuring power management (requires sudo)"

echo "  The kiosk must never sleep, and must power back on after a power cut."
if confirm "Apply power settings?"; then
    run sudo pmset -a autorestart 1   # power on again after a power failure
    run sudo pmset -a sleep 0         # never sleep the machine
    run sudo pmset -a displaysleep 0  # never blank the display
    run sudo pmset -a disksleep 0     # never spin down the disk
    did "power settings applied"
else
    warn "skipped — the machine may sleep mid-event"
fi

step "Disabling the screen saver"
run defaults -currentHost write com.apple.screensaver idleTime -int 0
did "screen saver disabled"

# ----------------------------------------------------------------- 6. verify
step "Verifying"
if [ "$DRY_RUN" = 1 ]; then
    echo "      would run deploy/verify-kiosk.sh"
    echo; echo "${YEL}Dry run complete — nothing was changed.${OFF}"
    exit 0
fi

echo
"$REPO_DIR/deploy/verify-kiosk.sh"
verify_rc=$?

echo
if [ "$verify_rc" = 0 ]; then
    echo "${GRN}Install complete.${OFF} The kiosk is running and will return on its own"
    echo "after a reboot or power cut."
else
    echo "${YEL}Install finished with warnings.${OFF} See the failures above."
fi
echo
echo "  Logs:      $REPO_DIR/logs/kiosk.{out,err}.log"
echo "  Status:    launchctl print gui/$(id -u)/$LABEL"
echo "  Restart:   launchctl kickstart -k gui/$(id -u)/$LABEL"
echo "  Remove:    ./deploy/uninstall-kiosk.sh"
echo
echo "  Reboot to confirm the full chain:  sudo shutdown -r now"

exit "$verify_rc"
