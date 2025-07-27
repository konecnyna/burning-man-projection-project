import cv2
import mediapipe as mp
import numpy as np
import threading
import time
from datetime import datetime
from typing import List, Dict, Optional
from event_system import Event, EventBus, HandTrackingEvents

class HandTracker:
    """
    Hand tracking using MediaPipe directly
    """
    def __init__(self, event_bus: EventBus):
        self.event_bus = event_bus
        
        # Use MediaPipe directly like in your working implementation
        self.mp_hands = mp.solutions.hands
        self.mp_drawing = mp.solutions.drawing_utils
        self.mp_drawing_styles = mp.solutions.drawing_styles
        
        self.hands = self.mp_hands.Hands(
            max_num_hands=4,
            min_detection_confidence=0.6,
            min_tracking_confidence=0.2,
            model_complexity=0
        )
        
        self.cap = None
        self.running = False
        self.thread = None
        self.previous_hands = []
        self.fps = 0
        self.last_fps_time = time.time()
        self.frame_count = 0
        self.current_frame = None
        self.frame_lock = threading.Lock()
        
    def start(self, camera_index: int = 0):
        """Start the hand tracking system"""
        if self.running:
            return
            
        self.cap = cv2.VideoCapture(camera_index)
        if not self.cap.isOpened():
            self.event_bus.emit(Event(
                type=HandTrackingEvents.CAMERA_ERROR,
                data={"error": "Could not open camera"},
                timestamp=datetime.now(),
                source="hand_tracker"
            ))
            return
            
        self.running = True
        self.thread = threading.Thread(target=self._tracking_loop)
        self.thread.daemon = True
        self.thread.start()
        
        self.event_bus.emit(Event(
            type=HandTrackingEvents.SYSTEM_READY,
            data={"camera_index": camera_index},
            timestamp=datetime.now(),
            source="hand_tracker"
        ))
        
    def stop(self):
        """Stop the hand tracking system"""
        self.running = False
        if self.thread:
            self.thread.join()
        if self.cap:
            self.cap.release()
            
    def _tracking_loop(self):
        """Main tracking loop running in separate thread"""
        while self.running:
            ret, frame = self.cap.read()
            if not ret:
                self.event_bus.emit(Event(
                    type=HandTrackingEvents.CAMERA_ERROR,
                    data={"error": "Failed to read frame"},
                    timestamp=datetime.now(),
                    source="hand_tracker"
                ))
                time.sleep(0.1)
                continue
                
            # Flip frame horizontally for mirror effect
            frame = cv2.flip(frame, 1)
            
            # Process frame
            self._process_frame(frame)
            
            # Calculate FPS
            self._update_fps()
            
    def _process_frame(self, frame):
        """Process single frame for hand detection"""
        # Convert BGR to RGB for MediaPipe
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Process with MediaPipe
        results = self.hands.process(rgb_frame)
        
        # Create debug frame for visualization
        debug_frame = frame.copy()
        
        current_hands = []
        if results.multi_hand_landmarks:
            for idx, hand_landmarks in enumerate(results.multi_hand_landmarks):
                # Extract hand data
                hand_data = self._extract_hand_data(hand_landmarks, frame.shape)
                hand_data['hand_id'] = idx
                current_hands.append(hand_data)
                
                # Draw landmarks and connections
                self.mp_drawing.draw_landmarks(
                    debug_frame, 
                    hand_landmarks, 
                    self.mp_hands.HAND_CONNECTIONS,
                    self.mp_drawing_styles.get_default_hand_landmarks_style(),
                    self.mp_drawing_styles.get_default_hand_connections_style()
                )
                
                # Draw bounding box
                self._draw_hand_bounding_box(debug_frame, hand_landmarks, idx)
        
        # Add debug overlay
        cv2.putText(debug_frame, f"Hands: {len(current_hands)}", (10, 30), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        cv2.putText(debug_frame, f"FPS: {int(self.fps)}", (10, 60), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        cv2.putText(debug_frame, "MEDIAPIPE", (10, 90), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 2)
                
        # Store debug frame for video streaming
        with self.frame_lock:
            self.current_frame = debug_frame
                
        # Emit events based on state changes
        self._emit_hand_events(current_hands)
        
        # Always emit frame processed event
        self.event_bus.emit(Event(
            type=HandTrackingEvents.FRAME_PROCESSED,
            data={
                "hands": current_hands,
                "fps": self.fps,
                "frame_shape": frame.shape
            },
            timestamp=datetime.now(),
            source="hand_tracker"
        ))
        
        self.previous_hands = current_hands
        
    def _extract_hand_data(self, hand_landmarks, frame_shape) -> Dict:
        """Extract normalized hand data from MediaPipe landmarks"""
        height, width = frame_shape[:2]
        
        landmarks = []
        for lm in hand_landmarks.landmark:
            landmarks.append({
                'x': lm.x,
                'y': lm.y,
                'z': lm.z
            })
            
        # Key landmarks
        wrist = landmarks[0]
        thumb_tip = landmarks[4]
        index_tip = landmarks[8]
        middle_tip = landmarks[12]
        ring_tip = landmarks[16]
        pinky_tip = landmarks[20]
        
        # Calculate palm center
        palm_center = {
            'x': (wrist['x'] + landmarks[5]['x'] + landmarks[9]['x'] + landmarks[13]['x'] + landmarks[17]['x']) / 5,
            'y': (wrist['y'] + landmarks[5]['y'] + landmarks[9]['y'] + landmarks[13]['y'] + landmarks[17]['y']) / 5,
            'z': (wrist['z'] + landmarks[5]['z'] + landmarks[9]['z'] + landmarks[13]['z'] + landmarks[17]['z']) / 5
        }
        
        return {
            'landmarks': landmarks,
            'palm_center': palm_center,
            'wrist': wrist,
            'fingertips': {
                'thumb': thumb_tip,
                'index': index_tip,
                'middle': middle_tip,
                'ring': ring_tip,
                'pinky': pinky_tip
            }
        }
        
    def _draw_hand_bounding_box(self, frame, hand_landmarks, hand_id):
        """Draw bounding box around detected hand"""
        height, width = frame.shape[:2]
        
        # Get all landmark coordinates
        x_coords = [lm.x * width for lm in hand_landmarks.landmark]
        y_coords = [lm.y * height for lm in hand_landmarks.landmark]
        
        # Calculate bounding box
        min_x = int(min(x_coords))
        max_x = int(max(x_coords))
        min_y = int(min(y_coords))
        max_y = int(max(y_coords))
        
        # Add padding
        padding = 20
        min_x = max(0, min_x - padding)
        max_x = min(width, max_x + padding)
        min_y = max(0, min_y - padding)
        max_y = min(height, max_y + padding)
        
        # Define unique colors for each hand (BGR format for OpenCV)
        hand_colors = [
            (0, 255, 0),    # Green for hand 0
            (0, 0, 255),    # Red for hand 1  
            (255, 0, 0),    # Blue for hand 2
            (0, 255, 255),  # Yellow for hand 3
            (255, 0, 255),  # Magenta for hand 4
            (255, 255, 0),  # Cyan for hand 5
            (128, 255, 128), # Light green for hand 6
            (128, 128, 255), # Light red for hand 7
        ]
        
        # Get unique color for this hand
        color = hand_colors[hand_id % len(hand_colors)]
        
        # Draw thick bounding box
        cv2.rectangle(frame, (min_x, min_y), (max_x, max_y), color, 3)
        
        # Draw hand label with background for better visibility
        label = f"Hand {hand_id}"
        (text_width, text_height), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
        cv2.rectangle(frame, (min_x, min_y - text_height - 10), (min_x + text_width + 10, min_y), color, -1)
        cv2.putText(frame, label, (min_x + 5, min_y - 5), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        
    def _emit_hand_events(self, current_hands: List[Dict]):
        """Emit hand detection and movement events"""
        prev_count = len(self.previous_hands)
        curr_count = len(current_hands)
        
        # Hand detection/loss events
        if curr_count > prev_count:
            self.event_bus.emit(Event(
                type=HandTrackingEvents.HAND_DETECTED,
                data={
                    "hands": current_hands,
                    "new_hands": curr_count - prev_count
                },
                timestamp=datetime.now(),
                source="hand_tracker"
            ))
        elif curr_count < prev_count:
            self.event_bus.emit(Event(
                type=HandTrackingEvents.HAND_LOST,
                data={
                    "hands": current_hands,
                    "lost_hands": prev_count - curr_count
                },
                timestamp=datetime.now(),
                source="hand_tracker"
            ))
            
        # Hand movement events
        if current_hands:
            self.event_bus.emit(Event(
                type=HandTrackingEvents.HAND_MOVED,
                data={
                    "hands": current_hands,
                    "timestamp": datetime.now().isoformat()
                },
                timestamp=datetime.now(),
                source="hand_tracker"
            ))
            
    def _update_fps(self):
        """Update FPS calculation"""
        self.frame_count += 1
        current_time = time.time()
        
        if current_time - self.last_fps_time >= 1.0:
            self.fps = self.frame_count / (current_time - self.last_fps_time)
            self.frame_count = 0
            self.last_fps_time = current_time
            
    def get_current_frame(self):
        """Get the current frame for video streaming"""
        with self.frame_lock:
            return self.current_frame.copy() if self.current_frame is not None else None
            
