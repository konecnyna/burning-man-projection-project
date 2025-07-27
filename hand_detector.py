import cv2
import numpy as np
from typing import List, Dict, Optional, Tuple
import mediapipe as mp

class HandDetector:
    """
    Handles hand detection logic
    Follows single responsibility principle - only handles detection
    """
    
    def __init__(self):
        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=4,
            min_detection_confidence=0.6,
            min_tracking_confidence=0.2,
            model_complexity=0
        )
    
    def detect_hands_mediapipe(self, frame: np.ndarray) -> Tuple[List[Dict], Optional[object]]:
        """
        Detect hands using MediaPipe
        Returns: (hand_data_list, raw_results)
        """
        if self.hands is None:
            return [], None
            
        # Convert BGR to RGB for MediaPipe processing
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.hands.process(rgb_frame)
        
        current_hands = []
        if results.multi_hand_landmarks:
            for idx, hand_landmarks in enumerate(results.multi_hand_landmarks):
                hand_data = self._extract_mediapipe_hand_data(hand_landmarks, frame.shape)
                hand_data['hand_id'] = idx
                current_hands.append(hand_data)
        
        return current_hands, results
    
    def detect_hands_contour(self, frame: np.ndarray) -> List[Dict]:
        """
        Detect hands using simple contour detection
        Returns: list of hand data dictionaries
        """
        # Convert to HSV for better skin color detection
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        
        # More restrictive skin color detection - focus on typical hand colors
        # Primary skin tone range (most common)
        lower_skin = np.array([0, 48, 80])
        upper_skin = np.array([20, 255, 255])
        
        # Create mask
        mask = cv2.inRange(hsv, lower_skin, upper_skin)
        
        # Apply more aggressive noise reduction
        kernel = np.ones((7,7), np.uint8)
        mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)  # Remove small noise
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)  # Fill holes
        
        # Additional noise reduction
        mask = cv2.medianBlur(mask, 7)
        
        # Find contours
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        current_hands = []
        
        if contours:
            # Sort by area and take up to 2 largest (hands typically come in pairs)
            contours = sorted(contours, key=cv2.contourArea, reverse=True)[:2]
            
            height, width = frame.shape[:2]
            
            for idx, contour in enumerate(contours):
                area = cv2.contourArea(contour)
                
                # Much more restrictive area threshold - hands should be substantial
                if area > 8000:  # Increased minimum area significantly
                    # Get bounding rectangle
                    x, y, w, h = cv2.boundingRect(contour)
                    
                    # More restrictive shape filters for hands
                    aspect_ratio = w / h
                    if 0.6 < aspect_ratio < 1.8 and w > 80 and h > 80:  # More hand-like proportions
                        # Calculate solidity (area/convex hull area)
                        hull = cv2.convexHull(contour)
                        hull_area = cv2.contourArea(hull)
                        solidity = area / hull_area if hull_area > 0 else 0
                        
                        # Calculate extent (object area / bounding rectangle area)
                        rect_area = w * h
                        extent = area / rect_area if rect_area > 0 else 0
                        
                        # Hands have specific solidity and extent characteristics
                        if 0.7 < solidity < 0.95 and 0.5 < extent < 0.8:
                            # Additional shape analysis - check for finger-like projections
                            perimeter = cv2.arcLength(contour, True)
                            circularity = 4 * np.pi * area / (perimeter * perimeter) if perimeter > 0 else 0
                            
                            # Hands are not perfectly circular (fingers create irregularity)
                            if 0.2 < circularity < 0.8:
                                # Calculate normalized center point
                                center_x = (x + w/2) / width
                                center_y = (y + h/2) / height
                                
                                # Create hand data
                                hand_data = self._create_contour_hand_data(center_x, center_y, idx, area, contour)
                                current_hands.append(hand_data)
        
        return current_hands
    
    def _extract_mediapipe_hand_data(self, hand_landmarks, frame_shape) -> Dict:
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
    
    def _create_contour_hand_data(self, center_x: float, center_y: float, hand_id: int, area: float, contour) -> Dict:
        """Create hand data structure from contour detection"""
        # Create simplified landmarks based on contour
        landmarks = []
        for i in range(21):
            # Distribute points around the center with some variation
            angle = (i / 21) * 2 * np.pi
            radius = 0.03 + (i % 3) * 0.01
            x = center_x + radius * np.cos(angle)
            y = center_y + radius * np.sin(angle)
            
            landmarks.append({
                'x': max(0, min(1, x)),
                'y': max(0, min(1, y)),
                'z': 0.0
            })
        
        # Define key landmarks
        wrist = landmarks[0]
        thumb_tip = landmarks[4]
        index_tip = landmarks[8]
        middle_tip = landmarks[12]
        ring_tip = landmarks[16]
        pinky_tip = landmarks[20]
        
        # Palm center
        palm_center = {
            'x': center_x,
            'y': center_y,
            'z': 0.0
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
            },
            'hand_id': hand_id,
            'area': area,
            'contour': contour
        }