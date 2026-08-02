import cv2
import numpy as np
from typing import List, Dict, Optional
import mediapipe as mp

class HandVisualizer:
    """
    Handles visualization of hand detection results
    Follows single responsibility principle - only handles drawing
    """
    
    def __init__(self):
        self.mp_hands = mp.solutions.hands
        self.mp_drawing = mp.solutions.drawing_utils
        self.mp_drawing_styles = mp.solutions.drawing_styles
        
        # Define unique colors for each hand (BGR format for OpenCV)
        self.hand_colors = [
            (0, 255, 0),    # Green for hand 0
            (0, 0, 255),    # Red for hand 1  
            (255, 0, 0),    # Blue for hand 2
            (0, 255, 255),  # Yellow for hand 3
            (255, 0, 255),  # Magenta for hand 4
            (255, 255, 0),  # Cyan for hand 5
            (128, 255, 128), # Light green for hand 6
            (128, 128, 255), # Light red for hand 7
        ]
    
    def get_hand_color(self, hand_id: int):
        """Get unique color for a hand based on its ID"""
        return self.hand_colors[hand_id % len(self.hand_colors)]
        
    def draw_hand_landmarks(self, frame: np.ndarray, hand_landmarks, hand_id: int) -> np.ndarray:
        """Draw MediaPipe hand landmarks on frame"""
        # MediaPipe is available, proceed with drawing
            
        # Draw hand landmarks and connections using MediaPipe's default styles
        self.mp_drawing.draw_landmarks(
            frame, 
            hand_landmarks, 
            self.mp_hands.HAND_CONNECTIONS,
            self.mp_drawing_styles.get_default_hand_landmarks_style(),
            self.mp_drawing_styles.get_default_hand_connections_style()
        )
        
        # Draw bounding box around hand
        self._draw_mediapipe_bounding_box(frame, hand_landmarks, hand_id)
        
        return frame
    
    def _draw_mediapipe_bounding_box(self, frame: np.ndarray, hand_landmarks, hand_id: int):
        """Draw bounding box around MediaPipe detected hand"""
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
        
        # Get unique color for this hand
        color = self.get_hand_color(hand_id)
        
        # Draw thick bounding box
        cv2.rectangle(frame, (min_x, min_y), (max_x, max_y), color, 3)
        
        # Draw hand label with background for better visibility
        label = f"Hand {hand_id}"
        (text_width, text_height), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
        cv2.rectangle(frame, (min_x, min_y - text_height - 10), (min_x + text_width + 10, min_y), color, -1)
        cv2.putText(frame, label, (min_x + 5, min_y - 5), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
    
    def draw_contour_detection(self, frame: np.ndarray, contours: List, hand_id: int) -> np.ndarray:
        """Draw contour-based hand detection results"""
        if not contours:
            return frame
        
        # Get unique color for this hand
        color = self.get_hand_color(hand_id)
        
        for contour in contours:
            # Draw contour
            cv2.drawContours(frame, [contour], -1, color, 2)
            
            # Get bounding rectangle
            x, y, w, h = cv2.boundingRect(contour)
            area = cv2.contourArea(contour)
            
            # Draw thick bounding box
            cv2.rectangle(frame, (x, y), (x + w, y + h), color, 3)
            
            # Draw hand label with background for better visibility
            label = f"Hand {hand_id} (Area: {int(area)})"
            (text_width, text_height), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 2)
            cv2.rectangle(frame, (x, y - text_height - 10), (x + text_width + 10, y), color, -1)
            cv2.putText(frame, label, (x + 5, y - 5), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)
        
        return frame
    
    def draw_mock_hand(self, frame: np.ndarray, center_x: float, center_y: float, hand_id: int) -> np.ndarray:
        """Draw mock hand visualization"""
        height, width = frame.shape[:2]
        px = int(center_x * width)
        py = int(center_y * height)
        
        # Get unique color for this hand
        color = self.get_hand_color(hand_id)
        
        # Draw hand as filled circle
        cv2.circle(frame, (px, py), 20, color, -1)
        
        # Draw thick bounding box around hand
        box_size = 40
        cv2.rectangle(frame, 
                     (px - box_size, py - box_size), 
                     (px + box_size, py + box_size), 
                     color, 3)
        
        # Draw hand label with background for better visibility
        label = f"Hand {hand_id}"
        (text_width, text_height), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
        cv2.rectangle(frame, (px - text_width//2 - 5, py - 60), (px + text_width//2 + 5, py - 45), color, -1)
        cv2.putText(frame, label, (px - text_width//2, py - 50), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        
        return frame
    
    def draw_debug_overlay(self, frame: np.ndarray, hands_count: int, fps: int, mode: str = "") -> np.ndarray:
        """Draw debug information overlay"""
        cv2.putText(frame, f"Hands: {hands_count}", (10, 30), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        cv2.putText(frame, f"FPS: {fps}", (10, 60), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        
        if mode:
            cv2.putText(frame, mode.upper(), (10, 90), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 2)
        
        return frame
    
    def create_mock_frame(self, frame_number: int) -> np.ndarray:
        """Create a mock camera frame for testing"""
        mock_frame = np.zeros((480, 640, 3), dtype=np.uint8)
        
        # Add visual indicators
        cv2.putText(mock_frame, "MOCK CAMERA MODE", (50, 50), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
        cv2.putText(mock_frame, f"Frame: {frame_number}", (50, 100), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)
        
        return mock_frame