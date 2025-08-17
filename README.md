# ATLANTIS Kiosk Auto-Launch Setup

This guide configures a Mac mini to automatically start the ATLANTIS Hand Tracking Kiosk on boot.

## Prerequisites

1. Mac mini with macOS
2. This project cloned to `/Users/[username]/github/burning-man-2024/`
3. Python virtual environment set up (`venv/` directory exists)

## Simple Setup (Recommended)

### 1. Enable Auto-Login

1. Open **System Preferences** → **Users & Groups**
2. Click the lock icon and enter admin password
3. Select **Login Options** at bottom left
4. Set **Automatic login** to your user account

### 2. Add to Login Items

1. Open **System Preferences** → **Users & Groups**
2. Select your user account
3. Click **Login Items** tab
4. Click the **+** button
5. Navigate to `/Users/defkon/github/burning-man-2024/start-atlantis.sh`
6. Select the script and click **Add**
7. Make sure **Hide** is checked (optional - hides Terminal window)

### 3. Make Script Executable

```bash
chmod +x /Users/defkon/github/burning-man-2024/start-atlantis.sh
```

That's it! The Mac mini will now auto-login and launch ATLANTIS automatically.

## Operation

### Startup Sequence
1. Mac mini powers on
2. System auto-logs in to configured user
3. Login Items launches `start-atlantis.sh`
4. Script activates Python environment and launches ATLANTIS
5. Kiosk interface appears in fullscreen

### Managing the Login Item

To disable/enable auto-launch:
1. Open **System Preferences** → **Users & Groups**
2. Select your user → **Login Items** tab
3. Find `start-atlantis.sh` in the list
4. Uncheck to disable, check to enable

## Troubleshooting

### Common Issues

**Script doesn't run on startup:**
- Verify auto-login is enabled
- Check Login Items list contains `start-atlantis.sh`
- Make sure script is executable: `chmod +x start-atlantis.sh`

**Python/dependency errors:**
- Check virtual environment exists: `ls venv/`
- Manually test the script: `./start-atlantis.sh`

**Application doesn't launch:**
- Verify camera permissions for Terminal/Python
- Check MediaPipe installation: `source venv/bin/activate && python -c "import mediapipe"`

### Manual Testing

```bash
# Test the script directly
./start-atlantis.sh

# Simulate restart to test full flow
sudo shutdown -r now
```

## Security Notes

- The kiosk runs with standard user privileges
- Camera access must be granted to Terminal or Python
- No network access required after initial setup
- Consider disabling unnecessary system services for kiosk deployment

## Kiosk Hardening (Optional)

For production kiosk deployment:

1. **Disable dock and menu bar**: Use third-party kiosk software
2. **Disable hot corners and shortcuts**: System Preferences → Mission Control
3. **Turn off screen saver**: System Preferences → Desktop & Screen Saver
4. **Disable sleep**: System Preferences → Energy Saver
5. **Hide desktop icons**: Terminal: `defaults write com.apple.finder CreateDesktop false`