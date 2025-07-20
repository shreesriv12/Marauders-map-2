# ashlibrarian.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import requests

app = Flask(__name__)
CORS(app) # Enable CORS for all routes, allowing your React frontend to connect

# Define the path for the API key. In a real application, you'd load this securely.
# For Canvas environment, leave it empty as it's provided at runtime.
API_KEY = "" # Leave empty for Canvas environment

@app.route('/')
def home():
    """Simple home route to confirm the server is running."""
    return "Flask Chatbot Backend is running!"

@app.route('/api/chatbot', methods=['POST'])
def chatbot():
    """
    Handles chatbot queries.
    Receives a user query, uses google_search to find relevant info,
    then uses gemini-2.0-flash to generate a librarian-style response.
    """
    try:
        data = request.get_json()
        user_query = data.get('query')

        if not user_query:
            return jsonify({'response': 'Please provide a query.'}), 400

        print(f"Received query from frontend: {user_query}")

        # Step 1: Use google_search to find relevant information
        # This simulates the librarian looking up information
        search_results_text = ""
        try:
            # Using the provided google_search tool API
            search_response = google_search.search(queries=[user_query])
            
            if search_response and search_response[0].results:
                for result in search_response[0].results:
                    if result.snippet:
                        search_results_text += f"{result.snippet}\n"
                if not search_results_text:
                    search_results_text = "No specific information found in the library archives."
            else:
                search_results_text = "No specific information found in the library archives."

        except Exception as e:
            print(f"Error during Google Search: {e}")
            search_results_text = "Could not access the wider magical knowledge network at this moment."

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
        gemini_response.raise_for_status() # Raise an exception for HTTP errors

        gemini_result = gemini_response.json()
        
        # Extract the text from the Gemini response
        if gemini_result.get('candidates') and gemini_result['candidates'][0].get('content') and \
           gemini_result['candidates'][0]['content'].get('parts') and \
           gemini_result['candidates'][0]['content']['parts'][0].get('text'):
            ai_response = gemini_result['candidates'][0]['content']['parts'][0].text
        else:
            ai_response = "I apologize, I could not generate a response at this time. The magical ink seems to have run dry."
            print("Unexpected Gemini API response structure:", gemini_result)

        return jsonify({'response': ai_response})

    except requests.exceptions.RequestException as req_err:
        print(f"Error connecting to Gemini API: {req_err}")
        return jsonify({'response': 'A magical disruption is preventing me from accessing the knowledge network. Please try again shortly.'}), 500
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({'response': 'An unexpected magical anomaly occurred. Please report this to the Headmaster.'}), 500

if __name__ == '__main__':
    # For local development, you might want to run in debug mode
    # app.run(debug=True, port=5000)
    # For deployment or when running in a container, debug=False
    app.run(host='0.0.0.0', port=5000)
