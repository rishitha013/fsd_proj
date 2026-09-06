import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from xgboost import XGBClassifier

np.random.seed(42)
N = 6000

annual_income = np.random.lognormal(mean=11.6, sigma=0.55, size=N).clip(200000, 6000000)
credit_score = np.random.normal(loc=685, scale=75, size=N).clip(300, 850)
loan_amount = np.random.lognormal(mean=12.1, sigma=0.75, size=N).clip(50000, 5000000)
loan_term_months = np.random.choice([12, 24, 36, 60, 120, 240, 360], size=N, p=[0.05, 0.1, 0.2, 0.3, 0.15, 0.1, 0.1])
emp_length_years = np.random.uniform(0, 30, size=N)
dti_ratio = np.random.beta(a=2, b=5, size=N) * 100
delinquencies = np.random.poisson(lam=0.35, size=N).clip(0, 5)
home_ownership = np.random.choice([0, 1, 2], size=N, p=[0.45, 0.40, 0.15])
loan_purpose = np.random.choice([0, 1, 2, 3], size=N, p=[0.4, 0.3, 0.2, 0.1])
existing_liabilities = np.random.poisson(lam=2, size=N).clip(0, 8)

log_odds = (
    (credit_score - 610) * 0.016
    + (annual_income / 100000) * 0.075
    - (loan_amount / 100000) * 0.048
    - (dti_ratio - 24) * 0.058
    + (emp_length_years) * 0.038
    - (delinquencies * 1.35)
    + (home_ownership * 0.28)
    - (existing_liabilities * 0.16)
    - 0.45
)

prob = 1 / (1 + np.exp(-log_odds))
approved = (prob >= 0.5).astype(int)

df = pd.DataFrame({
    "annual_income": annual_income,
    "credit_score": credit_score,
    "loan_amount": loan_amount,
    "loan_term_months": loan_term_months,
    "emp_length_years": emp_length_years,
    "dti_ratio": dti_ratio,
    "delinquencies": delinquencies,
    "home_ownership": home_ownership,
    "loan_purpose": loan_purpose,
    "existing_liabilities": existing_liabilities,
    "approved": approved
})

feature_cols = [
    "annual_income", "credit_score", "loan_amount", "loan_term_months",
    "emp_length_years", "dti_ratio", "delinquencies", "home_ownership",
    "loan_purpose", "existing_liabilities"
]

X = df[feature_cols]
y = df["approved"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Explicitly setting base_score=0.5 ensures backward SHAP compatibility
model = XGBClassifier(
    n_estimators=160,
    max_depth=4,
    learning_rate=0.04,
    subsample=0.85,
    colsample_bytree=0.85,
    base_score=0.5,
    random_state=42,
    eval_metric="logloss"
)
model.fit(X_train_scaled, y_train)

joblib.dump(model, "model.pkl")
joblib.dump(scaler, "scaler.pkl")
joblib.dump(feature_cols, "features.pkl")
print("ML Model, Scaler, and Features successfully serialized with base_score=0.5.")