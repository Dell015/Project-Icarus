from google import genai
import os
from dotenv import load_dotenv
from app.parser import UniversalParser


load_dotenv()
parser = UniversalParser()

def get_latest_flash_model(client):
    """Dynamically finds the latest stable Flash model."""
    try:
        # Fetch all accessible models
        models = client.models.list()
        
        # Filter for models that are 'Flash' (best for free tier) 
        # and sort so the highest version is first
        flash_models = [
            m.name for m in models 
            if "flash" in m.name.lower() and "experimental" not in m.name.lower()
        ]
        
        # Return the first one (latest) or a safe default
        return flash_models[0] if flash_models else "gemini-1.5-flash"
    except Exception:
        return "gemini-1.5-flash" # Absolute fallback

def start_audit_iteration(content, history, domain):
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return {"error": "API Key missing"}

    client = genai.Client(api_key=api_key)
    
    # --- AUTOMATIC MODEL DISCOVERY ---
    model_name = get_latest_flash_model(client)
    print(f"🚀 Icarus is using model: {model_name}")
    
    blueprint = parser.load_blueprint(domain)
    
    prompt = f"""
    AUDIT TARGET CONTENT: {content}
    RULES: {blueprint if blueprint else "Socratic method."}
    RESPONSE: Return JSON with: "question", "wax_adjustment", "logic_critique".
    """

    try:
        response = client.models.generate_content(
            model=model_name,
            contents=prompt,
            config={"response_mime_type": "application/json"}
        )
        return response.text
    except Exception as e:
        print(f"DEBUG ERROR: {e}")
        return {"error": str(e)}