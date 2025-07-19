import cv2
import mediapipe as mp
import numpy as np
import logging
from typing import List, Dict, Optional, Tuple

# Configure logging
logger = logging.getLogger(__name__)

class HandTracker:
    """
    Hand tracking class using MediaPipe for detecting and tracking hands
    """
    
    def __init__(self, 
                 static_image_mode: bool = False,
                 max_num_hands: int = 2,
                 min_detection_confidence: float = 0.7,
                 min_tracking_confidence: float = 0.5):
        """
        Initialize the HandTracker
        
        Args:
            static_image_mode: Whether to treat input images as static images
            max_num_hands: Maximum number of hands to detect
            min_detection_confidence: Minimum confidence for hand detection
            min_tracking_confidence: Minimum confidence for hand tracking
        """
        try:
            # Initialize MediaPipe hands solution
            self.mp_hands = mp.solutions.hands
            self.mp_drawing = mp.solutions.drawing_utils
            self.mp_drawing_styles = mp.solutions.drawing_styles
            
            # Create hands object with specified parameters
            self.hands = self.mp_hands.Hands(
                static_image_mode=static_image_mode,
                max_num_hands=max_num_hands,
                min_detection_confidence=min_detection_confidence,
                min_tracking_confidence=min_tracking_confidence
            )
            
            self.initialized = True
            logger.info("HandTracker initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize HandTracker: {e}")
            self.initialized = False
            raise
    
    def is_initialized(self) -> bool:
        """
        Check if the hand tracker is properly initialized
        
        Returns:
            bool: True if initialized successfully, False otherwise
        """
        return self.initialized
    
    def process_frame(self, image: np.ndarray) -> Optional[List[List[Dict]]]:
        """
        Process a single frame to detect hand landmarks
        
        Args:
            image: Input image as numpy array (BGR format)
            
        Returns:
            List of hand landmarks or None if no hands detected
            Each hand is represented as a list of landmark dictionaries with x, y, z coordinates
        """
        if not self.initialized:
            logger.error("HandTracker not properly initialized")
            return None
        
        try:
            # Convert BGR to RGB (MediaPipe expects RGB)
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Process the image
            results = self.hands.process(rgb_image)
            
            # Extract landmarks if hands are detected
            if results.multi_hand_landmarks:
                hand_landmarks_list = []
                
                for hand_landmarks in results.multi_hand_landmarks:
                    # Convert landmarks to list of dictionaries
                    landmarks = []
                    for landmark in hand_landmarks.landmark:
                        landmarks.append({
                            'x': landmark.x,
                            'y': landmark.y,
                            'z': landmark.z
                        })
                    
                    hand_landmarks_list.append(landmarks)
                    
                logger.debug(f"Processed frame - detected {len(hand_landmarks_list)} hands")
                return hand_landmarks_list
            
            else:
                logger.debug("No hands detected in frame")
                return []
                
        except Exception as e:
            logger.error(f"Error processing frame: {e}")
            return None
    
    def draw_landmarks_on_image(self, image: np.ndarray, hand_landmarks_list: List[List[Dict]]) -> np.ndarray:
        """
        Draw hand landmarks on the image
        
        Args:
            image: Input image as numpy array
            hand_landmarks_list: List of hand landmarks
            
        Returns:
            Image with drawn landmarks
        """
        if not hand_landmarks_list:
            return image
        
        try:
            # Create a copy of the image to avoid modifying the original
            annotated_image = image.copy()
            
            # Convert landmarks back to MediaPipe format for drawing
            for landmarks_dict_list in hand_landmarks_list:
                # Create MediaPipe landmark list
                hand_landmarks = self.mp_hands.HandLandmark()
                
                # This is a simplified drawing - in a real implementation,
                # you might want to convert back to MediaPipe's NormalizedLandmarkList
                # For now, let's draw circles and connections manually
                
                # Draw landmark points
                h, w = annotated_image.shape[:2]
                for i, landmark_dict in enumerate(landmarks_dict_list):
                    x = int(landmark_dict['x'] * w)
                    y = int(landmark_dict['y'] * h)
                    
                    # Draw landmark point
                    cv2.circle(annotated_image, (x, y), 5, (0, 255, 0), -1)
                    
                    # Draw landmark index
                    cv2.putText(annotated_image, str(i), (x-10, y-10), 
                               cv2.FONT_HERSHEY_SIMPLEX, 0.3, (255, 255, 255), 1)
                
                # Draw connections (simplified - just connecting sequential points)
                # In a real implementation, you'd use the proper hand topology
                self._draw_hand_connections(annotated_image, landmarks_dict_list)
            
            return annotated_image
            
        except Exception as e:
            logger.error(f"Error drawing landmarks: {e}")
            return image
    
    def _draw_hand_connections(self, image: np.ndarray, landmarks: List[Dict]):
        """
        Draw connections between hand landmarks
        
        Args:
            image: Image to draw on
            landmarks: List of landmark dictionaries
        """
        # Define hand connections (simplified version)
        # These are the connections between different parts of the hand
        connections = [
            # Thumb
            (0, 1), (1, 2), (2, 3), (3, 4),
            # Index finger
            (0, 5), (5, 6), (6, 7), (7, 8),
            # Middle finger
            (0, 9), (9, 10), (10, 11), (11, 12),
            # Ring finger
            (0, 13), (13, 14), (14, 15), (15, 16),
            # Pinky
            (0, 17), (17, 18), (18, 19), (19, 20),
            # Palm connections
            (5, 9), (9, 13), (13, 17)
        ]
        
        h, w = image.shape[:2]
        
        for start_idx, end_idx in connections:
            if start_idx < len(landmarks) and end_idx < len(landmarks):
                start_point = (
                    int(landmarks[start_idx]['x'] * w),
                    int(landmarks[start_idx]['y'] * h)
                )
                end_point = (
                    int(landmarks[end_idx]['x'] * w),
                    int(landmarks[end_idx]['y'] * h)
                )
                
                cv2.line(image, start_point, end_point, (255, 0, 0), 2)
    
    def get_finger_positions(self, landmarks: List[Dict]) -> Dict[str, Dict]:
        """
        Get specific finger tip positions from landmarks
        
        Args:
            landmarks: List of hand landmarks
            
        Returns:
            Dictionary with finger tip positions
        """
        if len(landmarks) < 21:
            return {}
        
        finger_tips = {
            'thumb': landmarks[4],      # Thumb tip
            'index': landmarks[8],      # Index finger tip
            'middle': landmarks[12],    # Middle finger tip
            'ring': landmarks[16],      # Ring finger tip
            'pinky': landmarks[20]      # Pinky tip
        }
        
        return finger_tips
    
    def is_finger_up(self, landmarks: List[Dict], finger: str) -> bool:
        """
        Check if a specific finger is pointing up
        
        Args:
            landmarks: List of hand landmarks
            finger: Finger name ('thumb', 'index', 'middle', 'ring', 'pinky')
            
        Returns:
            Boolean indicating if finger is up
        """
        if len(landmarks) < 21:
            return False
        
        finger_tip_ids = {
            'thumb': 4, 'index': 8, 'middle': 12, 'ring': 16, 'pinky': 20
        }
        
        finger_pip_ids = {
            'thumb': 3, 'index': 6, 'middle': 10, 'ring': 14, 'pinky': 18
        }
        
        if finger not in finger_tip_ids:
            return False
        
        tip_y = landmarks[finger_tip_ids[finger]]['y']
        pip_y = landmarks[finger_pip_ids[finger]]['y']
        
        # For thumb, check x coordinate instead (different orientation)
        if finger == 'thumb':
            tip_x = landmarks[finger_tip_ids[finger]]['x']
            pip_x = landmarks[finger_pip_ids[finger]]['x']
            return abs(tip_x - pip_x) > 0.04
        
        # For other fingers, check if tip is above pip joint
        return tip_y < pip_y
    
    def get_gesture(self, landmarks: List[Dict]) -> str:
        """
        Recognize basic hand gestures
        
        Args:
            landmarks: List of hand landmarks
            
        Returns:
            String describing the recognized gesture
        """
        if len(landmarks) < 21:
            return "unknown"
        
        fingers_up = []
        for finger in ['thumb', 'index', 'middle', 'ring', 'pinky']:
            fingers_up.append(self.is_finger_up(landmarks, finger))
        
        # Count how many fingers are up
        fingers_count = sum(fingers_up)
        
        # Basic gesture recognition
        if fingers_count == 0:
            return "fist"
        elif fingers_count == 1:
            if fingers_up[1]:  # Index finger
                return "pointing"
            elif fingers_up[0]:  # Thumb
                return "thumbs_up"
        elif fingers_count == 2:
            if fingers_up[1] and fingers_up[2]:  # Index and middle
                return "peace"
        elif fingers_count == 5:
            return "open_palm"
        
        return f"{fingers_count}_fingers"
    
    def cleanup(self):
        """
        Clean up resources
        """
        if hasattr(self, 'hands') and self.hands:
            self.hands.close()
            logger.info("HandTracker cleaned up")

# Example usage and testing
if __name__ == "__main__":
    # Test the HandTracker with webcam
    tracker = HandTracker()
    
    if not tracker.is_initialized():
        print("Failed to initialize hand tracker")
        exit(1)
    
    # Test with webcam
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("Cannot open webcam")
        exit(1)
    
    print("Hand tracking test started. Press 'q' to quit.")
    
    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            # Process the frame
            landmarks_list = tracker.process_frame(frame)
            
            # Draw landmarks if detected
            if landmarks_list:
                annotated_frame = tracker.draw_landmarks_on_image(frame, landmarks_list)
                
                # Show gesture recognition for first hand
                if len(landmarks_list) > 0:
                    gesture = tracker.get_gesture(landmarks_list[0])
                    cv2.putText(annotated_frame, f"Gesture: {gesture}", 
                               (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                
                cv2.imshow('Hand Tracking Test', annotated_frame)
            else:
                cv2.imshow('Hand Tracking Test', frame)
            
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
    
    except KeyboardInterrupt:
        print("\nStopping hand tracking test...")
    
    finally:
        cap.release()
        cv2.destroyAllWindows()
        tracker.cleanup()
        print("Test completed.")