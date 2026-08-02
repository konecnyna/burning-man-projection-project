# Claude AI Assistant Instructions

## Project Context
This is the ATLANTIS Hand Tracking Kiosk project - a Python-based interactive installation that uses MediaPipe for hand tracking and displays multiple visual scenes controlled by hand gestures.

## Core Workflow Instructions

### Session Startup
1. **ALWAYS** read `planning.md` at the start of every new conversation
2. **ALWAYS** check `tasks.md` before starting work to understand current priorities
3. **ALWAYS** review recent session summaries in this file to understand progress
4. **NEVER** start coding without understanding the current project state

### Task Management
1. **ALWAYS** check `tasks.md` before beginning any work
2. **IMMEDIATELY** mark tasks as completed when finished
3. **ADD** any new tasks discovered during development to `tasks.md`
4. **PRIORITIZE** tasks marked as "high" priority first
5. **BREAK DOWN** large tasks into smaller, actionable items

### Code Guidelines
1. **FOLLOW** the existing code patterns and architecture
2. **MAINTAIN** the single-app Python architecture (no build process)
3. **ENSURE** all libraries are local and work offline
4. **PRESERVE** the pipboy/terminal aesthetic throughout
5. **TEST** changes before marking tasks complete

### File Management
1. **PREFER** editing existing files over creating new ones
2. **MAINTAIN** the project structure defined in `planning.md`
3. **DOCUMENT** any architectural changes in `planning.md`
4. **UPDATE** `tasks.md` with any new requirements discovered

### Quality Standards
1. **ENSURE** hand tracking remains responsive (30-60 FPS)
2. **MAINTAIN** kiosk mode compatibility
3. **PRESERVE** offline functionality
4. **HANDLE** errors gracefully for unattended operation

## Session History

### Session 1 (Initial Development)
- Implemented core hand tracking system using MediaPipe
- Created scene management system with auto-cycling
- Built Flask + WebSocket communication layer
- Established basic kiosk interface structure

### Session 2 (UI Enhancement)
- Applied pipboy-style terminal aesthetics
- Fixed CSS loading issues in iframe scenes
- Implemented comprehensive idle management system
- Added HUD visibility controls for idle/active states

### Session 3 (Interaction Improvements)
- Added hand cursor visualization for welcome scene
- Implemented 3-second countdown interface
- Created hover detection for interactive elements
- Integrated scene transition triggers via countdown

### Session 4 (Documentation Structure)
- Created comprehensive PRD with user stories and requirements
- Established AI assistant workflow with claude.md
- Documented technical architecture and constraints
- Set up project management structure with tasks.md

### Session 5 (Architecture Refactoring & Bug Fixes)
- **Major Refactoring**: Moved scene definitions from SceneManager to ModeManager for better separation of concerns
- **Fixed Scene Loading**: Resolved multiple scene handler errors and initialization issues
- **Improved HUD Management**: Fixed HUD visibility in idle mode with proper CSS class handling
- **Enhanced Error Handling**: Added proper null checks and delegation patterns for scene handlers
- **Optimized Bloom Effects**: Reduced bloom intensity in fluid simulation for better visual balance

## Current Project Status

### Completed Features
- ✅ Real-time hand tracking with MediaPipe
- ✅ Multiple interactive scenes (welcome, fluid sim, cosmic, waves, orbits, tie-dye)
- ✅ Scene auto-cycling with configurable timing
- ✅ Idle timeout system (15 seconds)
- ✅ Pipboy-style terminal UI aesthetic
- ✅ Hand cursor with hover effects
- ✅ Countdown interface for scene transitions
- ✅ WebSocket communication between Python and browser
- ✅ Kiosk mode operation

### In Progress
- 🔄 Performance optimization and testing
- 🔄 Error handling improvements
- 🔄 Installation automation

### Pending
- ⏳ Remote monitoring capabilities
- ⏳ Advanced gesture recognition
- ⏳ Scene configuration interface
- ⏳ Analytics and usage tracking

## Debugging Notes

### Common Issues
1. **Hand cursor not visible**: Scene handlers now managed by SceneManager with proper delegation
2. **Idle timeout not working**: Check JavaScript idle management in index.html
3. **Scene transitions failing**: Verify WebSocket connection and event handling
4. **Performance drops**: Monitor MediaPipe processing and frame rate
5. **Scene handler errors**: Main app delegates to SceneManager for all scene handling
6. **HUD visibility issues**: Use CSS classes (controls-hud-hidden) for proper HUD control

### Testing Checklist
- [ ] Hand tracking responsive at 30+ FPS
- [ ] All scenes load without errors
- [ ] Idle timeout activates after 15 seconds
- [ ] Hand cursor appears and follows movement
- [ ] Countdown triggers scene transitions
- [ ] All scenes work offline
- [ ] Kiosk mode operates fullscreen

## Key File Locations

### Core Application Files
- `main.py` - Application entry point
- `hand_tracker.py` - MediaPipe hand tracking implementation
- `scene_manager.py` - Scene cycling and management
- `web_app.py` - Flask server and WebSocket handling
- `event_system.py` - Event bus for component communication

### Frontend Files
- `static/index.html` - Main kiosk interface
- `static/scenes/welcome.html` - Welcome screen with instructions
- `static/scenes/idle.html` - Screensaver mode
- `static/scenes/*/index.html` - Individual scene implementations

### Configuration Files
- `requirements.txt` - Python dependencies
- `debug_settings.json` - Debug configuration
- `CLAUDE.md` - Original project instructions (legacy)

## Common Commands

### Development
```bash
# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run application
python main.py

# Run in kiosk mode
python main.py --kiosk
```

### Debugging
```bash
# Check hand tracking
python -c "import mediapipe; print('MediaPipe OK')"

# Test Flask server
curl http://localhost:5000/health

# Monitor logs
tail -f application.log
```

## Prompt Templates

### Continue Work
```
Review `claude.md`, `planning.md`, and `tasks.md`, then complete the next uncompleted task.
```

### Specific Task
```
Complete the task named '[Task Description]' from `tasks.md` and mark it as complete.
```

### Add New Task
```
Add a new task to `tasks.md`: '[Task Description]'. Do not start working on it yet.
```

### End Session
```
Add a session summary of our work to `claude.md`.
```

## Project Constraints Reminder

### Technical Constraints
- Must work offline (no internet dependencies)
- Single Python application (no build process)
- M4 Mac Mini target hardware
- Camera-only input (no touch/keyboard)

### Performance Requirements
- 30-60 FPS hand tracking
- <33ms latency for interactions
- <500MB RAM usage
- 99.9% uptime for unattended operation

### User Experience
- Zero-instruction operation
- Immediate hand detection feedback
- Clear visual indicators
- Accessible to all ages

Remember: This is a kiosk installation that must operate reliably without supervision. Every change should consider the unattended operation requirement.

## Original Project Architecture

### Project Overview
Building a single-app hand tracking system that captures hand movements via camera and translates them to coordinates for real-time interaction. Will run on M4 Mac Mini in kiosk mode.

## Final Architecture Decision

### Technology Stack
- **Python** with **webview** for embedded browser
- **MediaPipe** for hand tracking (GPU/Neural Engine accelerated)
- **Flask + SocketIO** for internal communication
- **OpenCV** for camera capture

### Single-App Architecture
```python
import webview
import threading
from flask import Flask
from flask_socketio import SocketIO

# Hand tracking runs in background thread
# Flask serves HTML/JS 
# webview displays the app
# All launched from single main.py
```

### Kiosk Mode Features
- **webview** configured for fullscreen, frameless, non-resizable
- **LaunchAgent** for auto-start on boot/restart
- **Error recovery** with auto-restart and health monitoring
- **Remote management** via SSH and logging

### Performance Considerations
- **MediaPipe**: C++ backend with M4 Neural Engine acceleration
- **Expected**: 30-60 FPS with ~16-33ms latency
- **Python role**: Just orchestrates pipeline, heavy ML runs in C++
- **Scalable**: Easy to add gesture detection and person detection later

### Benefits
- Single `python main.py` launch
- No build process needed
- ~10MB footprint vs 100MB+ for Electron
- Fast development cycle
- Robust for headless kiosk deployment

## Scene Management System

### Architecture Features
- **Multiple Interactive Scenes**: Welcome, Particles, Paint, Music, Gallery
- **Auto-Cycling**: Configurable timing for each scene (30-50 seconds)
- **Parent Overlay**: Shows scene info during transitions
- **Manual Controls**: Next/Previous scene, toggle auto-cycle
- **Event-Driven**: Scene transitions trigger WebSocket events

### Scene Structure
Each scene is a self-contained HTML file with:
- Scene-specific CSS styling
- JavaScript interaction handlers
- Hand tracking integration
- Custom visual effects

### Event Flow
```
Scene Manager → Scene Events → WebSocket → Browser
    ↓
[scene_transition_start, scene_changed, scene_transition_end]
    ↓
Parent overlay shows scene info → Scene loads → Overlay hides
```

## Implementation Complete

### Key Files Structure
```
main.py                    # Main application entry point
event_system.py           # Event bus and event types
hand_tracker.py           # MediaPipe hand tracking with events
scene_manager.py          # Scene cycling and management
web_app.py               # Flask server and WebSocket handling
static/
    - index.html          # Main kiosk interface with overlay
    - scenes/
        - welcome.html    # Welcome scene with instructions
        - particles.html  # Interactive particle system
        - paint.html      # Gesture-based painting
        - (more scenes)   # Music visualizer, gallery, etc.
requirements.txt         # Python dependencies
```

### Usage
```bash
# Install dependencies
pip install -r requirements.txt

# activate
source venv/bin/activate

# Run the application
python main.py

# Run in kiosk mode (fullscreen, frameless)
python main.py --kiosk
```

### Scene Controls
- **Manual Navigation**: Left panel buttons (Prev/Next/Auto)
- **Debug Panel**: Top-right toggle for development info
- **WebSocket Commands**: `next_scene`, `previous_scene`, `toggle_auto_cycle`
- **Hand Interactions**: Scene-specific gesture controls

## Development Principles

### Code Organization
- Python classes should follow single responsibility principal and should be broken up as such.

## Apple Notifier MCP Integration

### Notification Requirements
- **ALWAYS** send notification when task is completed or stopped
- **ALWAYS** send notification when prompting user for input
- If apple-notifier-mcp is not installed, tell user to run:
  ```bash
  claude mcp add notification -- npx -y @smithery/cli install apple-notifier-mcp --client claude
  ```

### Notification Steps
1. Use apple-notifier-mcp library
2. Import the necessary module  
3. Call the notification function with title and message
4. Customize notification parameters as needed

### Usage Examples
```python
# Task completion notification
send_notification("Task Complete", "Hand tracking optimization finished")

# User prompt notification  
send_notification("Input Required", "Please review the changes and confirm")
```

## Project Constraints
- All libs must be local and not urls. This project will be run offline
- All websites/scenes/scripts must work offline. This project will not have internet

## Recent Architectural Changes (Session 5)

### Mode/Scene Management Refactoring
- **Separation of Concerns**: ModeManager now handles mode-specific scenes (idle, onboarding)
- **SceneManager Focus**: SceneManager now only handles interactive content cycling (active mode)
- **Improved Delegation**: Main app delegates all scene handling to SceneManager for consistency

### Scene Handler Architecture
```
Main App → SceneManager → Scene Handlers
- idle: handled by ModeManager.onEnterIdle()
- onboarding: handled by SceneManager.sceneHandlers.onboarding
- active scenes: handled by SceneManager for auto-cycling
```

### HUD Management Improvements
- **CSS-First Approach**: Use `controls-hud-hidden` class for HUD visibility
- **Mode-Specific Control**: HUD automatically hidden in idle/onboarding modes
- **Debug Settings Integration**: Respects user preferences while enforcing mode requirements

### Error Handling Patterns
- **Null Safety**: Always check object existence before property access
- **Graceful Degradation**: Fallback mechanisms for scene loading failures
- **Proper Initialization**: Mode managers initialize current state on startup

### Visual Enhancements
- **Bloom Optimization**: Reduced bloom intensity from 0.3 to 0.15 for better visual balance
- **Responsive Design**: Maintains pipboy aesthetic while improving readability