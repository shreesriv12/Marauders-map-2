from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import cv2
import numpy as np
from handtracking import HandTracker
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize hand tracker
hand_tracker = HandTracker()

def decode_base64_image(image_data_url):
    """
    Decode base64 image data URL to OpenCV image format
    """
    try:
        # Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        if ',' in image_data_url:
            header, encoded = image_data_url.split(',', 1)
        else:
            encoded = image_data_url
        
        # Decode base64 to bytes
        image_bytes = base64.b64decode(encoded)
        
        # Convert bytes to numpy array
        nparr = np.frombuffer(image_bytes, np.uint8)
        
        # Decode to OpenCV image
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise ValueError("Failed to decode image")
            
        return image
        
    except Exception as e:
        logger.error(f"Error decoding base64 image: {e}")
        return None

@app.route('/track_hands', methods=['POST'])
def track_hands():
    """
    Main endpoint for hand tracking
    Receives base64 encoded image and returns hand landmarks
    """
    try:
        # Get JSON data from request
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({
                'error': 'No image data provided',
                'hand_landmarks': []
            }), 400
        
        # Decode the base64 image
        image = decode_base64_image(data['image'])
        
        if image is None:
            return jsonify({
                'error': 'Failed to decode image',
                'hand_landmarks': []
            }), 400
        
        logger.debug(f"Received image with shape: {image.shape}")
        
        # Process the image through hand tracker
        landmarks = hand_tracker.process_frame(image)
        
        # Log results
        if landmarks:
            logger.debug(f"Detected {len(landmarks)} hands")
        else:
            logger.debug("No hands detected")
        
        # Return the results
        return jsonify({
            'hand_landmarks': landmarks,
            'status': 'success',
            'hands_detected': len(landmarks) if landmarks else 0
        })
        
    except Exception as e:
        logger.error(f"Error in track_hands endpoint: {e}")
        return jsonify({
            'error': f'Server error: {str(e)}',
            'hand_landmarks': []
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint
    """
    return jsonify({
        'status': 'healthy',
        'message': 'Hand tracking server is running',
        'mediapipe_available': hand_tracker.is_initialized()
    })

@app.route('/', methods=['GET'])
def home():
    """
    Root endpoint with API information
    """
    return jsonify({
        'message': 'Magical Hand Tracking API',
        'version': '1.0.0',
        'endpoints': {
            '/track_hands': 'POST - Send base64 image for hand tracking',
            '/health': 'GET - Check server health',
            '/': 'GET - This information page'
        },
        'usage': {
            'method': 'POST',
            'endpoint': '/track_hands',
            'data_format': {
                'image': 'base64 encoded image data URL'
            },
            'response_format': {
                'hand_landmarks': 'Array of hand landmark arrays',
                'status': 'success/error',
                'hands_detected': 'Number of hands detected'
            }
        }
    })

if __name__ == '__main__':
    try:
        logger.info("Starting Magical Hand Tracking Server...")
        logger.info(f"Hand tracker initialized: {hand_tracker.is_initialized()}")
        
        # Run the Flask app
        app.run(
            host='0.0.0.0',  # Allow connections from any IP
            port=5001,       # Port 5001 as specified in frontend
            debug=True,      # Enable debug mode for development
            threaded=True    # Enable threading for better performance
        )
        
    except Exception as e:
        logger.error(f"Failed to start server: {e}")
        print(f"Error starting server: {e}")
        print("Make sure you have installed all required dependencies:")
        print("pip install flask flask-cors opencv-python mediapipe numpy")