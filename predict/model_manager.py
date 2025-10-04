import asyncio
import io
import pickle as pkl
import httpx
import pandas as pd
import time
from motor.motor_asyncio import AsyncIOMotorClient
import os

class ModelManager:
    models = {}     # {model_id: (model, last_used_time)}
    locks = {}      # {model_id: threading.Lock()}
    lock = asyncio.Lock()
    ttl = 60*60
    eviction_interval = 60
    client = httpx.AsyncClient()
    base_url = os.getenv("BASE_URL", "http://localhost:3000/api/v1")
    mongo_client = None
    mongo_lock = asyncio.Lock()
    
    @classmethod
    async def get_db(cls):
        """Get database connection, create if not exists"""
        if cls.mongo_client is None:
            mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
            cls.mongo_client = AsyncIOMotorClient(mongo_uri)
        return cls.mongo_client["predictions"]

    def __init__(self):
        print("ModelManager initialized")
        # Note: cache_eviction is now handled as a class method, not instance method

    @classmethod
    async def load_model(cls, model_id: str):
        print(f"Loading model: {model_id}")
        try:
            response = await cls.client.get(f"{cls.base_url}/model/{model_id}")
            if response.status_code != 200: 
                print(f"Failed to fetch model {model_id}: HTTP {response.status_code}")
                return None
            model_byte = response.json()["data"]
            model_byte = bytes(list(model_byte.values()))
            # model_byte = base64.b64decode(model_byte)
            model = pkl.loads(model_byte)
            print(f"Successfully loaded model: {model_id}")
            return model
        except Exception as e:
            print(f"Error loading model {model_id}: {e}")
            return None
    
    @classmethod
    async def load_data(cls, data_id: str):
        try:
            response = await cls.client.get(f"{cls.base_url}/data/{data_id}")
            if response.status_code != 200: 
                print(f"Failed to fetch data {data_id}: HTTP {response.status_code}")
                return None
            data_bytes = response.json()["data"]
            data_bytes = bytes(list(data_bytes.values()))
            # data_bytes = base64.b64decode(data_bytes)
            data = pd.read_csv(io.BytesIO(data_bytes))
            print(f"Successfully loaded data: {data_id}")
            return data
        except Exception as e:
            print(f"Error loading data {data_id}: {e}")
            return None

    @classmethod
    async def predict_model(cls, model, data: pd.DataFrame):
        try:
            pred = await asyncio.to_thread(model.predict, data)
            print("Success in model prediction")
        except Exception as e:
            print(f"Error in model prediction: {e}")
            return None
        return pred
    
    @classmethod
    async def process(cls, model_id: str, data_id: str):
        try:
            data: pd.DataFrame | None = await cls.load_data(data_id)
            if data is None:
                print(f"Failed to load data for data_id: {data_id}")
                return None
                
            async with cls.lock:
                if model_id not in cls.locks:
                    cls.locks[model_id] = asyncio.Lock()
                    
            async with cls.locks[model_id]:
                if model_id not in cls.models:
                    model = await cls.load_model(model_id)
                    if model is None: 
                        print(f"Failed to load model for model_id: {model_id}")
                        return None
                    cls.models[model_id] = (model, time.time())
                    
                pred = await cls.predict_model(cls.models[model_id][0], data)
                if pred is not None:
                    cls.models[model_id] = (cls.models[model_id][0], time.time())
                else:
                    print(f"Prediction failed for model_id: {model_id}")
                    get_ = cls.models.get(model_id)
                    if get_: cls.models.pop(model_id)
                    return None
                    
            if len(pred) != len(data): 
                print(f"Prediction length mismatch: {len(pred)} vs {len(data)}")
                return None
                
            data["predictions"] = list(pred)
            save_data = data.to_dict(orient="records")
            
            async with cls.mongo_lock:
                db = await cls.get_db()
                await db[f"{model_id}_{data_id}"].delete_many({})
                await db[f"{model_id}_{data_id}"].insert_many(save_data)
                
            print(f"Successfully processed prediction for model_id: {model_id}, data_id: {data_id}")
            return {"status": "success", "predictions_count": len(pred)}
            
        except Exception as e:
            print(f"Error in process method: {e}")
            return None
    
    @classmethod
    async def cache_eviction(cls):
        while True:
            for model_id, (_, last_used_time) in cls.models.items():
                if time.time() - last_used_time > cls.ttl:
                    print("evicted model " + model_id)
                    async with cls.locks[model_id]:
                        get_ = cls.models.get(model_id)
                        if get_: cls.models.pop(model_id)
            await asyncio.sleep(cls.eviction_interval)
