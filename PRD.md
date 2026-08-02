# Project Requirements Document (PRD): Hand Tracking Kiosk Application

## Project Overview
**Application Name:** ATLANTIS Hand Tracking Kiosk  
**Version:** 4.20.69  
**Target Platform:** M4 Mac Mini in kiosk mode  
**Purpose:** Interactive hand tracking experience for public installations

## Executive Summary
The ATLANTIS Hand Tracking Kiosk is a single-application system that captures hand movements via camera and translates them to coordinates for real-time interaction with multiple visual scenes. Designed for unattended operation in kiosk environments, it provides an engaging touchless interface for public installations.

## User Stories

### Primary Users: Installation Visitors
- **As a visitor**, I want to see my hands tracked immediately when I approach the kiosk
- **As a visitor**, I want to interact with visual elements using only hand gestures
- **As a visitor**, I want the system to automatically cycle through different experiences
- **As a visitor**, I want clear visual feedback showing where my hands are detected
- **As a visitor**, I want the system to be responsive and engaging without requiring instructions

### Secondary Users: Installation Operators
- **As an operator**, I want the system to start automatically when powered on
- **As an operator**, I want the system to recover from errors automatically
- **As an operator**, I want to monitor system health remotely
- **As an operator**, I want to configure scene timing and behavior

## Functional Requirements

### Core Features
1. **Hand Tracking**
   - Real-time hand detection using MediaPipe
   - Support for multiple hands simultaneously
   - Hand position normalization to screen coordinates
   - Gesture recognition capabilities

2. **Scene Management**
   - Multiple interactive scenes with auto-cycling
   - Configurable scene duration (30-60 seconds)
   - Smooth transitions between scenes
   - Scene-specific interaction handlers

3. **User Interface**
   - Fullscreen kiosk mode operation
   - Visual hand cursor for feedback
   - Countdown timers for interactions
   - Terminal-style aesthetic (pipboy theme)

4. **Idle Management**
   - 15-second idle timeout when no hands detected
   - Screensaver mode with floating logo
   - Automatic return to welcome scene when hands detected
   - Scene cycling pause during idle periods

### Scene Portfolio
1. **Welcome Scene**: Interactive instructions with hand cursor
2. **Fluid Simulation**: WebGL fluid dynamics controlled by hand movements
3. **Cosmic Symbolism**: Navigate through cosmic imagery
4. **Psychedelic Waves**: Shader-based wave visualization
5. **Orbits**: Interactive flight through attractor orbits
6. **Tie Dye**: Hand-controlled pattern creation
7. **Idle Screen**: Screensaver with floating ATLANTIS logo

## Technical Requirements

### Hardware Specifications
- **Platform**: M4 Mac Mini
- **Camera**: Built-in or USB webcam
- **Display**: External monitor/TV for kiosk display
- **Input**: Camera-based hand tracking only
- **Network**: Optional for remote monitoring

### Performance Requirements
- **Frame Rate**: 30-60 FPS hand tracking
- **Latency**: <33ms hand detection to visual feedback
- **Memory**: <500MB RAM usage
- **Storage**: <1GB total footprint
- **Uptime**: 99.9% reliability for unattended operation

### Technology Stack
- **Backend**: Python 3.8+ with MediaPipe, OpenCV, Flask
- **Frontend**: HTML5, CSS3, JavaScript, WebGL
- **Communication**: WebSocket for real-time events
- **UI Framework**: webview for embedded browser
- **Deployment**: Single executable Python application

## Non-Functional Requirements

### Reliability
- Auto-restart on crashes
- Health monitoring and logging
- Graceful error handling
- Offline operation capability

### Usability
- Zero-instruction operation
- Immediate hand detection feedback
- Clear visual indicators
- Accessible to all ages and abilities

### Maintainability
- Modular scene architecture
- Configuration via JSON files
- Comprehensive logging
- Remote monitoring capabilities

### Security
- No network dependencies for core functionality
- Local file system only
- No user data collection
- Secure kiosk mode operation

## Success Metrics

### User Engagement
- **Primary**: Average session duration >2 minutes
- **Secondary**: Successful hand detection rate >95%
- **Tertiary**: Scene completion rate >80%

### System Performance
- **Uptime**: >99% operational availability
- **Response Time**: <100ms average interaction latency
- **Error Rate**: <1% system errors per session

### Installation Success
- **Deployment Time**: <30 minutes setup
- **Training Time**: <5 minutes operator training
- **Maintenance**: <1 hour per month required

## Constraints and Assumptions

### Technical Constraints
- Must run offline without internet connectivity
- Single-application kiosk mode only
- Camera-based interaction only (no touch)
- Limited to Python ecosystem libraries

### Environmental Assumptions
- Controlled lighting conditions
- Stable camera positioning
- Regular power availability
- Minimal physical interference

### User Assumptions
- Users have normal hand mobility
- Users will approach within camera range
- Users expect immediate responsiveness
- Users prefer visual over audio feedback

## Risk Assessment

### High Risk
- **Hand tracking accuracy** in varied lighting conditions
- **System stability** during extended unattended operation
- **Hardware compatibility** across different Mac Mini configurations

### Medium Risk
- **Performance degradation** over time due to memory leaks
- **Scene complexity** impacting frame rate
- **User confusion** without clear instructions

### Low Risk
- **Development timeline** with established technology stack
- **Deployment complexity** with single-app architecture
- **Maintenance requirements** with comprehensive logging

## Acceptance Criteria

### Must Have
- [x] Real-time hand tracking with visual feedback
- [x] Multiple interactive scenes with auto-cycling
- [x] Fullscreen kiosk mode operation
- [x] Idle timeout with screensaver
- [x] Single-command application launch

### Should Have
- [x] Hand cursor with hover effects
- [x] Countdown timers for interactions
- [x] Scene-specific interaction handlers
- [x] Terminal aesthetic styling
- [x] Smooth scene transitions

### Could Have
- [ ] Remote monitoring dashboard
- [ ] Scene configuration interface
- [ ] Advanced gesture recognition
- [ ] Multi-language support
- [ ] Analytics and usage tracking

## Project Timeline

### Phase 1: Core Development (Completed)
- Hand tracking implementation
- Scene management system
- Basic user interface
- Idle management

### Phase 2: Enhanced Interactions (In Progress)
- Hand cursor implementation
- Countdown interfaces
- Scene-specific handlers
- Visual feedback improvements

### Phase 3: Polish & Deployment (Planned)
- Performance optimization
- Error handling improvements
- Documentation completion
- Installation automation

## Conclusion

The ATLANTIS Hand Tracking Kiosk represents a sophisticated yet accessible interactive installation that leverages modern computer vision technology to create engaging user experiences. The project balances technical complexity with operational simplicity, ensuring both compelling user interactions and reliable unattended operation.