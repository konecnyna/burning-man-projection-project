# Technical Architecture & Planning Document

## Project Overview
**ATLANTIS Hand Tracking Kiosk** - A Python-based interactive installation system that uses MediaPipe for real-time hand tracking and displays multiple visual scenes controlled by hand gestures.

## System Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    M4 Mac Mini (Kiosk Mode)                │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Camera Input  │  │   Main Python   │  │   Display Out   │ │
│  │   (MediaPipe)   │→ │   Application   │→ │   (webview)     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│           │                     │                     │       │
│           ▼                     ▼                     ▼       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  Hand Tracking  │  │  Scene Manager  │  │  Browser Engine │ │
│  │    (OpenCV)     │  │   (Flask+WS)   │  │   (HTML/CSS/JS) │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Core Components

#### 1. Hand Tracking Layer
- **MediaPipe**: Real-time hand detection and landmark tracking
- **OpenCV**: Camera capture and frame processing
- **Performance**: 30-60 FPS with GPU/Neural Engine acceleration
- **Output**: Normalized hand coordinates and gesture data

#### 2. Application Layer
- **Flask**: Web server for serving HTML/CSS/JS
- **SocketIO**: Real-time WebSocket communication
- **Event System**: Decoupled event bus for component communication
- **Scene Manager**: Handles scene transitions and timing

#### 3. Presentation Layer
- **webview**: Embedded browser for kiosk mode
- **HTML5**: Scene content and user interface
- **WebGL**: High-performance visual effects
- **CSS3**: Pipboy-style terminal aesthetics

## Technology Stack

### Backend (Python 3.8+)
```python
# Core Dependencies
mediapipe>=0.10.0    # Hand tracking ML pipeline
opencv-python>=4.8.0 # Camera capture and processing
flask>=2.3.0         # Web server
flask-socketio>=5.3.0 # WebSocket communication
webview>=4.0.0       # Embedded browser

# Supporting Libraries
numpy>=1.24.0        # Numerical computations
threading            # Concurrent processing
json                 # Configuration management
```

### Frontend (Web Technologies)
```html
<!-- Core Technologies -->
HTML5                <!-- Scene structure -->
CSS3                 <!-- Styling and animations -->
JavaScript (ES6+)    <!-- Interaction logic -->
WebGL                <!-- Graphics rendering -->
WebSocket            <!-- Real-time communication -->
SVG                  <!-- Vector graphics -->
```

### System Integration
- **macOS**: Native platform integration
- **Camera**: Built-in or USB webcam
- **Display**: External monitor/TV
- **Network**: Optional for remote monitoring

## File Structure

```
atlantis-kiosk/
├── main.py                     # Application entry point
├── requirements.txt            # Python dependencies
├── PRD.md                      # Project requirements
├── claude.md                   # AI assistant instructions
├── planning.md                 # This file
├── tasks.md                    # Task management
│
├── core/
│   ├── event_system.py         # Event bus implementation
│   ├── hand_tracker.py         # MediaPipe integration
│   ├── scene_manager.py        # Scene cycling logic
│   └── web_app.py              # Flask server and WebSocket
│
├── static/
│   ├── index.html              # Main kiosk interface
│   ├── scenes/
│   │   ├── welcome.html        # Welcome and instructions
│   │   ├── idle.html           # Screensaver mode
│   │   ├── fluidsim/           # Fluid simulation scene
│   │   ├── cosmic-symbolism/   # Cosmic imagery scene
│   │   ├── psychedelic-waves/  # Wave visualization
│   │   ├── orbits/             # Orbital mechanics
│   │   └── tie-dye/            # Pattern creation
│   └── assets/
│       ├── fonts/              # Terminal fonts
│       ├── sounds/             # Audio effects
│       └── images/             # Static images
│
├── config/
│   ├── debug_settings.json     # Debug configuration
│   ├── scene_config.json       # Scene parameters
│   └── kiosk_settings.json     # Kiosk mode settings
│
└── deployment/
    ├── install.sh              # Installation script
    ├── com.atlantis.kiosk.plist # LaunchAgent configuration
    └── requirements-prod.txt    # Production dependencies
```

## Scene Architecture

### Scene Types

#### 1. HTML Fragment Scenes
```html
<!-- Loaded directly into main container -->
<div class="scene welcome-scene">
    <style>/* Scene-specific CSS */</style>
    <div class="scene-content">
        <!-- Scene HTML -->
    </div>
    <script>/* Scene JavaScript */</script>
</div>
```

#### 2. Iframe Scenes
```html
<!-- Complex scenes with full HTML documents -->
<iframe src="/scenes/fluidsim/index.html" 
        style="width: 100%; height: 100%; border: none;">
</iframe>
```

### Scene Handler Pattern
```javascript
// Main application scene handlers
window.sceneHandlers = {
    sceneName: {
        onInit: function() { /* Initialize scene */ },
        onHandMove: function(hands) { /* Handle hand movement */ },
        onHandDetected: function(hands) { /* Handle hand detection */ },
        onHandLost: function() { /* Handle hand loss */ },
        onDestroy: function() { /* Cleanup scene */ }
    }
};
```

## Communication Architecture

### Event-Driven System
```python
# Event Bus Pattern
event_bus = EventBus()

# Components publish events
event_bus.emit(Event(
    type=HandTrackingEvents.HAND_DETECTED,
    data={"hands": hand_landmarks},
    timestamp=datetime.now(),
    source="hand_tracker"
))

# Components subscribe to events
event_bus.subscribe(HandTrackingEvents.HAND_DETECTED, handler)
```

### WebSocket Communication
```javascript
// Browser to Python
socket.emit('next_scene');
socket.emit('pause_scene_cycling');

// Python to Browser
socket.on('hand_moved', function(data) {
    updateHandVisualization(data.hands);
});
```

## Performance Considerations

### Frame Rate Optimization
- **Target**: 30-60 FPS hand tracking
- **Latency**: <33ms from detection to visual feedback
- **Memory**: <500MB RAM usage
- **CPU**: Efficient use of M4 cores

### MediaPipe Optimization
```python
# Optimized MediaPipe configuration
mp_hands = mp.solutions.hands.Hands(
    static_image_mode=False,
    max_num_hands=2,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)
```

### Scene Performance
- **WebGL**: Hardware-accelerated graphics
- **Canvas**: Efficient 2D rendering
- **DOM**: Minimal DOM manipulation
- **Assets**: Optimized image and font loading

## Kiosk Mode Implementation

### Display Configuration
```python
# webview configuration for kiosk mode
webview.create_window(
    title='ATLANTIS Kiosk',
    url='http://localhost:5000',
    width=1920,
    height=1080,
    fullscreen=True,
    resizable=False,
    frameless=True
)
```

### Auto-Start Configuration
```xml
<!-- macOS LaunchAgent -->
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.atlantis.kiosk</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/bin/python3</string>
        <string>/path/to/main.py</string>
        <string>--kiosk</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
```

## State Management

### Application States
```python
class ApplicationState:
    INITIALIZING = "initializing"
    IDLE = "idle"
    ACTIVE = "active"
    TRANSITIONING = "transitioning"
    ERROR = "error"
```

### Scene States
```python
class SceneState:
    LOADING = "loading"
    ACTIVE = "active"
    PAUSED = "paused"
    TRANSITIONING = "transitioning"
```

## Error Handling & Recovery

### Error Categories
1. **Camera Errors**: Hardware disconnection, permission issues
2. **Performance Errors**: Frame rate drops, memory leaks
3. **Scene Errors**: Loading failures, JavaScript errors
4. **Network Errors**: WebSocket disconnections

### Recovery Strategies
```python
# Automatic recovery mechanisms
def handle_camera_error():
    # Attempt to reconnect camera
    # Fall back to demo mode if needed
    
def handle_performance_error():
    # Reduce scene complexity
    # Restart components if necessary
    
def handle_scene_error():
    # Load fallback scene
    # Log error for debugging
```

## Monitoring & Debugging

### Logging Strategy
```python
# Structured logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('atlantis.log'),
        logging.StreamHandler()
    ]
)
```

### Performance Metrics
- Frame rate monitoring
- Memory usage tracking
- Event processing latency
- Scene transition timing

### Debug Features
- Real-time hand tracking visualization
- Performance overlay
- Event history viewer
- Scene state inspector

## Security Considerations

### Kiosk Security
- No file system access from browser
- Restricted network access
- No user input except camera
- Automatic session cleanup

### Privacy Protection
- No hand tracking data storage
- No network transmission of biometric data
- Local processing only
- No user identification

## Deployment Strategy

### Development Environment
```bash
# Local development setup
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

### Production Deployment
```bash
# Kiosk deployment
./deployment/install.sh
launchctl load com.atlantis.kiosk.plist
```

### Update Strategy
- Hot-swappable scene content
- Rolling application updates
- Configuration file updates
- Remote deployment capability

## Testing Strategy

### Unit Tests
- Hand tracking accuracy
- Scene loading performance
- Event system reliability
- WebSocket communication

### Integration Tests
- End-to-end user workflows
- Camera integration
- Scene transitions
- Error recovery

### Performance Tests
- Frame rate consistency
- Memory leak detection
- Long-running stability
- Resource utilization

## Future Enhancements

### Planned Features
- Advanced gesture recognition
- Multi-person tracking
- Scene configuration interface
- Remote monitoring dashboard
- Analytics and usage tracking

### Technical Improvements
- Machine learning model optimization
- Progressive Web App features
- Advanced graphics capabilities
- Multi-language support

## Constraints & Limitations

### Technical Constraints
- Offline operation required
- Single Python application
- Camera-only input
- M4 Mac Mini hardware

### Performance Constraints
- 30-60 FPS minimum
- <33ms latency requirement
- <500MB RAM limit
- 99.9% uptime target

### User Experience Constraints
- Zero-instruction operation
- Immediate responsiveness
- Clear visual feedback
- Universal accessibility

This architecture provides a robust foundation for a reliable, high-performance hand tracking kiosk system that can operate unattended while providing engaging user experiences.