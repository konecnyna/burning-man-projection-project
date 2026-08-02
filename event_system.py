from typing import Dict, List, Callable, Any
import logging
import threading
from collections import deque
from dataclasses import dataclass
from datetime import datetime
import json

logger = logging.getLogger(__name__)

@dataclass
class Event:
    type: str
    data: Dict[str, Any]
    timestamp: datetime
    source: str

    def to_dict(self):
        return {
            'type': self.type,
            'data': self.data,
            'timestamp': self.timestamp.isoformat(),
            'source': self.source
        }

class HandTrackingEvents:
    HAND_DETECTED = "hand_detected"
    HAND_LOST = "hand_lost"
    HAND_MOVED = "hand_moved"
    GESTURE_DETECTED = "gesture_detected"
    THUMBS_UP = "thumbs_up"
    THUMBS_DOWN = "thumbs_down"
    PERSON_DETECTED = "person_detected"
    CAMERA_ERROR = "camera_error"
    FRAME_PROCESSED = "frame_processed"
    SYSTEM_READY = "system_ready"
    
    # Scene events
    SCENE_CHANGED = "scene_changed"
    SCENE_TRANSITION_START = "scene_transition_start"
    SCENE_TRANSITION_END = "scene_transition_end"
    SCENE_INTERACTION = "scene_interaction"
    
    # System state events
    SYSTEM_IDLE = "system_idle"
    SYSTEM_ACTIVE = "system_active"

class EventBus:
    def __init__(self):
        self._subscribers: Dict[str, List[Callable]] = {}
        self._lock = threading.Lock()
        # Bounded ring buffer -- this process runs for days.
        self._max_history = 1000
        self._event_history = deque(maxlen=self._max_history)

    def subscribe(self, event_type: str, handler: Callable):
        """Subscribe to specific event types"""
        with self._lock:
            if event_type not in self._subscribers:
                self._subscribers[event_type] = []
            self._subscribers[event_type].append(handler)

    def emit(self, event: Event):
        """Emit event to all subscribers.

        Handlers are invoked *outside* the lock. This runs at frame rate, and
        holding the lock across handler calls means one slow WebSocket client
        stalls the tracking thread and every other publisher.
        """
        with self._lock:
            self._event_history.append(event)   # deque(maxlen=...) trims itself
            handlers = list(self._subscribers.get(event.type, ()))

        for handler in handlers:
            try:
                handler(event)
            except Exception:
                # A broken subscriber must not take down the tracking loop, but
                # it should not vanish silently either -- that hides real bugs
                # for the whole run.
                logger.exception("Event handler failed for %s", event.type)

    def unsubscribe(self, event_type: str, handler: Callable):
        """Remove subscription"""
        with self._lock:
            if event_type in self._subscribers:
                try:
                    self._subscribers[event_type].remove(handler)
                    if not self._subscribers[event_type]:
                        del self._subscribers[event_type]
                except ValueError:
                    pass

    def get_recent_events(self, count: int = 10):
        """Get recent events for debugging"""
        with self._lock:
            return list(self._event_history)[-count:]

    def clear_history(self):
        """Clear event history"""
        with self._lock:
            self._event_history.clear()