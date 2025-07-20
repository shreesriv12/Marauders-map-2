from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import cv2
import numpy as np
from handtracking import HandTracker
import logging
import os 
from dotenv import load_dotenv 
import json
import requests


from flask import Flask, request, jsonify, send_file
from PIL import Image
from io import BytesIO
from transform import apply_spell



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

# IMPORTANT: For local development, you MUST provide your Gemini API key here
# Get your API key from Google AI Studio: https://aistudio.google.com/app/apikey
# It's recommended to store this in a .env file and load it using os.getenv()
# Example: API_KEY = os.getenv("GEMINI_API_KEY")
# For Canvas environment, leave it as an empty string.
API_KEY = os.getenv("GEMINI_API_KEY", "") # Load from .env or default to empty

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

@app.route('/api/chatbot', methods=['POST'])
def chatbot():
    """
    Handles chatbot queries.
    Receives a user query, uses a mock search or integrates with a real search API,
    then uses gemini-2.0-flash to generate a librarian-style response.
    """
    try:
        data = request.get_json()
        user_query = data.get('query')

        if not user_query:
            return jsonify({'response': 'Please provide a query.'}), 400

        print(f"Received query from frontend: {user_query}")

        # --- FIX for 'google_search' is not defined ---
        # When running locally, 'google_search' tool is not available.
        # You need to either:
        # 1. Integrate a real search API (e.g., Google Custom Search API)
        # 2. Provide a mock search result for local development.
        
        search_results_text = ""
        # Option 1: Mock Search Results (for quick local testing)
        if "harry potter" in user_query.lower():
            search_results_text = "Harry Potter is a famous wizard, known as 'The Boy Who Lived'. He attended Hogwarts School of Witchcraft and Wizardry, sorted into Gryffindor House. His parents were James and Lily Potter."
        elif "spells" in user_query.lower():
            search_results_text = "Common spells include Wingardium Leviosa (levitation), Expelliarmus (disarming), and Lumos (light). Advanced spells require more practice and focus."
        elif "hogwarts founders" in user_query.lower():
            search_results_text = "Hogwarts was founded by Godric Gryffindor, Helga Hufflepuff, Rowena Ravenclaw, and Salazar Slytherin, each representing a house."
        else:
            search_results_text = "No specific information found in the immediate library archives for that query."

        # Option 2: Integrate a real search API (uncomment and configure if needed)
        # from googleapiclient.discovery import build # pip install google-api-python-client
        # GOOGLE_CSE_ID = os.getenv("GOOGLE_CSE_ID") # Your Custom Search Engine ID
        # GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY") # Your Google API Key for Custom Search
        # if GOOGLE_CSE_ID and GOOGLE_API_KEY:
        #     try:
        #         service = build("customsearch", "v1", developerKey=GOOGLE_API_KEY)
        #         res = service.cse().list(q=user_query, cx=GOOGLE_CSE_ID, num=3).execute()
        #         if res.get('items'):
        #             search_results_text = "\n".join([item['snippet'] for item in res['items']])
        #         else:
        #             search_results_text = "No specific information found via external search."
        #     except Exception as e:
        #         print(f"Error during real Google Search API call: {e}")
        #         search_results_text = "Could not access the wider magical knowledge network at this moment."
        # else:
        #     print("GOOGLE_CSE_ID or GOOGLE_API_KEY not set for real search.")
        #     search_results_text = "External search not configured. Using mock data."
        
        # End of FIX for 'google_search' is not defined ---

        # Step 2: Use gemini-2.0-flash to generate a librarian-style response
        # based on the search results and the user's query.
        
        # Construct the prompt for the LLM
        prompt = f"""
        You are a helpful and knowledgeable Hogwarts Librarian AI.
        Based on the following information from the library archives and the user's query,
        provide a concise and helpful answer in a formal, librarian-like tone.
        If the information is not directly available, state that politely.

        User Query: "{user_query}"

        Library Archives Information:
        {search_results_text}

        Librarian AI Response:
        """

        # Prepare the payload for the Gemini API call
        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": prompt}]
                }
            ]
        }
        
        # Gemini API endpoint (gemini-2.0-flash is default, no API key needed if empty string)
        api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={API_KEY}"

        headers = {'Content-Type': 'application/json'}
        
        # Make the request to the Gemini API
        gemini_response = requests.post(api_url, headers=headers, data=json.dumps(payload))
        gemini_response.raise_for_status() # Raise an exception for HTTP errors (e.g., 403, 404, 500)

        gemini_result = gemini_response.json()
        
        # Extract the text from the Gemini response
        # CORRECTED: Changed .text to ['text'] for dictionary access
        if gemini_result.get('candidates') and gemini_result['candidates'][0].get('content') and \
           gemini_result['candidates'][0]['content'].get('parts') and \
           gemini_result['candidates'][0]['content']['parts'][0].get('text'):
            ai_response = gemini_result['candidates'][0]['content']['parts'][0]['text']
        else:
            ai_response = "I apologize, I could not generate a response at this time. The magical ink seems to have run dry."
            print("Unexpected Gemini API response structure:", gemini_result)

        return jsonify({'response': ai_response})

    except requests.exceptions.RequestException as req_err:
        print(f"Error connecting to Gemini API: {req_err}")
        # Provide a more user-friendly message for API key issues
        if "403 Client Error: Forbidden" in str(req_err) and not API_KEY:
            return jsonify({'response': 'Librarian AI: My apologies, I cannot access the magical knowledge network. Please ensure your Gemini API key is correctly configured for this local server.'}), 500
        return jsonify({'response': 'A magical disruption is preventing me from accessing the knowledge network. Please try again shortly.'}), 500
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({'response': 'An unexpected magical anomaly occurred. Please report this to the Headmaster.'}), 500


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
    Root endpoint with API information (MODIFIED to include news generation and chatbot)
    """
    return jsonify({
        'message': 'Welcome to The Daily Prophet AI Backend Orchestrator!',
        'version': '1.0.0',
        'endpoints': {
            # Existing Hand Tracking Endpoints
            '/track_hands': 'POST - Send base64 image for hand tracking',
            '/health': 'GET - Overall server health check',
            # News Generation Endpoints
            '/news-ai/generate-news': 'POST - Generate a news article using Gemini AI for a given category',
            '/news-ai/health': 'GET - Check the health of the news generation service',
            # NEW Chatbot Endpoint
            '/api/chatbot': 'POST - Ask the Librarian AI a question',
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
            },
            'chatbot': { # NEW: Chatbot usage info
                'method': 'POST',
                'endpoint': '/api/chatbot',
                'data_format': {
                    'query': 'string (the user\'s question)'
                },
                'response_format': {
                    'response': 'string (the AI librarian\'s answer)'
                }
            }
        },
        'note': 'Ensure your GEMINI_API_KEY is set in your environment variables for news generation and chatbot.'
    })

@app.route('/ai/transform_image', methods=['POST'])
def transform_image():
    if 'image' not in request.files or 'spell' not in request.form:
        return jsonify({'error': 'Missing image or spell'}), 400

    try:
        image = Image.open(request.files['image']).convert('RGB')
        spell = request.form['spell']
        result = apply_spell(spell, image)

        buffer = BytesIO()
        result.save(buffer, format='JPEG')
        buffer.seek(0)
        return send_file(buffer, mimetype='image/jpeg')
    except Exception as e:
        return jsonify({'error': str(e)}), 500

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
