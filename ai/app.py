from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import cv2
import numpy as np
from handtracking import HandTracker
import logging
import os 
from dotenv import load_dotenv 
load_dotenv() 

# Import the news generation blueprint and its initializer
from news_generator import news_bp, init_news_model 

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  

# Initialize hand tracker 
hand_tracker = HandTracker()

def decode_base64_image(image_data_url):
    """
    Decode base64 image data URL to OpenCV image format
    """
    try:
        if ',' in image_data_url:
            header, encoded = image_data_url.split(',', 1)
        else:
            encoded = image_data_url
        
        image_bytes = base64.b64decode(encoded)
        
        nparr = np.frombuffer(image_bytes, np.uint8)
        
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
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({
                'error': 'No image data provided',
                'hand_landmarks': []
            }), 400
        
        image = decode_base64_image(data['image'])
        
        if image is None:
            return jsonify({
                'error': 'Failed to decode image',
                'hand_landmarks': []
            }), 400
        
        logger.debug(f"Received image with shape: {image.shape}")
        
        landmarks = hand_tracker.process_frame(image)
        
        if landmarks:
            logger.debug(f"Detected {len(landmarks)} hands")
        else:
            logger.debug("No hands detected")
        
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
    Health check endpoint (MODIFIED to include news generation health)
    """
    # Import _news_model here to avoid circular import if news_generator is not fully loaded yet
    # This import is specifically placed inside the function to avoid circular import issues
    # that can arise when modules try to import each other at the top level.
    from news_generator import _news_model as current_news_model_state
    
    return jsonify({
        'status': 'healthy',
        'message': 'Main Flask AI Backend is running (Hand Tracking and News Generation).',
        'hand_tracker_initialized': hand_tracker.is_initialized(),
        'news_generation_initialized': current_news_model_state is not None, 
        'news_generation_service_health_endpoint': f"http://localhost:{request.host.split(':')[-1]}/news-ai/health" 
    })

@app.route('/', methods=['GET'])
def home():
    """
    Root endpoint with API information (MODIFIED to include news generation)
    """
    return jsonify({
        'message': 'Welcome to The Daily Prophet AI Backend Orchestrator!',
        'version': '1.0.0',
        'endpoints': {
            # Existing Hand Tracking Endpoints
            '/track_hands': 'POST - Send base64 image for hand tracking',
            '/health': 'GET - Overall server health check',
            # NEW News Generation Endpoints
            '/news-ai/generate-news': 'POST - Generate a news article using Gemini AI for a given category',
            '/news-ai/health': 'GET - Check the health of the news generation service',
            '/': 'GET - This information page'
        },
        'usage': {
            'hand_tracking': {
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
            },
            'news_generation': {
                'method': 'POST',
                'endpoint': '/news-ai/generate-news',
                'data_format': {
                    'category': 'string (e.g., "Quidditch", "Dark Arts", "Ministry Affairs")'
                },
                'response_format': {
                    'news_content': 'String of the generated news article',
                    'category': 'The category that was requested'
                }
            }
        },
        'note': 'Ensure your GEMINI_API_KEY is set in your environment variables for news generation.'
    })

# Register the news_bp blueprint with a URL prefix
app.register_blueprint(news_bp, url_prefix='/news-ai')

if __name__ == '__main__':
    try:
        logger.info("Starting Magical AI Backend Orchestrator...")
        
        # Initialize HandTracker (already happens at module level, but good to confirm its state)
        logger.info(f"Hand tracker initialized: {hand_tracker.is_initialized()}")
        
        # Initialize the news generation model
        init_news_model() 
        
        # Run the Flask app
        app.run(
            host='0.0.0.0',    
            port=5001,         
            debug=True,        
            threaded=True      
        )
        
    except Exception as e:
        logger.critical(f"CRITICAL: Failed to start server: {e}", exc_info=True)
        print(f"Error starting server: {e}")
        print("Please make sure you have installed all required dependencies and your GEMINI_API_KEY is set:")
        print("pip install flask flask-cors opencv-python mediapipe numpy google-generative-ai python-dotenv")