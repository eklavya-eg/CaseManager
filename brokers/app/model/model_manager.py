import asyncio
import io
import pickle as pkl
import httpx
import pandas as pd
import time
import base64
from app import db
import os

class ModelManager:
    models = {}     # {model_id: (model, last_used_time)}
    locks = {}      # {model_id: threading.Lock()}
    lock = asyncio.Lock()
    ttl = 60*60
    eviction_interval = 60
    client = httpx.AsyncClient()
    base_url = os.getenv("BASE_URL", "http://localhost:3000")
    mongo_client = db
    mongo_lock = asyncio.Lock()

    def __init__(self):
        asyncio.create_task(self.cache_eviction())

    @classmethod
    async def load_model(cls, model_id: str):
        response = await cls.client.get(f"{cls.base_url}/model/{model_id}")
        if response.status_code != 200: return None
        model_byte = response.json()["data"]
        model_byte = base64.b64decode(model_byte)
        try:
            model = pkl.loads(model_byte)
        except:
            return None
        return model
    
    async def load_data(self, data_id: str):
        response = await self.client.get(f"{self.base_url}/data/{data_id}")
        if response.status_code != 200: return None
        data_bytes = response.json()["data"]
        data_bytes = base64.b64decode(data_bytes)
        try:
            data = pd.read_csv(io.BytesIO(data_bytes))
        except:
            return None
        return data

    @classmethod
    async def predict_model(cls, model, data: pd.DataFrame):
        df = pd.DataFrame(data)
        try:
            pred = await asyncio.to_thread(model.predict(df))
        except:
            return None
        return pred
    
    @classmethod
    async def process(cls, model_id: str, data_id: str):
        data: pd.DataFrame | None = await cls.load_data(data_id)
        if not data: return None
        async with cls.lock:
            if model_id not in cls.locks:
                cls.locks[model_id] = asyncio.Lock()
        async with cls.locks[model_id]:
            if model_id not in cls.models:
                model = await cls.load_model(model_id)
                if model is None: return None
                cls.models[model_id] = (model, time.time())
            pred = await asyncio.to_thread(cls.predict_model, cls.models[model_id][0], data)
            if pred is not None:
                cls.models[model_id] = (cls.models[model_id][0], time.time())
            else:
                get_ = cls.models.get(model_id)
                if get_: cls.models.pop(model_id)
        if len(pred) != len(data): return None
        data["predictions"] = list(pred)
        save_data = data.to_dict(orient="records")
        async with cls.mongo_lock:
            await db[f"{model_id}_{data_id}"].delete_many({})
            await db[f"{model_id}_{data_id}"].insert_many(save_data)
        return None
    
    @classmethod
    async def cache_eviction(cls):
        while True:
            for model_id, (_, last_used_time) in cls.models.items():
                if time.time() - last_used_time > cls.ttl:
                    async with cls.locks[model_id]:
                        get_ = cls.models.get(model_id)
                        if get_: cls.models.pop(model_id)
            await asyncio.sleep(cls.eviction_interval)
