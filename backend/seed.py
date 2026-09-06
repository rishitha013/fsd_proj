import asyncio
import os
import random
from datetime import datetime, timedelta
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from ml_engine import predict_and_explain

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "loanlens")

FIRST_NAMES = [
    "Aarav", "Aditi", "Rohan", "Pooja", "Vikram", "Sneha", "Karan", "Ananya",
    "Rahul", "Priya", "Amit", "Divya", "Suresh", "Kavita", "Manish", "Neha",
    "Deepak", "Ritu", "Alok", "Sunita", "Harsh", "Meera", "Varun", "Simran",
    "Nikhil", "Swati", "Sanjay", "Tanvi", "Gaurav", "Isha", "Abhishek", "Payal"
]

LAST_NAMES = [
    "Sharma", "Verma", "Patel", "Reddy", "Mehta", "Gupta", "Nair", "Iyer",
    "Rao", "Joshi", "Singhania", "Chopra", "Kulkarni", "Deshmukh", "Bhat", "Kapoor"
]

async def seed_database(count=120):
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DB_NAME]

    print(f"Connecting to MongoDB: {MONGO_URI} (DB: {DB_NAME})")
    
    # Optional: Clear existing applications if you want a clean slate
    # await db.applications.delete_many({})

    records = []
    base_time = datetime.utcnow()

    print(f"Generating and evaluating {count} historical loan applications with XGBoost & SHAP...")

    for i in range(count):
        name = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
        
        # Realistic variable distributions
        income = random.choice([
            random.randint(250000, 600000),
            random.randint(600000, 1500000),
            random.randint(1500000, 4500000)
        ])
        
        credit_score = int(random.gauss(680, 75))
        credit_score = max(300, min(850, credit_score))
        
        loan_amount = random.randint(100000, 3500000)
        loan_term_months = random.choice([12, 24, 36, 60, 120, 240, 360])
        emp_length_years = round(random.uniform(0.5, 20.0), 1)
        dti_ratio = round(random.uniform(8.0, 55.0), 1)
        delinquencies = random.choices([0, 1, 2, 3], weights=[0.7, 0.18, 0.08, 0.04])[0]
        home_ownership = random.choices([0, 1, 2], weights=[0.45, 0.40, 0.15])[0]
        loan_purpose = random.choices([0, 1, 2, 3], weights=[0.4, 0.3, 0.2, 0.1])[0]
        existing_liabilities = random.randint(0, 5)

        input_payload = {
            "annual_income": float(income),
            "credit_score": credit_score,
            "loan_amount": float(loan_amount),
            "loan_term_months": loan_term_months,
            "emp_length_years": float(emp_length_years),
            "dti_ratio": float(dti_ratio),
            "delinquencies": delinquencies,
            "home_ownership": home_ownership,
            "loan_purpose": loan_purpose,
            "existing_liabilities": existing_liabilities
        }

        # Run actual ML prediction & SHAP feature attribution
        ml_output = predict_and_explain(input_payload)

        # Distribute timestamps across past 30 days
        timestamp = base_time - timedelta(
            days=random.randint(0, 30),
            hours=random.randint(0, 23),
            minutes=random.randint(0, 59)
        )

        doc = {
            "applicant_name": name,
            "inputs": input_payload,
            "approved": ml_output["approved"],
            "probability": ml_output["probability"],
            "raw_approval_prob": ml_output["raw_approval_prob"],
            "base_value": ml_output["base_value"],
            "shap_contributions": ml_output["shap_contributions"],
            "created_at": timestamp
        }
        records.append(doc)

    if records:
        result = await db.applications.insert_many(records)
        print(f"Successfully inserted {len(result.inserted_ids)} evaluated applications into MongoDB.")

    # Show updated count
    total_count = await db.applications.count_documents({})
    print(f"Total applications currently in database: {total_count}")

if __name__ == "__main__":
    asyncio.run(seed_database(120))