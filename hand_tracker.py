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
    def __init__(self, event_bus: EventBus, production_mode: bool = False):
        self.event_bus = event_bus
        self.production_mode = production_mode
        
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
        
        # Stable hand tracking
        self.tracked_hands = {}  # stable_id -> hand_data
        self.next_hand_id = 0
        self.max_tracking_distance = 0.3  # Maximum distance to consider same hand
        
        # Video processing (disabled in production mode for performance)
        self.enable_video_processing = not production_mode
        
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
        
        current_hands = []
        raw_hand_landmarks = []
        if results.multi_hand_landmarks:
            for idx, hand_landmarks in enumerate(results.multi_hand_landmarks):
                # Extract hand data
                hand_data = self._extract_hand_data(hand_landmarks, frame.shape)
                # Store landmark index for video processing
                hand_data['_landmark_index'] = idx
                current_hands.append(hand_data)
                raw_hand_landmarks.append(hand_landmarks)
                
        # Update stable hand tracking
        current_hands = self._update_stable_hand_tracking(current_hands)
        
        # Video processing (only in development mode)
        if self.enable_video_processing:
            # Create debug frame for visualization
            debug_frame = frame.copy()
            
            # Draw with stable IDs - need to map back to landmarks
            hand_landmarks_map = {}
            for i, hand_data in enumerate(current_hands):
                if i < len(raw_hand_landmarks):
                    hand_landmarks_map[hand_data['hand_id']] = raw_hand_landmarks[i]
            
            for hand_data in current_hands:
                hand_id = hand_data['hand_id']
                if hand_id in hand_landmarks_map:
                    hand_landmarks = hand_landmarks_map[hand_id]
                    
                    # Draw landmarks and connections
                    self.mp_drawing.draw_landmarks(
                        debug_frame, 
                        hand_landmarks, 
                        self.mp_hands.HAND_CONNECTIONS,
                        self.mp_drawing_styles.get_default_hand_landmarks_style(),
                        self.mp_drawing_styles.get_default_hand_connections_style()
                    )
                    
                    # Draw bounding box with stable ID
                    self._draw_hand_bounding_box(debug_frame, hand_landmarks, hand_id)
            
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
        
    def _update_stable_hand_tracking(self, detected_hands):
        """Update stable hand tracking to maintain consistent IDs"""
        import math
        
        # Calculate distances between current hands and tracked hands
        def calculate_distance(hand1, hand2):
            """Calculate distance between two hand palm centers"""
            p1 = hand1['palm_center']
            p2 = hand2['palm_center']
            return math.sqrt((p1['x'] - p2['x'])**2 + (p1['y'] - p2['y'])**2)
        
        # Create list to hold hands with stable IDs
        stable_hands = []
        used_stable_ids = set()
        
        # Match detected hands to existing tracked hands
        for detected_hand in detected_hands:
            best_match_id = None
            best_distance = float('inf')
            
            # Find closest existing tracked hand
            for stable_id, tracked_hand in self.tracked_hands.items():
                if stable_id in used_stable_ids:
                    continue
                    
                distance = calculate_distance(detected_hand, tracked_hand)
                if distance < self.max_tracking_distance and distance < best_distance:
                    best_distance = distance
                    best_match_id = stable_id
            
            # Assign stable ID
            if best_match_id is not None:
                # Matched to existing hand
                detected_hand['hand_id'] = best_match_id
                used_stable_ids.add(best_match_id)
            else:
                # New hand detected
                detected_hand['hand_id'] = self.next_hand_id
                self.next_hand_id += 1
            
            stable_hands.append(detected_hand)
        
        # Update tracked hands dictionary
        new_tracked_hands = {}
        for hand in stable_hands:
            new_tracked_hands[hand['hand_id']] = hand
        
        self.tracked_hands = new_tracked_hands
        
        # Sort hands by their stable ID to maintain consistent ordering
        stable_hands.sort(key=lambda h: h['hand_id'])
        
        return stable_hands
        
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
        if not self.enable_video_processing:
            return None
        with self.frame_lock:
            return self.current_frame.copy() if self.current_frame is not None else None
            
