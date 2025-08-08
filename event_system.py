from typing import Dict, List, Callable, Any
import threading
from dataclasses import dataclass
from datetime import datetime
import json

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
        self._event_history: List[Event] = []
        self._max_history = 1000

    def subscribe(self, event_type: str, handler: Callable):
        """Subscribe to specific event types"""
        with self._lock:
            if event_type not in self._subscribers:
                self._subscribers[event_type] = []
            self._subscribers[event_type].append(handler)

    def emit(self, event: Event):
        """Emit event to all subscribers"""
        with self._lock:
            # Store in history
            self._event_history.append(event)
            if len(self._event_history) > self._max_history:
                self._event_history.pop(0)
            
            # Notify subscribers
            if event.type in self._subscribers:
                for handler in self._subscribers[event.type]:
                    try:
                        handler(event)
                    except Exception as e:
                        print(f"Error in event handler: {e}")

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
            return self._event_history[-count:]

    def clear_history(self):
        """Clear event history"""
        with self._lock:
            self._event_history.clear()