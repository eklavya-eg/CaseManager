from motor.motor_asyncio import AsyncIOMotorClient
from contextlib import asynccontextmanager
from fastapi import FastAPI
from dotenv import load_dotenv
import os


class App:
    def __init__(self):
        self.app = FastAPI(lifespan=self.lifespan)
        self.mongo_uri = os.getenv("MONGO_URI") or "mongodb://localhost:27017"
        self.mongo_client = None
        self.db = None

    async def connect_mongo(self):
        self.mongo_client = AsyncIOMotorClient(self.mongo_uri)
        self.db = self.mongo_client["predictions"]
    
    async def close_mongo(self):
        await self.mongo_client.close()
    
    @asynccontextmanager
    async def lifespan(self, app: FastAPI):
        try:
            await self.connect_mongo()
            yield
        except Exception as e:
            print(e)
        finally:
            await self.close_mongo()

_app = App()
db = _app.db
app = _app.app