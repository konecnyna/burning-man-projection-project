#!/usr/bin/env python3

import sys
import os
import time
import signal
import logging
import logging.handlers
import argparse
import webview
from event_system import EventBus, HandTrackingEvents
from web_app import run_web_app
from hand_tracker import HandTracker

logger = logging.getLogger(__name__)

LOG_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'logs')
LOG_FILE = os.path.join(LOG_DIR, 'atlantis.log')


def setup_logging(verbose=False):
    """Log to disk and stdout.

    The installation runs unattended for days, so the file handler rotates
    with a hard cap: 5 MB x 3 backups = 20 MB maximum, forever. A log that can
    fill the disk is worse than no log.
    """
    os.makedirs(LOG_DIR, exist_ok=True)

    fmt = logging.Formatter(
        '%(asctime)s %(levelname)-7s %(name)s: %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S')

    file_handler = logging.handlers.RotatingFileHandler(
        LOG_FILE, maxBytes=5 * 1024 * 1024, backupCount=3)
    file_handler.setFormatter(fmt)

    # Also to stdout, so the LaunchAgent captures it in logs/kiosk.out.log.
    stream_handler = logging.StreamHandler(sys.stdout)
    stream_handler.setFormatter(fmt)

    root = logging.getLogger()
    root.setLevel(logging.DEBUG if verbose else logging.INFO)
    root.handlers.clear()
    root.addHandler(file_handler)
    root.addHandler(stream_handler)

    # Werkzeug logs every request; at frame rate that is pure noise on disk.
    logging.getLogger('werkzeug').setLevel(logging.WARNING)
    logging.getLogger('engineio').setLevel(logging.WARNING)
    logging.getLogger('socketio').setLevel(logging.WARNING)

    return LOG_FILE

class HandTrackingKiosk:
    def __init__(self, headless=False, production_mode=False, port=5000):
        self.event_bus = EventBus()
        self.hand_tracker = HandTracker(self.event_bus)
        self.web_app = None
        self.socketio = None
        self.server_thread = None
        self._stopped = False
        self.headless = headless
        self.production_mode = production_mode
        self.port = port
        
    def start(self):
        """Start the hand tracking kiosk application"""
        # Setup signal handlers for graceful shutdown
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
        
        try:
            # Start web server
            logger.info("Starting web server on localhost:%s (production=%s)",
                        self.port, self.production_mode)
            self.web_app, self.socketio, self.server_thread = run_web_app(
                self.event_bus,
                host='localhost',
                port=self.port,
                debug=False,
                production_mode=self.production_mode
            )
            
            # Give server time to start
            time.sleep(2)
            
            # Start hand tracking
            logger.info("Starting hand tracker")
            self.hand_tracker.start()
            
            # Give hand tracking time to initialize
            time.sleep(1)
            
            # Create webview window (unless headless)
            if not self.headless:
                self.create_window()
            else:
                self.run_headless()
            
        except Exception:
            logger.exception("Fatal error during startup")
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
                # shadow=True,
                frameless=True 
            )
            
            # Start webview (this blocks until window is closed)
            webview.start(debug=False)
            
        except Exception:
            logger.exception("Failed to create or run the webview window")
        finally:
            # webview.start() returning means the window closed. Under the
            # LaunchAgent, KeepAlive relaunches us; log it so an unexplained
            # restart is traceable after the fact.
            logger.warning("Webview window closed; shutting down")
            self.stop()
            
    def stop(self):
        """Stop the application.

        `_stopped` is a latch: stop() is reachable from the signal handler, the
        webview finally-block and main()'s except-block, and must be idempotent.
        """
        if self._stopped:
            return
        self._stopped = True
        logger.info("Shutting down")
            
        # Stop hand tracking
        if self.hand_tracker:
            self.hand_tracker.stop()
            
        # Note: Flask-SocketIO server will stop when main thread ends
        
    def run_headless(self):
        """Run in headless mode - keep the application running without webview"""
        logger.info("Running headless; no webview window")
        try:
            while not self._stopped:
                time.sleep(1)
                
        except KeyboardInterrupt:
            self.stop()
        
    def _signal_handler(self, signum, frame):
        """Handle system signals for graceful shutdown"""
        logger.info("Received signal %s", signum)
        self.stop()
        sys.exit(0)

def main():
    """Main entry point"""
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Hand Tracking Kiosk')
    parser.add_argument('--headless', action='store_true', help='Run in headless mode')
    parser.add_argument('--production', action='store_true', help='Run in production mode')
    # Default comes from ATLANTIS_PORT so main.py and start-atlantis.sh cannot
    # disagree. The launcher and the LaunchAgent both set it; 5000 is only the
    # fallback for a bare `python main.py`.
    parser.add_argument('--port', type=int, default=int(os.environ.get('ATLANTIS_PORT', 5000)),
                        help='Web server port (default: $ATLANTIS_PORT, else 5000)')
    parser.add_argument('--verbose', action='store_true', help='Debug-level logging')
    
    args = parser.parse_args()

    log_file = setup_logging(verbose=args.verbose)
    logger.info("=" * 60)
    logger.info("ATLANTIS starting - port=%s production=%s headless=%s",
                args.port, args.production, args.headless)
    logger.info("Logging to %s", log_file)

    # Create and start the application
    app = HandTrackingKiosk(headless=args.headless, production_mode=args.production, port=args.port)
    
    try:
        app.start()
    except KeyboardInterrupt:
        logger.info("Interrupted by keyboard")
        app.stop()
    except Exception:
        logger.exception("Unhandled error")
        app.stop()
        sys.exit(1)

if __name__ == "__main__":
    main()