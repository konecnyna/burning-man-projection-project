# Project Tasks & Milestones

## Current Status
**Phase:** Polish & Deployment  
**Last Updated:** Session 4  
**Priority Focus:** Performance optimization and production readiness

## Hand tracking audit — findings (2026-08-03)

Measured on the deployment box with a real hand in frame. The tracking pipeline
is healthy; the confidence model is not.

### P1 — `confidence.overall` is mostly a proximity meter, and it gates everything
- [ ] Stop weighting `distance_score` at 0.45 in `_calculate_confidence`
      (`hand_tracker.py`). Apparent hand size is not evidence that something is
      a hand, but it is 45% of the score the parent filters on at 0.7 and idle
      wake filters on at 0.75.
      Measured: hand at normal reach passes 0.7 in **55.9%** of frames; moving
      and further back, **43.1%**; standing back with both hands up,
      `distance` reads **0.000** and **0% of frames pass at all**.
      MediaPipe's own score across the same samples: p50 **0.958**, 99.6% pass.
- [ ] Decide distance policy separately from confidence. On a 140" projector the
      audience stands back on purpose, so "far" must not mean "not a hand".

### P1 — multiple hands are detected and then thrown away
- [ ] Tracker saw 2 hands in **58%** of frames; **0%** of those frames had two
      hands survive the 0.7 filter. Multi-hand is not lost in MediaPipe, it is
      lost in the gate. Fixing the confidence model fixes this.

### P2 — the visibility term is always zero
- [ ] Remove it or replace it. MediaPipe's hand landmarks never populate
      `visibility`, so `avg_visibility` is 0.000 in every sample (388/388), and
      the `else 0.95` fallback cannot fire because the list is non-empty, just
      full of zeros. It is a flat 0.05 of the scale that can never be earned.
      Renormalising the weights alone lifts the 0.7 pass rate 43.1% -> 58.1%.

### P2 — stability compares the wrong hand to the wrong hand
- [ ] `self.previous_hands[hand_idx]` indexes by MediaPipe's detection order,
      but `previous_hands` was reordered by `_assign_persistent_ids`. With two
      hands this can compare hand A against hand B's last position. Key it by
      `hand_id`. Measured impact is small (stability p50 0.978 -> 0.893 with a
      second hand), so this is correctness, not the cause of the gate problem.

### P3 — housekeeping in the per-frame path
- [ ] Set capture resolution explicitly (`CAP_PROP_FRAME_WIDTH/HEIGHT`). Nothing
      sets it, so the negotiated size is whatever the camera defaults to and is
      not logged anywhere. MediaPipe costs ~11ms/frame at any input size, so
      this is about USB bandwidth and memory traffic, not inference.
- [ ] Log the negotiated resolution at startup; it is currently unknowable
      without attaching a debugger.
- [ ] `mediapipe_confidence` is computed twice per hand per frame, identically.
- [ ] Consider dropping `cv2.flip` (0.49ms full-frame copy at 720p) in favour of
      `x -> 1-x` on 21 landmarks. Frontend already assumes a mirrored frame.

### P3 — API currency
- [ ] `mp.solutions.hands` is the legacy API and is frozen; MediaPipe Tasks
      (`HandLandmarker`) is current. Migration needs `hand_landmarker.task`
      vendored into the repo, which means downloading it **while still online**.
      No urgency for behaviour, but the legacy path will not get fixes.

### Measured, healthy — not worth changing
- 29.9 fps, p95 inter-frame gap 36.8ms, jitter 3.4ms
- MediaPipe `process()` ~11.0ms/frame at complexity 0 (13.9ms at complexity 1)
- emit -> browser latency p50 2.0ms, p95 3.1ms
- 334MB RSS, ~62% of one core on the M2
- JSON serialisation 0.022ms/event; 52KB/s at one hand, 194KB/s at four


## Milestone 1: Core Development  COMPLETED
### Hand Tracking System 
- [x] MediaPipe integration for hand detection
- [x] OpenCV camera capture setup
- [x] Hand landmark processing and normalization
- [x] Real-time coordinate mapping to screen space
- [x] Multi-hand support (up to 2 hands)

### Scene Management System 
- [x] Scene configuration and loading system
- [x] Auto-cycling between scenes with configurable timing
- [x] Scene transition events and overlay system
- [x] Manual scene navigation controls
- [x] Scene state management

### Communication Layer 
- [x] Flask web server setup
- [x] WebSocket communication via SocketIO
- [x] Event bus system for component communication
- [x] Real-time hand data streaming to browser
- [x] Scene control commands from browser

## Milestone 2: User Interface & Experience  COMPLETED
### Kiosk Interface 
- [x] Main application HTML/CSS/JS structure
- [x] Fullscreen kiosk mode with webview
- [x] Debug panel with hand tracking visualization
- [x] Manual controls panel (next/prev/auto-cycle)
- [x] Status bar with FPS and connection info

### Visual Styling 
- [x] Pipboy-style terminal aesthetic implementation
- [x] Green terminal color scheme and glowing effects
- [x] Monospace font integration
- [x] Animated UI elements and transitions
- [x] Responsive layout for different screen sizes

### Scene Portfolio 
- [x] Welcome scene with instructions and ASCII art
- [x] Fluid simulation scene (WebGL)
- [x] Cosmic symbolism navigation scene
- [x] Psychedelic waves visualization
- [x] Orbital mechanics scene
- [x] Tie-dye pattern creation scene

## Milestone 3: Advanced Interactions  COMPLETED
### Idle Management System 
- [x] 15-second idle timeout implementation
- [x] Screensaver mode with floating logo
- [x] Automatic return to welcome scene on hand detection
- [x] HUD hiding during idle mode
- [x] Scene cycling pause/resume functionality

### Hand Cursor System 
- [x] Visual hand cursor following hand movement
- [x] Hover effects for interactive elements
- [x] Cursor styling with glow effects
- [x] Scene-specific cursor behaviors
- [x] Smooth cursor animations

### Countdown Interface 
- [x] 3-second countdown timer for interactions
- [x] Visual countdown with circular progress ring
- [x] Hover detection for countdown triggers
- [x] Automatic scene transition on countdown completion
- [x] Countdown cancellation on hover exit

## Milestone 4: Polish & Deployment = IN PROGRESS

### Priority tasks 
- [ ] TASK: Add object tracking event. Make it into particle trails scene.
- [ ] BUG: Add object tracking event. Make it into particle trails scene.


### Performance Optimization =
- [ ] Frame rate consistency monitoring and optimization
- [ ] Memory leak detection and prevention
- [ ] CPU usage optimization for extended operation
- [ ] MediaPipe configuration tuning for M4 Mac Mini
- [ ] Scene loading performance improvements

### Error Handling & Recovery =
- [ ] Camera disconnection error handling
- [ ] WebSocket connection recovery
- [ ] Scene loading failure recovery
- [ ] Memory pressure handling
- [ ] Graceful degradation for low performance

### Production Readiness =
- [ ] Installation automation script
- [ ] macOS LaunchAgent configuration
- [ ] Production logging configuration
- [ ] Configuration file management
- [ ] Update mechanism implementation

### Testing & Validation =
- [ ] Extended operation testing (24+ hours)
- [ ] Performance benchmarking
- [ ] Error scenario testing
- [ ] User acceptance testing
- [ ] Accessibility testing

## Milestone 5: Advanced Features � PENDING

### Monitoring & Analytics �
- [ ] Remote monitoring dashboard
- [ ] Usage analytics collection
- [ ] Performance metrics tracking
- [ ] Error reporting system
- [ ] Health check endpoints

### Enhanced Interactions �
- [ ] Advanced gesture recognition
- [ ] Multi-person tracking support
- [ ] Scene configuration interface
- [ ] Custom scene creation tools
- [ ] Voice feedback integration

### System Administration �
- [ ] Remote configuration management
- [ ] Scene content updates
- [ ] System maintenance tools
- [ ] Backup and recovery procedures
- [ ] Security hardening

## Priority Tasks (Next Session)

### HIGH PRIORITY
1. **Performance Testing** - Run extended tests to identify bottlenecks
2. **Memory Management** - Implement proper cleanup and garbage collection
3. **Error Recovery** - Add robust error handling for camera and WebSocket issues
4. **Installation Script** - Create automated deployment for production

### MEDIUM PRIORITY
1. **Scene Optimization** - Optimize WebGL scenes for consistent performance
2. **Logging Enhancement** - Implement comprehensive logging for debugging
3. **Configuration Management** - Create centralized configuration system
4. **Documentation** - Complete user and operator documentation

### LOW PRIORITY
1. **Remote Monitoring** - Implement basic health monitoring
2. **Scene Editor** - Create interface for scene parameter adjustment
3. **Analytics** - Add usage tracking and reporting
4. **Multi-language** - Add support for multiple languages

## Completed Features Summary

### Core Functionality 
- Real-time hand tracking with MediaPipe (30-60 FPS)
- Multiple interactive scenes with WebGL graphics
- Automatic scene cycling with configurable timing
- Fullscreen kiosk mode operation
- WebSocket-based real-time communication

### User Experience 
- Pipboy-style terminal aesthetic
- Hand cursor with hover effects
- 3-second countdown interface
- Idle timeout with screensaver
- Zero-instruction operation

### Technical Architecture 
- Event-driven component communication
- Modular scene system
- Offline operation capability
- Single Python application deployment
- Cross-platform compatibility

## Known Issues & Limitations

### Performance Issues
- Occasional frame rate drops in complex WebGL scenes
- Memory usage gradually increases during extended operation
- Scene loading can cause temporary stuttering

### User Experience Issues
- Hand cursor may lag in low-light conditions
- Countdown interface requires precise hand positioning
- Scene transitions can be abrupt without proper timing

### Technical Limitations
- Limited to 2 hands maximum
- Requires good lighting conditions
- No gesture recognition beyond basic pointing
- Single camera input only

## Development Notes

### Code Quality
- Follow single responsibility principle for Python classes
- Maintain consistent coding style across all files
- Use proper error handling and logging
- Keep offline operation as priority

### Testing Strategy
- Test all features with virtual environment activated
- Verify performance under various lighting conditions
- Validate error recovery mechanisms
- Test extended operation scenarios

### Deployment Considerations
- Ensure all dependencies are local and offline-capable
- Test installation process on clean M4 Mac Mini
- Verify LaunchAgent configuration for auto-start
- Document troubleshooting procedures

## Session Planning

### Next Session Focus
1. Review and complete performance optimization tasks
2. Implement robust error handling and recovery
3. Create production deployment automation
4. Conduct comprehensive testing

### Future Session Ideas
- Advanced gesture recognition implementation
- Remote monitoring dashboard development
- Scene configuration interface creation
- Multi-language support addition

## Task Completion Guidelines

### Marking Tasks Complete
- Task must be fully implemented and tested
- Code must be committed to version control
- Documentation must be updated if applicable
- Performance impact must be evaluated

### Adding New Tasks
- Break down complex features into smaller tasks
- Assign appropriate priority levels
- Include acceptance criteria
- Estimate effort and dependencies

### Task Dependencies
- Core functionality before advanced features
- Performance optimization before production deployment
- Error handling before unattended operation
- Testing before release

This task list provides a comprehensive roadmap for completing the ATLANTIS Hand Tracking Kiosk project while maintaining focus on reliability, performance, and user experience.