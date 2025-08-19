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
        
        # Persistent hand tracking
        self.tracked_hands = {}  # persistent_id -> hand_data
        self.next_hand_id = 0
        self.max_tracking_distance = 0.08  # Max distance to consider same hand (reduced for better tracking)
        
        # Gesture tracking
        self.previous_gestures = {}  # hand_id -> gesture_name
        self.gesture_hold_time = {}  # hand_id -> timestamp
        
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
        detected_hands = []
        
        if results.multi_hand_landmarks:
            for idx, hand_landmarks in enumerate(results.multi_hand_landmarks):
                # Extract hand data with confidence
                hand_data = self._extract_hand_data(hand_landmarks, frame.shape)
                
                # Add confidence data
                confidence_data = self._calculate_confidence(hand_landmarks, results, idx)
                hand_data['confidence'] = confidence_data
                
                detected_hands.append(hand_data)
                
        # Assign persistent IDs based on position tracking
        current_hands = self._assign_persistent_ids(detected_hands)
        
        # Process gestures and drawing for tracked hands
        for hand_data in current_hands:
            hand_id = hand_data['hand_id']
            
            # Detect thumbs up/down gesture and emit separate events
            gesture = self._detect_thumbs_gesture(hand_data)
            self._emit_gesture_events(hand_id, gesture)
            
            # Draw landmarks and connections (need to find corresponding MediaPipe landmarks)
            if results.multi_hand_landmarks:
                # Find the closest MediaPipe detection to draw
                closest_idx = self._find_closest_mediapipe_detection(hand_data, results.multi_hand_landmarks, frame.shape)
                if closest_idx is not None:
                    self.mp_drawing.draw_landmarks(
                        debug_frame, 
                        results.multi_hand_landmarks[closest_idx], 
                        self.mp_hands.HAND_CONNECTIONS,
                        self.mp_drawing_styles.get_default_hand_landmarks_style(),
                        self.mp_drawing_styles.get_default_hand_connections_style()
                    )
                    
                    # Draw bounding box
                    self._draw_hand_bounding_box(debug_frame, results.multi_hand_landmarks[closest_idx], hand_id)
        
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
    
    def _assign_persistent_ids(self, detected_hands) -> List[Dict]:
        """Assign persistent IDs to detected hands based on position tracking"""
        if not detected_hands:
            # No hands detected, clear all tracked hands
            self.tracked_hands.clear()
            return []
        
        # Calculate distances between detected hands and previously tracked hands
        assignments = {}  # detected_idx -> persistent_id
        used_persistent_ids = set()
        
        # First pass: assign detected hands to closest tracked hands within threshold
        for det_idx, detected_hand in enumerate(detected_hands):
            best_persistent_id = None
            best_distance = float('inf')
            
            for persistent_id, tracked_hand in self.tracked_hands.items():
                if persistent_id in used_persistent_ids:
                    continue
                    
                # Calculate distance between palm centers
                dx = detected_hand['palm_center']['x'] - tracked_hand['palm_center']['x']
                dy = detected_hand['palm_center']['y'] - tracked_hand['palm_center']['y']
                distance = (dx*dx + dy*dy) ** 0.5
                
                if distance < self.max_tracking_distance and distance < best_distance:
                    best_distance = distance
                    best_persistent_id = persistent_id
            
            if best_persistent_id is not None:
                assignments[det_idx] = best_persistent_id
                used_persistent_ids.add(best_persistent_id)
        
        # Second pass: assign new IDs to unassigned detected hands
        for det_idx, detected_hand in enumerate(detected_hands):
            if det_idx not in assignments:
                # Create new persistent ID
                assignments[det_idx] = self.next_hand_id
                self.next_hand_id += 1
        
        # Update tracked hands with current frame data
        new_tracked_hands = {}
        result_hands = []
        
        for det_idx, detected_hand in enumerate(detected_hands):
            persistent_id = assignments[det_idx]
            
            # Add persistent ID to hand data
            detected_hand['hand_id'] = persistent_id
            
            # Store in tracked hands
            new_tracked_hands[persistent_id] = detected_hand.copy()
            result_hands.append(detected_hand)
        
        self.tracked_hands = new_tracked_hands
        return result_hands
    
    def _find_closest_mediapipe_detection(self, hand_data, mediapipe_landmarks, frame_shape) -> Optional[int]:
        """Find the MediaPipe detection closest to our tracked hand for drawing"""
        if not mediapipe_landmarks:
            return None
        
        best_idx = None
        best_distance = float('inf')
        
        for idx, landmarks in enumerate(mediapipe_landmarks):
            # Calculate palm center from MediaPipe landmarks
            wrist = landmarks.landmark[0]
            palm_x = (wrist.x + landmarks.landmark[5].x + landmarks.landmark[9].x + 
                     landmarks.landmark[13].x + landmarks.landmark[17].x) / 5
            palm_y = (wrist.y + landmarks.landmark[5].y + landmarks.landmark[9].y + 
                     landmarks.landmark[13].y + landmarks.landmark[17].y) / 5
            
            # Calculate distance to our tracked hand
            dx = palm_x - hand_data['palm_center']['x']
            dy = palm_y - hand_data['palm_center']['y']
            distance = (dx*dx + dy*dy) ** 0.5
            
            if distance < best_distance:
                best_distance = distance
                best_idx = idx
        
        return best_idx
    
    def _calculate_confidence(self, hand_landmarks, results, hand_idx) -> Dict:
        """Calculate confidence metrics for hand detection"""
        landmarks = hand_landmarks.landmark
        
        # 1. Landmark visibility score (average of all landmark visibility scores)
        visibility_scores = [lm.visibility for lm in landmarks if hasattr(lm, 'visibility')]
        avg_visibility = sum(visibility_scores) / len(visibility_scores) if visibility_scores else 0.95
        
        # 2. Landmark presence score (how many landmarks have reasonable coordinates)
        valid_landmarks = 0
        total_landmarks = len(landmarks)
        for lm in landmarks:
            if 0 <= lm.x <= 1 and 0 <= lm.y <= 1 and -1 <= lm.z <= 1:
                valid_landmarks += 1
        presence_score = valid_landmarks / total_landmarks if total_landmarks > 0 else 0.0
        
        # 3. Hand classification confidence (if available)
        classification_score = 0.95  # Higher default score
        if hasattr(results, 'multi_handedness') and results.multi_handedness:
            if hand_idx < len(results.multi_handedness):
                handedness = results.multi_handedness[hand_idx]
                if hasattr(handedness, 'classification') and handedness.classification:
                    classification_score = handedness.classification[0].score
        
        # 4. Stability score (how much the hand moved since last frame)
        stability_score = 1.0  # Start with perfect stability
        if self.previous_hands and hand_idx < len(self.previous_hands):
            prev_palm = self.previous_hands[hand_idx].get('palm_center', {})
            if prev_palm:
                # Calculate palm center from current landmarks
                wrist = landmarks[0]
                palm_x = (wrist.x + landmarks[5].x + landmarks[9].x + landmarks[13].x + landmarks[17].x) / 5
                palm_y = (wrist.y + landmarks[5].y + landmarks[9].y + landmarks[13].y + landmarks[17].y) / 5
                
                # Calculate movement distance
                dx = palm_x - prev_palm.get('x', palm_x)
                dy = palm_y - prev_palm.get('y', palm_y)
                movement = (dx*dx + dy*dy) ** 0.5
                
                # Convert movement to stability score (less movement = higher stability)
                stability_score = max(0.0, 1.0 - (movement * 8))  # Reduced sensitivity
        
        # 5. Distance score based on hand size (closer hands appear larger)
        # Calculate hand span using key landmarks
        wrist = landmarks[0]
        thumb_tip = landmarks[4]
        index_tip = landmarks[8]
        middle_tip = landmarks[12]
        pinky_tip = landmarks[20]
        
        # Calculate hand span (diagonal distance from wrist to middle finger tip)
        hand_span = ((middle_tip.x - wrist.x)**2 + (middle_tip.y - wrist.y)**2) ** 0.5
        
        # Calculate hand width (thumb tip to pinky tip)
        hand_width = ((thumb_tip.x - pinky_tip.x)**2 + (thumb_tip.y - pinky_tip.y)**2) ** 0.5
        
        # Use average of span and width as size metric
        hand_size = (hand_span + hand_width) / 2
        
        # Convert hand size to distance score
        # Typical hand size range: 0.15 (close) to 0.05 (far)
        # Larger size = closer = higher score
        distance_score = max(0.0, min(1.0, (hand_size - 0.05) / 0.10))
        
        # Boost for very large hands (very close)
        if hand_size > 0.12:
            distance_score = min(1.0, distance_score * 1.1)
        
        # 6. Overall confidence calculation with distance weighting
        # Use MediaPipe's actual confidence if available, otherwise compute our own
        mediapipe_confidence = 0.0
        if hasattr(results, 'multi_handedness') and results.multi_handedness:
            if hand_idx < len(results.multi_handedness):
                handedness = results.multi_handedness[hand_idx]
                if hasattr(handedness, 'classification') and handedness.classification:
                    mediapipe_confidence = handedness.classification[0].score
        
        # Blend MediaPipe confidence with our metrics, heavily weighting distance
        if mediapipe_confidence > 0:
            overall_confidence = (
                mediapipe_confidence * 0.35 +  # MediaPipe base confidence
                distance_score * 0.45 +       # Heavily weight distance (closer = better)
                presence_score * 0.1 +
                avg_visibility * 0.05 +
                stability_score * 0.05
            )
        else:
            # Fallback to our own calculation with heavy distance weighting
            overall_confidence = (
                distance_score * 0.45 +       # Distance is dominant factor
                presence_score * 0.25 +
                avg_visibility * 0.2 +
                stability_score * 0.1
            )
        
        # Apply confidence boost for close, high-quality detections
        if distance_score > 0.8 and presence_score > 0.95:
            overall_confidence = min(1.0, overall_confidence * 1.1)
        
        confidence_result = {
            'overall': round(overall_confidence, 3),
            'visibility': round(avg_visibility, 3),
            'presence': round(presence_score, 3),
            'classification': round(classification_score, 3),
            'stability': round(stability_score, 3),
            'mediapipe': round(mediapipe_confidence, 3),
            'distance': round(distance_score, 3),
            'hand_size': round(hand_size, 4),
            'quality': 'high' if overall_confidence > 0.85 else 'medium' if overall_confidence > 0.7 else 'low'
        }
        
        return confidence_result
    
    def _detect_thumbs_gesture(self, hand_data) -> str:
        """Detect thumbs up/down gesture based on hand landmarks"""
        landmarks = hand_data['landmarks']
        
        # MediaPipe hand landmark indices
        # Thumb: 0(wrist) -> 1 -> 2 -> 3 -> 4(tip)
        # Index: 5 -> 6 -> 7 -> 8(tip)
        # Middle: 9 -> 10 -> 11 -> 12(tip)
        # Ring: 13 -> 14 -> 15 -> 16(tip)
        # Pinky: 17 -> 18 -> 19 -> 20(tip)
        
        thumb_tip = landmarks[4]    # Thumb tip
        thumb_mcp = landmarks[2]    # Thumb MCP joint
        
        index_tip = landmarks[8]
        middle_tip = landmarks[12]
        ring_tip = landmarks[16]
        pinky_tip = landmarks[20]
        
        # Calculate if thumb is extended (tip above MCP joint)
        thumb_extended = thumb_tip['y'] < thumb_mcp['y']
        
        # Calculate average Y position of other fingertips
        other_fingers_y = (index_tip['y'] + middle_tip['y'] + ring_tip['y'] + pinky_tip['y']) / 4
        
        # Check if other fingers are curled (tips below their MCP joints)
        # Use MCP joints (landmarks 5, 9, 13, 17) instead of PIP for more reliable detection
        index_curled = index_tip['y'] > landmarks[5]['y']  # tip below MCP
        middle_curled = middle_tip['y'] > landmarks[9]['y']
        ring_curled = ring_tip['y'] > landmarks[13]['y']
        pinky_curled = pinky_tip['y'] > landmarks[17]['y']
        
        # More lenient: require only 2 out of 4 fingers to be curled
        fingers_curled = sum([index_curled, middle_curled, ring_curled, pinky_curled]) >= 2
        
        # Determine gesture
        if thumb_extended and fingers_curled:
            # Check if thumb is significantly above or below other fingers
            thumb_distance = abs(thumb_tip['y'] - other_fingers_y)
            
            if thumb_distance > 0.05:  # Threshold for significant separation (more sensitive)
                if thumb_tip['y'] < other_fingers_y:
                    return 'thumbs_up'
                else:
                    return 'thumbs_down'
        
        return 'none'
    
    def _emit_gesture_events(self, hand_id: int, current_gesture: str):
        """Emit gesture events when gesture state changes"""
        previous_gesture = self.previous_gestures.get(hand_id, 'none')
        current_time = time.time()
        
        if current_gesture in ['thumbs_up', 'thumbs_down']:
            if hand_id in self.gesture_hold_time:
                # Check if gesture has been held long enough (0.2 seconds)
                hold_duration = current_time - self.gesture_hold_time[hand_id]
                if hold_duration < 0.2:
                    return  # Not stable enough yet
                
                # Emit event only if gesture changed from previous
                if previous_gesture != current_gesture:
                    event_type = HandTrackingEvents.THUMBS_UP if current_gesture == 'thumbs_up' else HandTrackingEvents.THUMBS_DOWN
                    
                    self.event_bus.emit(Event(
                        type=event_type,
                        data={
                            "hand_id": hand_id,
                            "gesture": current_gesture,
                            "confidence": "high",
                            "hold_duration": hold_duration
                        },
                        timestamp=datetime.now(),
                        source="hand_tracker"
                    ))
                    
                    self.previous_gestures[hand_id] = current_gesture
            else:
                # Start new hold timer for this gesture
                self.gesture_hold_time[hand_id] = current_time
        else:
            # Reset timer with tolerance to prevent flickering
            if hand_id in self.gesture_hold_time:
                hold_duration = current_time - self.gesture_hold_time[hand_id]
                if hold_duration > 0.1:  # Only reset after brief delay
                    del self.gesture_hold_time[hand_id]
                    self.previous_gestures[hand_id] = current_gesture
            else:
                self.previous_gestures[hand_id] = current_gesture
        
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
            
