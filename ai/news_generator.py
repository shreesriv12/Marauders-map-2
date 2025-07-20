# backend-python/news_generator.py
from flask import Blueprint, request, jsonify
import os
import google.generativeai as genai
import logging

logger = logging.getLogger(__name__)

# Create a Blueprint for news generation routes
news_bp = Blueprint('news_generator', __name__)

# --- Gemini Model Initialization ---
_news_model = None # Private variable to hold the Gemini model instance

def init_news_model():
    """
    Initializes the Gemini model for news generation.
    This function should be called once when the main Flask app starts.
    """
    global _news_model
    if _news_model is None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            logger.error("GEMINI_API_KEY environment variable not set for news_generator.")
            print("\nWARNING: GEMINI_API_KEY not set in environment variables. News generation will not work.\n")
            return 
        
        genai.configure(api_key=api_key)
        try:
            _news_model = genai.GenerativeModel('gemini-2.0-flash')
            logger.info("Gemini 'gemini-pro' model initialized successfully for news generation.")
        except Exception as e:
            logger.error(f"Error initializing Gemini 'gemini-pro' model for news generation: {e}")
            _news_model = None # Ensure it's None on failure

# --- News Generation Endpoint ---
@news_bp.route('/generate-news', methods=['POST'])
def generate_news():
    global _news_model # Access the globally initialized model
    if _news_model is None:
        logger.error("Gemini news model not initialized. Cannot generate news.")
        return jsonify({"error": "AI news service not ready. Please check server configuration and API key."}), 503

    data = request.json
    category = data.get('category', 'general wizarding news')
    
    # Prompt engineering for Gemini to ensure structured output
    prompt_text = f"""Generate a detailed and engaging news article for The Daily Prophet about a recent event in the wizarding world, focusing on the category: {category}.

    Ensure the article has the following structure:

    Headline: [Compelling and Magical Headline Here]

    [Short introductory paragraph, setting the scene.]

    [First main paragraph with details, facts, and possibly a quote from a fictional wizard/witch.]

    [Second main paragraph, elaborating on consequences, reactions, or future implications, with another fictional quote if appropriate.]

    Make the tone authentic to the Harry Potter universe.
    """

    try:
        response = _news_model.generate_content(prompt_text)
        news_content = response.text
        
        logger.debug(f"Generated news for category '{category}':\n{news_content[:200]}...")
        
        return jsonify({"news_content": news_content, "category": category})

    except Exception as e:
        logger.error(f"Error calling Gemini API for news generation for category {category}: {e}", exc_info=True)
        return jsonify({"error": str(e), "message": "Failed to generate news article from AI."}), 500

# --- Health Check Endpoint for News Generator ---
@news_bp.route('/health', methods=['GET'])
def health_check_news():
    return jsonify({"status": "healthy", "service": "News Generator", "model_initialized": _news_model is not None})