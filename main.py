#!/usr/bin/env python3

import sys
import time
import signal
import threading
import argparse
from datetime import datetime
import webview
from event_system import EventBus, HandTrackingEvents
from web_app import run_web_app
from hand_tracker import HandTracker

class HandTrackingKiosk:
    def __init__(self, headless=False, production_mode=False, port=5000):
        self.event_bus = EventBus()
        self.hand_tracker = HandTracker(self.event_bus)
        self.web_app = None
        self.socketio = None
        self.server_thread = None
        self.running = False
        self.headless = headless
        self.production_mode = production_mode
        self.port = port
        
    def start(self):
        """Start the hand tracking kiosk application"""
        print("Starting Hand Tracking Kiosk...")
        
        # Setup signal handlers for graceful shutdown
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
        
        try:
            # Start web server
            print(f"Starting web server on port {self.port}...")
            self.web_app, self.socketio, self.server_thread = run_web_app(
                self.event_bus, 
                self.hand_tracker,
                host='localhost', 
                port=self.port, 
                debug=False,
                production_mode=self.production_mode
            )
            
            # Give server time to start
            time.sleep(2)
            
            # Start hand tracking
            print("Starting hand tracking...")
            self.hand_tracker.start()
            
            # Give hand tracking time to initialize
            time.sleep(1)
            
            # Create webview window (unless headless)
            if not self.headless:
                print("Creating application window...")
                self.create_window()
            else:
                print("Running in headless mode - no window will be created")
                self.run_headless()
            
        except Exception as e:
            print(f"Error starting application: {e}")
            self.stop()
            sys.exit(1)
            
    def create_window(self):
        """Create the webview window"""
        try:
            # Create webview window
            window = webview.create_window(
                title='Hand Tracking Kiosk',
                url=f'http://localhost:{self.port}',
                width=1200,
                height=800,
                resizable=True,
                fullscreen=True,
                minimized=False,
                on_top=False,
                shadow=True,
                frameless=True 
            )
            
            # Start webview (this blocks until window is closed)
            webview.start(debug=True)
            
        except Exception as e:
            print(f"Error creating window: {e}")
        finally:
            # Clean shutdown when window closes
            self.stop()
            
    def stop(self):
        """Stop the application"""
        if self.running:
            return
            
        print("Stopping Hand Tracking Kiosk...")
        self.running = True
            
        # Stop hand tracking
        if self.hand_tracker:
            self.hand_tracker.stop()
            
        # Note: Flask-SocketIO server will stop when main thread ends
        print("Application stopped.")
        
    def run_headless(self):
        """Run in headless mode - keep the application running without webview"""
        try:
            print("Application running in headless mode...")
            print(f"Web server available at http://localhost:{self.port}")
            print("Press Ctrl+C to exit")
            
            # Keep the main thread alive
            while not self.running:
                time.sleep(1)
                
        except KeyboardInterrupt:
            print("\nShutdown requested by user")
            self.stop()
        
    def _signal_handler(self, signum, frame):
        """Handle system signals for graceful shutdown"""
        print(f"Received signal {signum}, shutting down...")
        self.stop()
        sys.exit(0)

def main():
    """Main entry point"""
    print("=" * 50)
    print("Hand Tracking Kiosk v1.0")
    print("=" * 50)
    
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Hand Tracking Kiosk')
    parser.add_argument('--kiosk', action='store_true', help='Run in kiosk mode')
    parser.add_argument('--headless', action='store_true', help='Run in headless mode')
    parser.add_argument('--production', action='store_true', help='Run in production mode')
    parser.add_argument('--port', type=int, default=5000, help='Port to run web server on (default: 5000)')
    
    args = parser.parse_args()
    
    if args.kiosk:
        print("Running in KIOSK MODE")
        # In kiosk mode, you might want to:
        # - Set fullscreen=True and frameless=True in create_window()
        # - Disable window controls
        # - Add auto-restart logic
    
    if args.headless:
        print("Running in HEADLESS MODE")
    
    if args.production:
        print("Running in PRODUCTION MODE - Dev controls hidden")
    
    # Create and start the application
    app = HandTrackingKiosk(headless=args.headless, production_mode=args.production, port=args.port)
    
    try:
        app.start()
    except KeyboardInterrupt:
        print("\nShutdown requested by user")
        app.stop()
    except Exception as e:
        print(f"Fatal error: {e}")
        app.stop()
        sys.exit(1)

if __name__ == "__main__":
    main()