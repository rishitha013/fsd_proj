import os
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://rishimopuri_db_user:VSQkqUeJCtfSTlCN@cluster0.lqcncjh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
DB_NAME = os.getenv("DB_NAME", "loanlens")

client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]

def get_db():
    return db
