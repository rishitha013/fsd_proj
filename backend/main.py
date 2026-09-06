import uuid
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from bson import ObjectId
from database import get_db
from schemas import LoanApplicationInput, WhatIfRequest, ChatRequest
from ml_engine import predict_and_explain
from agent import process_chat

app = FastAPI(title="LoanLens API Engine", version="1.0.0")

# Enable comprehensive CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def health_check():
    return {"status": "healthy", "service": "LoanLens Decision API"}

@app.post("/api/applications")
@app.post("/api/applications/")
async def create_application(payload: LoanApplicationInput):
    db = get_db()
    input_data = payload.model_dump()
    applicant_name = input_data.pop("applicant_name")

    ml_result = predict_and_explain(input_data)

    doc = {
        "applicant_name": applicant_name,
        "inputs": input_data,
        "approved": ml_result["approved"],
        "probability": ml_result["probability"],
        "raw_approval_prob": ml_result["raw_approval_prob"],
        "base_value": ml_result["base_value"],
        "shap_contributions": ml_result["shap_contributions"],
        "created_at": datetime.utcnow()
    }

    result = await db.applications.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    return doc

@app.get("/api/applications")
@app.get("/api/applications/")
async def list_applications(limit: int = 50, skip: int = 0):
    db = get_db()
    cursor = db.applications.find().sort("created_at", -1).skip(skip).limit(limit)
    items = []
    async for d in cursor:
        d["_id"] = str(d["_id"])
        items.append(d)
    return items

@app.get("/api/applications/{app_id}")
@app.get("/api/applications/{app_id}/")
async def get_application(app_id: str):
    db = get_db()
    try:
        doc = await db.applications.find_one({"_id": ObjectId(app_id)})
        if not doc:
            raise HTTPException(status_code=404, detail="Application not found")
        doc["_id"] = str(doc["_id"])
        return doc
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid application ID format")

@app.post("/api/what-if")
@app.post("/api/what-if/")
async def execute_what_if(payload: WhatIfRequest):
    db = get_db()
    try:
        doc = await db.applications.find_one({"_id": ObjectId(payload.application_id)})
        if not doc:
            raise HTTPException(status_code=404, detail="Application not found")

        modified_inputs = dict(doc["inputs"])
        for k, v in payload.overrides.items():
            if k in modified_inputs:
                modified_inputs[k] = float(v)

        new_result = predict_and_explain(modified_inputs)
        return {
            "application_id": payload.application_id,
            "original": {
                "approved": doc["approved"],
                "probability": doc["probability"]
            },
            "what_if": {
                "approved": new_result["approved"],
                "probability": new_result["probability"],
                "shap_contributions": new_result["shap_contributions"]
            },
            "modified_fields": payload.overrides
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dashboard/stats")
@app.get("/api/dashboard/stats/")
async def get_dashboard_metrics():
    db = get_db()
    total = await db.applications.count_documents({})
    if total == 0:
        return {
            "total_applications": 0,
            "approved_count": 0,
            "rejected_count": 0,
            "approval_rate": 0,
            "avg_confidence": 0,
            "recent_decisions": []
        }

    approved = await db.applications.count_documents({"approved": True})
    rejected = total - approved

    pipeline = [{"$group": {"_id": None, "avg_prob": {"$avg": "$probability"}}}]
    agg = await db.applications.aggregate(pipeline).to_list(length=1)
    avg_conf = agg[0]["avg_prob"] if agg else 0.0

    cursor = db.applications.find().sort("created_at", -1).limit(6)
    recent = []
    async for r in cursor:
        recent.append({
            "id": str(r["_id"]),
            "name": r.get("applicant_name", "Anonymous"),
            "loan_amount": r.get("inputs", {}).get("loan_amount", 0),
            "approved": r.get("approved", False),
            "probability": r.get("probability", 0),
            "date": r["created_at"].strftime("%b %d, %Y") if "created_at" in r else "Recent"
        })

    return {
        "total_applications": total,
        "approved_count": approved,
        "rejected_count": rejected,
        "approval_rate": round((approved / total) * 100, 1),
        "avg_confidence": round(avg_conf, 1),
        "recent_decisions": recent
    }

@app.post("/api/chat")
@app.post("/api/chat/")
async def handle_agent_chat(payload: ChatRequest):
    session_id = payload.session_id or str(uuid.uuid4())
    db = get_db()

    reply = await process_chat(payload.message, payload.application_id)

    chat_entry = {
        "session_id": session_id,
        "application_id": payload.application_id,
        "user_message": payload.message,
        "agent_response": reply,
        "timestamp": datetime.utcnow()
    }
    await db.chat_sessions.insert_one(chat_entry)

    return {"session_id": session_id, "response": reply}
