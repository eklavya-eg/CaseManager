import asyncio
import io
import pickle as pkl
import traceback
from typing import Any
import httpx
import pandas as pd
from pandas import Series
import numpy as np
import shap
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, confusion_matrix
import datetime
import time
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
load_dotenv()

class ModelManager:
    models = {}     # {model_id: (model, last_used_time)}
    locks = {}      # {model_id: threading.Lock()}
    lock = asyncio.Lock()
    ttl = 60*60
    eviction_interval = 60
    client = httpx.AsyncClient()
    base_url = os.getenv("API_URL", "http://localhost:3000/api/v1")
    mongo_client = None
    mongo_lock = asyncio.Lock()
    
    @classmethod
    async def get_db(cls):
        """Get database connection, create if not exists"""
        if cls.mongo_client is None:
            await cls.get_real_db()
        predictions_db = os.getenv("PREDICTIONS_DB", "predictions")
        return cls.mongo_client[predictions_db]
    
    @classmethod
    async def get_status_db(cls):
        if cls.mongo_client is None:
            await cls.get_real_db()
        status_db = os.getenv("STATUS_DB", "statuses")
        return cls.mongo_client[status_db]
    
    @classmethod
    async def get_real_db(cls):
        if cls.mongo_client is None:
            mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
            cls.mongo_client = AsyncIOMotorClient(mongo_uri)
        return

    def __init__(self):
        print("ModelManager initialized")
        # Note: cache_eviction is now handled as a class method, not instance method

    @classmethod
    async def get_shap_values(cls, model, data):
        try:
            finalcols = list(model[:-1].get_feature_names_out())
            explainer = shap.Explainer(model[-1])
            shapvalues = explainer(model[:-1].transform(data[:]))
            shape = shapvalues[0].values.shape[-1]>1
            shap_values = []
            if shape:
                for shapi in shapvalues:
                    shap_values.append([float(np.round(val[-1], 5)) for val in shapi.values])
            else:
                for shapi in shapvalues:
                    shap_values.append([float(np.round(val, 5)) for val in shapi.values])
        except:
            try:
                explainer = shap.Explainer(model[-1])
                shapvalues = explainer(model[:-1].transform(data))
                shap_values = []
                for shapi in shapvalues:
                    shap_values.append([float(np.round(val, 5)) for val in shapi.values])
                return shap_values, finalcols
            except Exception as e:
                print(f"Error in get_shap_values: {e}")
                return None, None
        return shap_values, finalcols

    @classmethod
    async def load_model(cls, model_id: str):
        print(f"Loading model: {model_id}")
        try:
            response = await cls.client.get(f"{cls.base_url}/model/{model_id}")
            if response.status_code != 200: 
                print(f"Failed to fetch model {model_id}: HTTP {response.status_code}")
                return None, None
            model_byte = response.json()["data"]
            model_name = response.json()["name"]
            model_byte = bytes(list(model_byte.values()))
            # model_byte = base64.b64decode(model_byte)
            model = pkl.loads(model_byte)
            print(f"Successfully loaded model: {model_id}")
            return model, model_name
        except Exception as e:
            print(f"Error loading model {model_id}: {e}")
            return None, None
    
    @classmethod
    async def load_data(cls, data_id: str):
        try:
            response = await cls.client.get(f"{cls.base_url}/data/{data_id}")
            if response.status_code != 200: 
                print(f"Failed to fetch data {data_id}: HTTP {response.status_code}")
                return None, None
            data_bytes = response.json()["data"]
            data_name = response.json()["name"]
            data_bytes = bytes(list(data_bytes.values()))
            # data_bytes = base64.b64decode(data_bytes)
            data = pd.read_csv(io.BytesIO(data_bytes))
            print(f"Successfully loaded data: {data_id}")
            return data, data_name
        except Exception as e:
            print(f"Error loading data {data_id}: {e}")
            return None, None

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
    async def get_metrics(cls, pred, actual: Series|None):
        try:
            if actual is None or pred is None or len(pred)!=len(actual):
                raise ValueError("Actual values and predictions must have the same length")
            le = LabelEncoder()
            accuracy_main = 0
            classes_main = list(actual.unique())
            classes = list(actual.unique())
            for _ in range(len(classes_main)):
                le.classes_ = np.array(classes)
                accuracy = accuracy_score(le.transform(actual), pred)
                if accuracy>accuracy_main:
                    accuracy_main = accuracy
                    classes_main = classes.copy()
                classes = classes[-1:]+classes[:-1]
            le.classes_ = np.array(classes_main)
            accuracy = accuracy_score(le.transform(actual), pred)
            tn, fp, fn, tp = confusion_matrix(le.transform(actual), pred).ravel()
            precision = tp/(tp+fp)
            recall = tp/(tp+fn)
            f1 = 2*precision*recall/(precision+recall)
            return accuracy, fp, fn, tp, tn
            
                
            
        except Exception as e:
            print(f"Error in getting metrics: {e}")
            return None, None, None, None, None
    
    @classmethod
    async def process(cls, model_id: str, data_id: str, accuracy_check: bool, column_name: str | None):
        try:
            data, data_name = await cls.load_data(data_id)
            data: pd.DataFrame | None
            data_name: str | None
            if data is None:
                print(f"Failed to load data for data_id: {data_id}")
                return None
                
            async with cls.lock:
                if model_id not in cls.locks:
                    cls.locks[model_id] = asyncio.Lock()
                    
            async with cls.locks[model_id]:
                if model_id not in cls.models:
                    model, model_name = await cls.load_model(model_id)
                    model: Any | None
                    model_name: str | None
                    if model is None: 
                        print(f"Failed to load model for model_id: {model_id}")
                        return None
                    
                    async with cls.mongo_lock:
                        status_db = await cls.get_status_db()
                        prediction_status_collection_name = os.getenv("PREDICTION_STATUS_COLLECTION", "prediction_statuses")
                        current = status_db[prediction_status_collection_name].find_one({"id": f"{model_id}_{data_id}"})
                        current = {
                            "id": f"{model_id}_{data_id}",
                            "model_id": model_id,
                            "data_id": data_id,
                            "accuracy_check": accuracy_check,
                            "column_name": column_name,
                            "status": "pending",
                            "created_at": datetime.datetime.now(),
                            "updated_at": datetime.datetime.now(),
                            "accuracy": 0.0,
                            "total": len(data),
                            "false_positive": 0,
                            "false_negative": 0,
                            "true_positive": 0,
                            "true_negative": 0,
                            "model_name": model_name,
                            "data_name": data_name,
                        }
                        if current is None:
                            await status_db[prediction_status_collection_name].insert_one(current, upsert=True)
                        else:
                            await status_db[prediction_status_collection_name].update_one({"id": f"{model_id}_{data_id}"}, {"$set": current}, upsert=True)
                    
                    cls.models[model_id] = (model, time.time())
                    
                pred = await cls.predict_model(cls.models[model_id][0], data)
                accuracy = false_positive = false_negative = true_positive = true_negative = None
                if accuracy_check==True:
                    accuracy, false_positive, false_negative, true_positive, true_negative = await cls.get_metrics(pred, data.get(column_name))
                shap_values, finalcols = await cls.get_shap_values(cls.models[model_id][0], data)
                # TODO: shap
                print("========================Prediction Success========================")
                if pred is not None and shap_values is not None and finalcols is not None:
                    cls.models[model_id] = (cls.models[model_id][0], time.time())
                else:
                    print(f"Prediction failed for model_id: {model_id}")
                    get_ = cls.models.get(model_id)
                    if get_: cls.models.pop(model_id)
                    return None
                    
            if len(shap_values) != 0 and len(shap_values[0]) != len(finalcols):
                print(f"Shap values length mismatch: {len(shap_values)} vs {len(finalcols)}")
                return None
                    
            if len(pred) != len(data):
                print(f"Prediction length mismatch: {len(pred)} vs {len(data)}")
                return None
                
            data["predictions"] = list(pred)
            data["shap_values"] = list(shap_values)
            save_data = data.to_dict(orient="records")
            
            async with cls.mongo_lock:
                db = await cls.get_db()
                await db[f"{model_id}_{data_id}"].delete_many({})
                await db[f"{model_id}_{data_id}"].insert_many(save_data)

                status_db = await cls.get_status_db()
                prediction_status_collection_name = os.getenv("PREDICTION_STATUS_COLLECTION", "prediction_statuses")
                updated = {
                    "status": "success",
                    "updated_at": datetime.datetime.now(),
                    "accuracy": accuracy or 0,
                    "false_positive": int(false_positive or 0),
                    "false_negative": int(false_negative or 0),
                    "true_positive": int(true_positive or 0),
                    "true_negative": int(true_negative or 0),
                    "finalcols": finalcols,
                }
                await status_db[prediction_status_collection_name].update_one({"id": f"{model_id}_{data_id}"}, {"$set": updated}, upsert=True)
                
            print(f"Successfully processed prediction for model_id: {model_id}, data_id: {data_id}")
            return {"status": "success", "predictions_count": len(pred)}
            
        except Exception as e:
            print(f"Error in process method: {e}")
            traceback.print_exc()
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
