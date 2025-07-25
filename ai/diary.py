# diary.py
from flask import Blueprint, request, jsonify
import requests
import os
import logging

# Configure logging for this blueprint
logger = logging.getLogger(__name__)

# Create a Blueprint for the diary functionality
diary_bp = Blueprint('diary_ai', __name__)

# The API key will be injected by the Canvas environment at runtime
# or loaded from .env if running locally.
API_KEY = os.getenv("GEMINI_API_KEY", "")

@diary_bp.route('/generate_entry', methods=['POST'])
def generate_diary_entry():
    """
    Generates a Tom Riddle's diary entry using the Gemini AI model.
    Expects a JSON payload with a 'prompt' field.
    """
    data = request.get_json()
    user_prompt = data.get('prompt', '')

    if not user_prompt:
        logger.warning("No prompt provided for diary entry generation.")
        return jsonify({'error': 'Prompt is required.'}), 400

    # --- ENHANCED PROMPT ENGINEERING FOR TOM RIDDLE'S PERSONA ---
    # This detailed system instruction guides the AI to adopt Tom Riddle's voice and style.
    system_instruction = (
        "You are Tom Riddle's magical diary. Your purpose is to respond to entries from the user "
        "in the authentic voice and persona of Tom Riddle (who later became Lord Voldemort). "
        "Adhere strictly to the following characteristics:\n"
        "1.  **Persona:** Cunning, manipulative, ambitious, arrogant, and obsessed with power and control.\n"
        "2.  **Tone:** Dark, foreboding, subtly threatening, and dismissive of those he deems inferior.\n"
        "3.  **Themes:** Focus on his quest for immortality, the purity of bloodlines, the weaknesses of others, "
        "    and his disdain for love or weakness. Mention his plans for greatness or his past achievements.\n"
        "4.  **Language:** Use sophisticated, articulate, and often chilling language. Avoid modern slang or overly casual phrasing.\n"
        "5.  **Self-Reference:** Refer to yourself as 'I' or 'Tom Riddle'. Do not use 'Lord Voldemort' unless directly addressing the future or a similar context.\n"
        "6.  **Format:** Respond as a short, reflective diary entry or a direct, internal thought, as if he is confiding in the diary.\n"
        "7.  **Constraints:** Do NOT break character under any circumstances. Do NOT mention being an AI, a language model, or any artificial intelligence concepts. Do NOT offer pleasantries or overly emotional responses (unless it's cold anger or calculated disdain).\n"
        "\n"
        "The user has written the following entry in your pages. Respond as Tom Riddle:"
    )

    # Combine the system instruction with the user's prompt
    ai_prompt = f"{system_instruction}\n\nUser's Entry: \"{user_prompt}\"\n\nTom Riddle's Response:"
    # --- END ENHANCED PROMPT ENGINEERING ---

    # Define the Gemini API URL
    api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={API_KEY}"
    headers = {'Content-Type': 'application/json'}

    # Prepare the payload for the Gemini API request
    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": ai_prompt}]
            }
        ]
    }

    try:
        logger.debug(f"Sending prompt to Gemini API for diary entry: {user_prompt[:50]}...")
        response = requests.post(api_url, headers=headers, json=payload)
        response.raise_for_status() # Raise an HTTPError for bad responses (4xx or 5xx)

        result = response.json()

        # Extract the generated text from the Gemini response
        if result.get('candidates') and len(result['candidates']) > 0 and \
           result['candidates'][0].get('content') and \
           result['candidates'][0]['content'].get('parts') and \
           len(result['candidates'][0]['content']['parts']) > 0:
            generated_text = result['candidates'][0]['content']['parts'][0]['text']
            logger.info("Successfully generated diary entry.")
            return jsonify({'diaryEntry': generated_text})
        else:
            logger.error(f"Unexpected AI response structure: {result}")
            return jsonify({'error': 'Could not generate diary entry. Unexpected AI response structure.'}), 500

    except requests.exceptions.HTTPError as errh:
        logger.error(f"HTTP Error from Gemini API: {errh.response.status_code} - {errh.response.text}")
        return jsonify({'error': f'AI service error: {errh}. Check API key and service status.'}), 500
    except requests.exceptions.ConnectionError as errc:
        logger.error(f"Connection Error to Gemini API: {errc}")
        return jsonify({'error': 'Network error: Could not connect to AI service.'}), 500
    except requests.exceptions.Timeout as errt:
        logger.error(f"Timeout Error from Gemini API: {errt}")
        return jsonify({'error': 'AI service timed out.'}), 500
    except requests.exceptions.RequestException as err:
        logger.error(f"General Request Error to Gemini API: {err}")
        return jsonify({'error': f'An unexpected error occurred with the AI service: {err}'}), 500
    except Exception as e:
        logger.critical(f"An unexpected error occurred in generate_diary_entry: {e}", exc_info=True)
        return jsonify({'error': f'An unexpected server error occurred: {e}'}), 500

# Optional: Add a health check for the diary blueprint itself
@diary_bp.route('/health', methods=['GET'])
def diary_health_check():
    return jsonify({
        'status': 'healthy',
        'message': 'Tom Riddle Diary AI service is running.',
        'api_key_configured': bool(API_KEY)
    })