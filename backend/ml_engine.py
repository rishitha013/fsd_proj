import os
import joblib
import pandas as pd
import numpy as np
import shap

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ML_DIR = os.path.join(BASE_DIR, "..", "ml")

MODEL_PATH = os.path.join(ML_DIR, "model.pkl")
SCALER_PATH = os.path.join(ML_DIR, "scaler.pkl")
FEATURES_PATH = os.path.join(ML_DIR, "features.pkl")

model = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)
feature_names = joblib.load(FEATURES_PATH)

try:
    explainer = shap.TreeExplainer(model)
except Exception:
    explainer = shap.Explainer(model.predict, shap.maskers.Independent(np.zeros((1, len(feature_names)))))

FEATURE_LABELS = {
    "annual_income": "Annual Income",
    "credit_score": "Credit Score",
    "loan_amount": "Requested Loan Amount",
    "loan_term_months": "Loan Duration (Months)",
    "emp_length_years": "Employment Experience",
    "dti_ratio": "Debt-to-Income (DTI)",
    "delinquencies": "Past Delinquency Record",
    "home_ownership": "Home Ownership Status",
    "loan_purpose": "Borrowing Purpose",
    "existing_liabilities": "Existing Liabilities"
}

def predict_and_explain(data_dict: dict):
    row = [data_dict[f] for f in feature_names]
    df_single = pd.DataFrame([row], columns=feature_names)
    scaled_array = scaler.transform(df_single)

    probs = model.predict_proba(scaled_array)[0]
    approved = bool(probs[1] >= 0.5)
    confidence = float(probs[1] if approved else probs[0])

    shap_res = explainer(scaled_array)
    shap_vals = shap_res.values[0] if hasattr(shap_res, "values") else explainer.shap_values(scaled_array)[0]
    
    # Handle multi-dimensional SHAP outputs
    if isinstance(shap_vals, np.ndarray) and shap_vals.ndim > 1:
        shap_vals = shap_vals[:, 1] if shap_vals.shape[1] > 1 else shap_vals[:, 0]

    base_val = float(shap_res.base_values[0]) if hasattr(shap_res, "base_values") and hasattr(shap_res.base_values, '__len__') else 0.5

    contributions = []
    for f_name, raw_val, s_val in zip(feature_names, row, shap_vals):
        s_float = float(s_val)
        contributions.append({
            "feature": FEATURE_LABELS.get(f_name, f_name),
            "raw_feature_name": f_name,
            "value": float(raw_val),
            "contribution": round(s_float, 4),
            "direction": "positive" if s_float >= 0 else "negative"
        })

    contributions.sort(key=lambda x: abs(x["contribution"]), reverse=True)

    return {
        "approved": approved,
        "probability": round(confidence * 100, 2),
        "raw_approval_prob": float(probs[1]),
        "base_value": round(base_val, 4),
        "shap_contributions": contributions
    }