from multiprocessing import pool
from brokers.app.config.redis import RedisConfig, redis_config
from celery import Celery

class CeleryFactory:
    def __init__(self, name: str):
        self.app: Celery = Celery(
            name,
            broker=redis_config.REDIS_URL,
            backend=redis_config.REDIS_URL,
            include=[
                "app.task.predict_task"                
            ]
        )
        # self.config()
        self.configure_routes()

    def config(self):
        self.app.worker_main([
            "worker",
            "-P", "threads",
            "--concurrency=5"
        ])

    def configure_routes(self):
        self.app.conf.task_routes = {
            "app.task.predict_task.*": {"queue": "predict"}
        }


celery_app_ = CeleryFactory("worker")
celery_app_.config()
celery_app = celery_app_.app