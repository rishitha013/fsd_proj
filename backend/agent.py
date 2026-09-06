import os
import json
import google.generativeai as genai
from dotenv import load_dotenv
from database import get_db
from bson import ObjectId

load_dotenv()

async def tool_get_application(app_id: str):
    db = get_db()
    try:
        doc = await db.applications.find_one({"_id": ObjectId(app_id)})
        if not doc:
            return {"error": "Application not found"}
        doc["_id"] = str(doc["_id"])
        return doc
    except Exception as e:
        return {"error": str(e)}

SYSTEM_PROMPT = """You are LoanLens AI, a specialized Explainable Financial AI Assistant.
Rules:
1. Ground all reasoning directly in the provided ML prediction probabilities and SHAP feature attributions.
2. DO NOT hallucinate decisions or make up random metrics.
3. If the user asks why the loan was approved/rejected, cite the top SHAP features explicitly (e.g., Credit Score, Past Delinquencies, DTI ratio).
4. Provide structured, executive, and empathetic financial insights.
"""

def get_supported_model():
    """Dynamically finds an active text generation model for the API key."""
    candidate_models = [
        "gemini-3.6-flash",
        "gemini-3.6-pro",
        "gemini-2.0-flash",
        "gemini-1.5-flash-latest"
    ]
    
    try:
        available = [
            m.name.replace("models/", "") 
            for m in genai.list_models() 
            if "generateContent" in m.supported_generation_methods
        ]
        for candidate in candidate_models:
            if candidate in available:
                return candidate
        if available:
            return available[0]
    except Exception:
        pass
    return "gemini-3.6-flash"

async def process_chat(message: str, application_id: str = None):
    load_dotenv(override=True)
    api_key = os.getenv("GEMINI_API_KEY", "").strip()

    if not api_key or "your_gemini_api_key_here" in api_key:
        return "Gemini API Key is missing. Please configure GEMINI_API_KEY in backend/.env."

    genai.configure(api_key=api_key)

    context_str = ""
    if application_id:
        app_data = await tool_get_application(application_id)
        if "error" not in app_data:
            context_str = f"\nLOAN DECISION CONTEXT:\n{json.dumps(app_data, default=str)}\n"

    model_name = get_supported_model()

    try:
        model = genai.GenerativeModel(
            model_name=model_name,
            system_instruction=SYSTEM_PROMPT
        )
        prompt = f"{context_str}\nUser Question: {message}"
        response = model.generate_content(prompt)
        return response.text
    except Exception:
        # Fallback inline instruction formatting
        try:
            model = genai.GenerativeModel(model_name=model_name)
            prompt = f"{SYSTEM_PROMPT}\n\n{context_str}\nUser Question: {message}"
            response = model.generate_content(prompt)
            return response.text
        except Exception as err:
            return f"LoanLens Assistant error ({model_name}): {str(err)}"