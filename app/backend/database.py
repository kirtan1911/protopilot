import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path

BACKEND_DIR = Path(__file__).parent
load_dotenv(BACKEND_DIR / ".env")

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]

mongo_client = AsyncIOMotorClient(MONGO_URL)
db = mongo_client[DB_NAME]
