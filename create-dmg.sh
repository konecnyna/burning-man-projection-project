#!/bin/bash

# ATLANTIS DMG Creation Script
set -e

APP_NAME="ATLANTIS Kiosk"
DMG_NAME="ATLANTIS-Kiosk-Installer"
VERSION="1.0"
SOURCE_DIR="$(pwd)"
BUILD_DIR="build"
DMG_DIR="$BUILD_DIR/dmg"

echo "Creating DMG for $APP_NAME v$VERSION..."

# Clean up previous builds
rm -rf "$BUILD_DIR"
mkdir -p "$DMG_DIR"

# Copy project files to DMG directory
echo "Copying project files..."
rsync -av --exclude='build/' --exclude='*.dmg' --exclude='.git/' --exclude='__pycache__/' "$SOURCE_DIR/" "$DMG_DIR/$APP_NAME/"

# Create application bundle structure
APP_BUNDLE="$DMG_DIR/$APP_NAME.app"
mkdir -p "$APP_BUNDLE/Contents/MacOS"
mkdir -p "$APP_BUNDLE/Contents/Resources"

# Create Info.plist
cat > "$APP_BUNDLE/Contents/Info.plist" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleName</key>
    <string>ATLANTIS Kiosk</string>
    <key>CFBundleDisplayName</key>
    <string>ATLANTIS Hand Tracking Kiosk</string>
    <key>CFBundleIdentifier</key>
    <string>com.atlantis.kiosk</string>
    <key>CFBundleVersion</key>
    <string>$VERSION</string>
    <key>CFBundleExecutable</key>
    <string>launch-atlantis</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>NSRequiresAquaSystemAppearance</key>
    <false/>
    <key>NSCameraUsageDescription</key>
    <string>This app uses the camera for hand tracking interactions.</string>
</dict>
</plist>
EOF

# Copy launch script to app bundle
cp "$SOURCE_DIR/launch-atlantis.sh" "$APP_BUNDLE/Contents/MacOS/launch-atlantis"
chmod +x "$APP_BUNDLE/Contents/MacOS/launch-atlantis"

# Copy entire project to Resources
cp -R "$SOURCE_DIR"/* "$APP_BUNDLE/Contents/Resources/" 2>/dev/null || true
# Remove the app bundle copy that was just created
rm -rf "$APP_BUNDLE/Contents/Resources/$APP_NAME.app" 2>/dev/null || true

# Create a launcher script that runs from Resources
cat > "$APP_BUNDLE/Contents/MacOS/launch-atlantis" << 'EOF'
#!/bin/bash
BUNDLE_DIR="$(dirname "$0")/.."
RESOURCES_DIR="$BUNDLE_DIR/Resources"
cd "$RESOURCES_DIR"

# Check if Terminal is available and use it for better user experience
if command -v osascript >/dev/null 2>&1; then
    osascript -e "tell application \"Terminal\" to do script \"cd '$RESOURCES_DIR' && ./launch-atlantis.sh; exit\""
else
    ./launch-atlantis.sh
fi
EOF

chmod +x "$APP_BUNDLE/Contents/MacOS/launch-atlantis"

# Create installation instructions
cat > "$DMG_DIR/Installation Instructions.txt" << EOF
ATLANTIS Hand Tracking Kiosk Installation

1. Copy "ATLANTIS Kiosk.app" to your Applications folder
2. Double-click to run the application
3. Grant camera permissions when prompted

System Requirements:
- macOS 10.15 or later
- Built-in or USB camera
- Python 3.8+ (will be installed if needed)

For kiosk deployment:
- The app will run in fullscreen mode
- Camera permissions must be granted
- Application will auto-restart on system reboot

Troubleshooting:
- If the app doesn't start, open Terminal and navigate to the app's Resources folder
- Run: ./launch-atlantis.sh
- Check for error messages

Contact: [Your contact information]
EOF

# Create system requirements checker
cat > "$DMG_DIR/Check System.command" << 'EOF'
#!/bin/bash
echo "ATLANTIS System Requirements Check"
echo "================================="
echo

# Check macOS version
echo -n "macOS Version: "
sw_vers -productVersion

# Check Python
echo -n "Python 3: "
if command -v python3 >/dev/null 2>&1; then
    python3 --version
else
    echo "NOT FOUND - Please install Python 3.8+"
fi

# Check camera
echo -n "Camera Access: "
if system_profiler SPCameraDataType | grep -q "Camera"; then
    echo "Camera detected"
else
    echo "No camera detected"
fi

echo
echo "System check complete. Press any key to close..."
read -n 1
EOF

chmod +x "$DMG_DIR/Check System.command"

# Create the DMG
echo "Creating DMG..."
hdiutil create -srcfolder "$DMG_DIR" -volname "$APP_NAME" -fs HFS+ -fsargs "-c c=64,a=16,e=16" -format UDBZ -size 500m "$DMG_NAME.dmg"

echo "DMG created successfully: $DMG_NAME.dmg"
echo "Size: $(du -h "$DMG_NAME.dmg" | cut -f1)"

# Clean up build directory
rm -rf "$BUILD_DIR"

echo "Done!"