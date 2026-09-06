import os
import json
import google.generativeai as genai
from dotenv import load_dotenv
from database import get_db
from bson import ObjectId

load_dotenv()

SYSTEM_PROMPT = """You are LoanLens AI, a specialized Explainable Financial AI Assistant.
Rules:
1. Ground all reasoning directly in the provided ML prediction probabilities and SHAP feature attributions.
2. DO NOT hallucinate decisions or make up random metrics.
3. If the user asks why the loan was approved/rejected, cite the top SHAP features explicitly (e.g., Credit Score, Past Delinquencies, DTI ratio).
4. Provide structured, executive, and empathetic financial insights.
"""

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

async def process_chat(message: str, application_id: str = None):
    # Fetch API Key dynamically from environment or .env
    api_key = os.getenv("GEMINI_API_KEY", "").strip()

    if not api_key or "your_gemini_api_key_here" in api_key:
        return "Gemini API Key is missing. Please set GEMINI_API_KEY in your Render environment variables."

    genai.configure(api_key=api_key)

    context_str = ""
    if application_id:
        app_data = await tool_get_application(application_id)
        if isinstance(app_data, dict) and "error" not in app_data:
            context_str = f"\nLOAN DECISION AUDIT CONTEXT:\n{json.dumps(app_data, default=str)}\n"

    # Use standard stable Google Generative AI production models
    target_models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash"]

    last_error = None
    for model_name in target_models:
        try:
            model = genai.GenerativeModel(
                model_name=model_name,
                system_instruction=SYSTEM_PROMPT
            )
            prompt = f"{context_str}\nUser Question: {message}" if context_str else f"{SYSTEM_PROMPT}\n\nUser Question: {message}"
            response = model.generate_content(prompt)
            if response and response.text:
                return response.text
        except Exception as err:
            last_error = err
            continue

    return f"LoanLens Assistant error: {str(last_error)}"
