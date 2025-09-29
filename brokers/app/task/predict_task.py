from brokers.app.model.model_manager import ModelManager
from brokers.app.task.base_task import BaseTask
from brokers.app.worker.celery_factory import celery_app


class PredictTask(BaseTask):
    async def register(self):
        @celery_app.task(name="app.task.predict_task.predict")
        async def predict(model_id:str, data_id:str):
            return await ModelManager().process(model_id, data_id)