import json
import os
import secrets
import socket
import time

from flask import Flask, request, send_from_directory, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room
import logging
import threading
from collections import deque
from datetime import datetime
from typing import Dict, Set
from event_system import Event, EventBus, HandTrackingEvents

logger = logging.getLogger(__name__)

# --------------------------------------------------------------------------
# Offline enforcement.
#
# The installation has no internet. This Content-Security-Policy is sent on
# every response, so the browser itself refuses to load anything off-box no
# matter what a scene asks for. A remote reference becomes an immediate,
# logged, local failure instead of a DNS hang that looks like a frozen scene.
#
# 'unsafe-inline' and 'unsafe-eval' are required: scenes are self-contained
# HTML with inline <script>/<style>, and some vendored libraries build
# functions dynamically. Neither weakens the part that matters here — origins.
# Every directive is same-origin only, so inline code still cannot fetch
# anything remote.
#
# connect-src is built per request from the Host header rather than hardcoded.
# Some browsers treat ws:/wss: as distinct from 'self', so the WebSocket origin
# has to be named explicitly -- and once the server can bind 0.0.0.0 that origin
# might be localhost, 127.0.0.1, or a LAN IP depending on how you reached it.
# Naming the serving host keeps this same-origin-only while still working
# whichever address was used.
# --------------------------------------------------------------------------
CSP_STATIC_DIRECTIVES = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "media-src 'self' data: blob:",
    "font-src 'self' data:",
    "frame-src 'self'",
    "child-src 'self' blob:",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'none'",
    "report-uri /csp-report",
]


def build_csp(host_header):
    """Same-origin-only CSP, with the WebSocket origin named explicitly.

    `host_header` is host:port as the browser sent it. Only that host is
    allowed, so this stays as strict as the hardcoded version was.
    """
    connect = ["'self'"]
    if host_header:
        # Strip anything odd; this goes into a response header.
        h = host_header.strip().replace('\r', '').replace('\n', '').replace(' ', '')
        if h and all(c.isalnum() or c in '.:-[]_' for c in h):
            connect += [f"ws://{h}", f"wss://{h}", f"http://{h}"]
    connect += ["ws://localhost:*", "wss://localhost:*", "ws://127.0.0.1:*"]
    return "; ".join(CSP_STATIC_DIRECTIVES + ["connect-src " + " ".join(connect)])


# Kept for anything that wants a representative policy to display.
CONTENT_SECURITY_POLICY = build_csp('localhost')

# Ring buffer of CSP violations reported by the browser. This is the runtime
# proof that offline operation holds: if it stays empty while every scene has
# cycled, nothing tried to reach the network.
CSP_VIOLATIONS = deque(maxlen=200)
CSP_VIOLATIONS_LOCK = threading.Lock()

class WebSocketManager:
    def __init__(self, event_bus: EventBus, socketio: SocketIO):
        self.event_bus = event_bus
        self.socketio = socketio
        self.client_subscriptions: Dict[str, Set[str]] = {}
        self.client_handlers: Dict[str, Dict[str, callable]] = {}
        
    def handle_client_connect(self, client_id: str):
        """Handle new client connection"""
        self.client_subscriptions[client_id] = set()
        self.client_handlers[client_id] = {}
        
    def handle_client_disconnect(self, client_id: str):
        """Handle client disconnection"""
        if client_id in self.client_subscriptions:
            # Unsubscribe from all events
            for event_type in self.client_subscriptions[client_id]:
                if client_id in self.client_handlers and event_type in self.client_handlers[client_id]:
                    self.event_bus.unsubscribe(event_type, self.client_handlers[client_id][event_type])
            
            del self.client_subscriptions[client_id]
            del self.client_handlers[client_id]
            
    def handle_subscription(self, client_id: str, event_types: list):
        """Handle client subscription to events"""
        if client_id not in self.client_subscriptions:
            self.client_subscriptions[client_id] = set()
            self.client_handlers[client_id] = {}
            
        # Unsubscribe from old events
        for event_type in list(self.client_subscriptions[client_id]):
            if event_type in self.client_handlers[client_id]:
                self.event_bus.unsubscribe(event_type, self.client_handlers[client_id][event_type])
                del self.client_handlers[client_id][event_type]
                
        # Subscribe to new events
        self.client_subscriptions[client_id] = set(event_types)
        
        for event_type in event_types:
            handler = self._create_client_handler(client_id)
            self.client_handlers[client_id][event_type] = handler
            self.event_bus.subscribe(event_type, handler)
            
    def _create_client_handler(self, client_id: str):
        """Create event handler for specific client"""
        def handler(event: Event):
            if client_id in self.client_subscriptions:
                self.socketio.emit('event', event.to_dict(), room=client_id)
        return handler

def create_web_app(event_bus: EventBus, production_mode=False):
    """Create Flask app with WebSocket support"""
    app = Flask(__name__, static_folder='static')
    # Random per process rather than a constant committed to the repo. Nothing
    # here depends on sessions surviving a restart, and now that the server can
    # be bound to 0.0.0.0 a hardcoded secret is a real handle for anyone on the
    # network rather than a theoretical one.
    app.config['SECRET_KEY'] = secrets.token_hex(32)
    socketio = SocketIO(app, cors_allowed_origins="*")
    
    ws_manager = WebSocketManager(event_bus, socketio)

    @app.after_request
    def apply_offline_csp(response):
        """Block every off-box load at the browser level.

        Applied to all responses, including scene iframes, so a scene cannot
        opt out of it.
        """
        response.headers['Content-Security-Policy'] = build_csp(request.host)
        return response

    @app.route('/csp-report', methods=['POST'])
    def csp_report():
        """Record a CSP violation reported by the browser.

        Any entry here means something tried to load off-box and was blocked.
        Offline that would have been a hang; this makes it visible and local.
        """
        try:
            payload = request.get_json(force=True, silent=True) or {}
        except Exception:
            payload = {}

        report = payload.get('csp-report', payload)
        entry = {
            'timestamp': datetime.now().isoformat(),
            'blocked_uri': report.get('blocked-uri', 'unknown'),
            'violated_directive': report.get('violated-directive',
                                             report.get('effective-directive', 'unknown')),
            'document_uri': report.get('document-uri', 'unknown'),
            'source_file': report.get('source-file'),
            'line_number': report.get('line-number'),
        }

        with CSP_VIOLATIONS_LOCK:
            CSP_VIOLATIONS.append(entry)

        logger.warning(
            "CSP violation: blocked=%s directive=%s doc=%s src=%s:%s",
            entry['blocked_uri'], entry['violated_directive'],
            entry['document_uri'], entry['source_file'], entry['line_number'])
        return ('', 204)

    @app.route('/api/csp-violations', methods=['GET'])
    def get_csp_violations():
        """Inspect blocked off-box loads. Used by deploy/verify-kiosk.sh."""
        with CSP_VIOLATIONS_LOCK:
            violations = list(CSP_VIOLATIONS)
        return jsonify({
            'count': len(violations),
            'violations': violations,
            'policy': build_csp(request.host),
        })

    @app.route('/api/csp-violations', methods=['DELETE'])
    def clear_csp_violations():
        """Reset the buffer, so a verification run starts from a clean slate."""
        with CSP_VIOLATIONS_LOCK:
            CSP_VIOLATIONS.clear()
        return jsonify({'success': True, 'count': 0})

    @app.route('/')
    def index():
        # Use Flask's send_from_directory for proper static file handling
        return send_from_directory('static', 'index.html')
    
    @app.route('/scenes/<path:filename>')
    def serve_scenes(filename):
        """Serve scene files from static/scenes directory"""
        return send_from_directory('static/scenes', filename)
    
    @app.route('/static/<path:filename>')
    def serve_static(filename):
        """Serve static files"""
        return send_from_directory('static', filename)
    
    
    @app.route('/calibrate')
    def calibrate():
        """Hand-tracking calibration bench.

        Not part of the installation -- a diagnostic page for tuning the
        confidence model and finding the working distance. Deliberately a
        separate URL rather than anything reachable from the kiosk UI, so it
        cannot appear in front of an audience.
        """
        return send_from_directory('static', 'calibrate.html')

    @app.route('/api/calibration', methods=['GET', 'POST'])
    def calibration_runs():
        """Persist and list calibration runs.

        Runs are kept so a later session can compare against today's numbers --
        the point of measuring is being able to tell whether a change helped.
        """
        runs_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                'logs', 'calibration')
        os.makedirs(runs_dir, exist_ok=True)

        if request.method == 'GET':
            try:
                names = sorted((n for n in os.listdir(runs_dir) if n.endswith('.json')),
                               reverse=True)[:40]
            except OSError:
                names = []
            out = []
            for n in names:
                try:
                    with open(os.path.join(runs_dir, n)) as fh:
                        d = json.load(fh)
                    out.append({'file': n, 'label': d.get('label'),
                                'samples': d.get('hand_samples'),
                                'saved': d.get('saved')})
                except (OSError, ValueError):
                    continue
            return jsonify({'runs': out})

        payload = request.get_json(force=True, silent=True) or {}
        label = str(payload.get('label') or 'run')
        # Filename comes from user input, so keep it to a known-safe alphabet
        # rather than trusting it near a path join.
        safe = ''.join(c if (c.isalnum() or c in '-_') else '-' for c in label)[:48] or 'run'
        payload['saved'] = datetime.now().isoformat()
        name = f"{datetime.now().strftime('%Y%m%d-%H%M%S')}-{safe}.json"

        try:
            with open(os.path.join(runs_dir, name), 'w') as fh:
                json.dump(payload, fh, indent=2)
        except OSError as exc:
            logger.error("Could not save calibration run: %s", exc)
            return jsonify({'success': False, 'error': str(exc)}), 500

        # Bounded: this process runs for days and the page is easy to leave
        # recording. Keep the newest 200 and drop the rest.
        try:
            files = sorted(n for n in os.listdir(runs_dir) if n.endswith('.json'))
            for stale in files[:-200]:
                os.remove(os.path.join(runs_dir, stale))
        except OSError:
            pass

        logger.info("Calibration run saved: %s", name)
        return jsonify({'success': True, 'file': name})

    @app.route('/health')
    def health():
        with CSP_VIOLATIONS_LOCK:
            csp_count = len(CSP_VIOLATIONS)
        return {
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            # Non-zero means something tried to load off-box and was blocked.
            'csp_violations': csp_count,
        }
    
    @app.route('/api/production-mode')
    def get_production_mode():
        """Get production mode status"""
        return jsonify({'production_mode': production_mode})
    


    @socketio.on('connect')
    def handle_connect():
        client_id = request.sid
        join_room(client_id)
        ws_manager.handle_client_connect(client_id)
        emit('connected', {'client_id': client_id})
        
    @socketio.on('disconnect')
    def handle_disconnect():
        client_id = request.sid
        leave_room(client_id)
        ws_manager.handle_client_disconnect(client_id)
        
    @socketio.on('subscribe')
    def handle_subscribe(data):
        client_id = request.sid
        event_types = data.get('events', [])
        ws_manager.handle_subscription(client_id, event_types)
        emit('subscribed', {'events': event_types})
        
    @socketio.on('unsubscribe')
    def handle_unsubscribe(data):
        client_id = request.sid
        ws_manager.handle_subscription(client_id, [])
        emit('unsubscribed', {})
        
    @socketio.on('get_recent_events')
    def handle_get_recent_events(data):
        count = data.get('count', 10)
        recent_events = event_bus.get_recent_events(count)
        emit('recent_events', [event.to_dict() for event in recent_events])
        
    return app, socketio

class ServerStartupError(RuntimeError):
    """The web server could not be started. Fatal: there is nothing to show."""


# Generous, because a cold start on the Mac mini is slow. This is only ever
# reached when something is badly wrong, so waiting a while costs nothing.
SERVER_START_TIMEOUT = 20.0


def _assert_port_free(host, port):
    """Raise ServerStartupError if something already holds host:port.

    This has to happen here, in the main thread, before the server starts.
    Neither of the obvious alternatives works:

      * Watching the server thread for an error. Werkzeug handles EADDRINUSE by
        printing to stderr and calling sys.exit(), which raises SystemExit --
        not an Exception -- inside a thread, where Python discards it silently.
      * Probing the port afterwards. When the conflict is a second copy of the
        kiosk, the other instance is listening on exactly the port we would
        probe, so the probe *succeeds* and reports our dead server as healthy.
        That is the original bug, not a fix for it.

    SO_REUSEADDR is set deliberately, to match what Werkzeug's HTTPServer does
    (allow_reuse_address = 1). Without it this check would be stricter than the
    real bind and would reject a port merely sitting in TIME_WAIT -- which is
    the normal state right after a restart, and under KeepAlive that would turn
    every relaunch into a failure. SO_REUSEADDR permits TIME_WAIT reuse but
    still refuses a port with a live listener, which is the case we care about.
    """
    bind_host = '0.0.0.0' if host in ('', '*') else host
    probe = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    probe.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    try:
        probe.bind((bind_host, port))
    except OSError as exc:
        raise ServerStartupError(f"cannot bind {bind_host}:{port}: {exc}") from exc
    finally:
        probe.close()


def _wait_until_serving(server_thread, startup_error, host, port,
                        timeout=SERVER_START_TIMEOUT):
    """Block until the server accepts a connection, or raise ServerStartupError.

    Only meaningful because _assert_port_free() ran first: it establishes that
    nobody else was on this port a moment ago, so a connection that answers now
    is ours.
    """
    # 0.0.0.0 and :: mean "every interface" -- you cannot connect *to* them,
    # so probe the loopback address they include.
    probe_host = '127.0.0.1' if host in ('0.0.0.0', '', '*', '::') else host

    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        if startup_error:
            raise ServerStartupError(
                f"could not bind {host}:{port}: {startup_error[0]}") from startup_error[0]
        if not server_thread.is_alive():
            raise ServerStartupError(
                f"server thread for {host}:{port} exited during startup")
        try:
            with socket.create_connection((probe_host, port), timeout=0.5):
                logger.info("Web server accepting connections on %s:%s", probe_host, port)
                return
        except OSError:
            time.sleep(0.1)

    raise ServerStartupError(
        f"server did not accept connections on {probe_host}:{port} within {timeout:.0f}s")


def run_web_app(event_bus: EventBus, host: str = 'localhost', port: int = 5000, debug: bool = False, production_mode: bool = False):
    """Start the web server and block until it is actually serving.

    Raises ServerStartupError if it never comes up -- most often "Address
    already in use", when a second copy of the kiosk is starting.

    Returning only once the port is live is the point. socketio.run() raises
    inside the server thread, where the exception used to die unnoticed: this
    function had already returned its tuple, so main.py carried on and opened a
    fullscreen webview onto a port served by the *other* instance. Two windows,
    two MediaPipe graphs, two cameras grabs, on a box with 8 GB. Failing here
    makes the losing copy exit instead.

    It also replaces the fixed sleep main.py used to do afterwards, so startup
    takes as long as it takes rather than a guess.
    """
    _assert_port_free(host, port)

    app, socketio = create_web_app(event_bus, production_mode)

    # A list, not a plain name: assigning to a closed-over variable from the
    # thread would need `nonlocal`, and append is atomic under the GIL.
    startup_error = []

    def run_server():
        try:
            socketio.run(app, host=host, port=port, debug=debug, use_reloader=False, allow_unsafe_werkzeug=True)
        # BaseException, not Exception: Werkzeug raises SystemExit for a bind
        # failure, and a thread that dies of SystemExit leaves no trace at all.
        except BaseException as exc:  # noqa: BLE001 - anything here is fatal
            startup_error.append(exc)
            logger.exception("Web server thread exited")

    server_thread = threading.Thread(target=run_server, name='web-server')
    server_thread.daemon = True
    server_thread.start()

    _wait_until_serving(server_thread, startup_error, host, port)

    return app, socketio, server_thread