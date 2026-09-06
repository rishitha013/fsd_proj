from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class LoanApplicationInput(BaseModel):
    applicant_name: str
    annual_income: float = Field(..., gt=0, description="Annual Income in INR")
    credit_score: int = Field(..., ge=300, le=850)
    loan_amount: float = Field(..., gt=0)
    loan_term_months: int = Field(..., gt=0)
    emp_length_years: float = Field(..., ge=0)
    dti_ratio: float = Field(..., ge=0, le=100)
    delinquencies: int = Field(..., ge=0)
    home_ownership: int = Field(..., ge=0, le=2, description="0: Rent, 1: Mortgage, 2: Own")
    loan_purpose: int = Field(..., ge=0, le=3, description="0: Consolidation, 1: Home, 2: Education, 3: Business")
    existing_liabilities: int = Field(..., ge=0)

class WhatIfRequest(BaseModel):
    application_id: str
    overrides: Dict[str, float]

class ChatRequest(BaseModel):
    application_id: Optional[str] = None
    session_id: Optional[str] = None
    message: str

class ShapFeatureContribution(BaseModel):
    feature: str
    raw_feature_name: str
    value: float
    contribution: float
    direction: str

class DecisionResult(BaseModel):
    id: str
    applicant_name: str
    approved: bool
    probability: float
    base_value: float
    shap_contributions: List[ShapFeatureContribution]
    created_at: datetime
    inputs: Dict[str, Any]