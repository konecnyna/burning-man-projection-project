# Project Tasks & Milestones

## Current Status
**Phase:** Polish & Deployment  
**Last Updated:** Session 4  
**Priority Focus:** Performance optimization and production readiness

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

## Duplicate-instance defects (Session 5)

Symptom: two terminals opening at login and two fullscreen webviews running at
once. Three independent causes; two are fixed in code, one needs a change to
system state on the deployment box.

- [x] **Settle delay ran before the single-instance guards** — two copies
      starting together each ran the guards while the other slept, so both saw
      a free port and proceeded. Delay now happens first (`start-atlantis.sh`).
- [x] **Pidfile guard matched only `main.py`** — during the settle delay the
      recorded PID is still bash, so a live copy looked like a recycled PID and
      had its pidfile deleted. Now matches every phase of the launch, and the
      claim itself is atomic via `noclobber`.
- [x] **A failed bind did not stop startup** — `socketio.run()` raises inside
      the server thread (as `SystemExit`, via Werkzeug), which was discarded;
      the process went on to open a webview onto the other instance's server.
      `run_web_app` now checks the port up front and raises `ServerStartupError`.
- [x] **Remove the `start-atlantis.sh` Login Item on the kiosk box** — verified
      gone on 2026-08-06; `install-kiosk.sh` and `verify-kiosk.sh` both report
      no conflicting Login Item.

## Camera never opened at boot (Session 5) — fixed

`Could not open camera at index 0`, with `OpenCV: not authorized ... (status 0)`
meaning *never asked*. Two independent defects, both fixed and verified on the
deployment box.

- [x] **The app bundle could not hold a TCC identity.** Its `CFBundleExecutable`
      was a shell script, so LaunchServices refused to launch it at all (`open`
      → `-10669`, at any path) and no app identity was ever created; it also
      ended in `exec`, which would have discarded the identity anyway. Replaced
      with an `osacompile` applet — a real Mach-O — generated by
      `deploy/build-app-bundle.sh`, launched by the LaunchAgent via
      `/usr/bin/open -W`, running `start-atlantis.sh` as a child so python
      inherits the app's identity.
- [x] **`HandTracker.start()` gave up permanently.** It opened the camera once
      and `return`ed on failure, so the tracking thread never started and no
      reopen was ever attempted — a camera a second late meant days of blindness.
      Now retries for 30 s (macOS authorises asynchronously; a permitted process
      needs ~3 attempts), then runs blind and keeps retrying, recovering on its
      own.
- [x] Bundle build made idempotent — any rebuild changes the ad-hoc cdhash and
      voids the grant, so `install-kiosk.sh` no longer silently breaks the
      camera. `--force` plus `deploy/grant-camera.sh` to rebuild deliberately.
- [x] `deploy/grant-camera.sh` for the one-time grant; `verify-kiosk.sh` checks
      the bundle is a Mach-O, signed, declares `NSCameraUsageDescription`, is
      launched via `open`, and that the camera is open on the current run.
- [x] `kiosk-ctl.sh stop` fixed — LaunchServices apps are not launchd's
      children, so `bootout` left the applet and python running unsupervised.

**Do not rename the bundle back to `ATLANTIS.app`.** LaunchServices holds a
permanently poisoned record for that path (`-10669`) that survives
`lsregister -u`, `-f`, and a full `-kill -r` rebuild.

### Newly discovered, not yet investigated

- [ ] **KeepAlive restart loop** — on 2026-08-06 the app restarted roughly every
      60s (16:00:42, 16:01:48, 16:02:55, 16:03:52 in `logs/kiosk.out.log`). The
      webview closes and launchd relaunches. `logs/kiosk.err.log` shows
      `WindowServer event port death` just before, so suspect the webview
      content process being killed rather than a Python fault. Unrelated to both
      the duplicate-instance and camera work.
- [ ] **`main.py` ignores SIGTERM while the webview runs** — `kiosk-ctl.sh stop`
      had to escalate to SIGKILL (observed 2026-08-06). The handlers are
      installed, but `webview.start()` owns the main thread, so they may never
      run. A SIGKILLed process does not release the camera cleanly.
- [ ] **Stale `/Library/LaunchDaemons/com.atlantis.burningman2024.plist`** still
      present; `verify-kiosk.sh` warns. Needs sudo:
      `sudo launchctl bootout system/com.atlantis.burningman2024 && sudo rm -f /Library/LaunchDaemons/com.atlantis.burningman2024.plist`
- [ ] **Power settings not applied** — `verify-kiosk.sh` fails on `sleep=1` and
      `disksleep=10`. Needs sudo: `sudo pmset -a sleep 0 disksleep 0`
- [ ] **`kiosk-ctl.sh console` hardcodes Terminal.app** (`deploy/kiosk-ctl.sh:214`)
      regardless of the operator's default terminal. Harmless but confusing when
      it opens a second terminal next to iTerm. Lower priority now that the
      LaunchAgent path has a camera.

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