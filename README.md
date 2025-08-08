# ATLANTIS Hand Tracking Kiosk

Interactive hand tracking installation for Burning Man 2025.

## Installation

MediaPipe requires Python 3.11.11 for optimal performance.

```bash
# Install pyenv (if not already installed)
brew install pyenv

# Install Python 3.11.11
pyenv install 3.11.11
pyenv local 3.11.11

# Create virtual environment with correct Python version
~/.pyenv/versions/3.11.11/bin/python -m venv venv
source venv/bin/activate

# Install requirements
pip install -r requirements.txt
```

## Running the Application

```bash
# Activate virtual environment
source venv/bin/activate

# Run in development mode
python main.py

# Run in kiosk mode (fullscreen)
python main.py --kiosk
```

## Features

- Real-time hand tracking using MediaPipe
- Multiple interactive visual scenes
- Auto-cycling between scenes
- Idle timeout and screensaver mode
- Pipboy-style terminal UI aesthetic
- Offline operation (no internet required)

## Project Structure

- `main.py` - Application entry point
- `hand_tracker.py` - MediaPipe hand tracking
- `scene_manager.py` - Scene management and cycling
- `web_app.py` - Flask server and WebSocket handling
- `static/` - Frontend HTML, CSS, and JavaScript files
- `static/scenes/` - Individual interactive scene implementations