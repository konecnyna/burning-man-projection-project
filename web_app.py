import secrets

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

def run_web_app(event_bus: EventBus, host: str = 'localhost', port: int = 5000, debug: bool = False, production_mode: bool = False):
    """Run the web application"""
    app, socketio = create_web_app(event_bus, production_mode)
    
    def run_server():
        socketio.run(app, host=host, port=port, debug=debug, use_reloader=False, allow_unsafe_werkzeug=True)
    
    server_thread = threading.Thread(target=run_server)
    server_thread.daemon = True
    server_thread.start()
    
    return app, socketio, server_thread