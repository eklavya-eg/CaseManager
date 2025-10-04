import asyncio
import json
import logging
import redis.asyncio as redis
import sys
import os
from typing import Dict, Any
import signal
import threading
from concurrent.futures import ThreadPoolExecutor

# Import ModelManager from local predict directory
from model_manager import ModelManager

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class PredictWorker:
    """Individual worker that processes prediction tasks from Redis"""
    
    def __init__(self, worker_id: int, redis_client: redis.Redis, queue_name: str = "predict"):
        self.worker_id = worker_id
        self.redis_client = redis_client
        self.queue_name = queue_name
        self.running = False
        self.logger = logging.getLogger(f"Worker-{worker_id}")
        
    async def start(self):
        """Start the worker to listen for tasks"""
        self.running = True
        self.logger.info(f"Worker {self.worker_id} started, listening on queue '{self.queue_name}'")
        
        while self.running:
            try:
                # Use brpop to block and wait for tasks
                result = await self.redis_client.brpop(self.queue_name, timeout=1)
                
                if result:
                    queue_name, task_data = result
                    await self.process_task(task_data)
                else:
                    # No task received, continue waiting
                    continue
                    
            except Exception as e:
                self.logger.error(f"Worker {self.worker_id} error: {e}")
                await asyncio.sleep(1)  # Brief pause before retrying
                
    async def process_task(self, task_data: bytes):
        """Process a single prediction task"""
        try:
            # Parse the task data
            task_json = json.loads(task_data.decode('utf-8'))
            print(task_json)
            model_id = task_json.get('model_id')
            data_id = task_json.get('data_id')
            
            if not model_id or not data_id:
                self.logger.error(f"Invalid task data: {task_json}")
                return
                
            self.logger.info(f"Worker {self.worker_id} processing: model_id={model_id}, data_id={data_id}")
            
            # Process the prediction using ModelManager
            result = await ModelManager.process(model_id, data_id)
            
            if result:
                self.logger.info(f"Worker {self.worker_id} completed prediction successfully")
                # Optionally store result in Redis or send notification
                await self.store_result(model_id, data_id, result)
            else:
                self.logger.error(f"Worker {self.worker_id} failed to process prediction")
                
        except json.JSONDecodeError as e:
            self.logger.error(f"Worker {self.worker_id} failed to parse task data: {e}")
        except Exception as e:
            self.logger.error(f"Worker {self.worker_id} error processing task: {e}")
            
    async def store_result(self, model_id: str, data_id: str, result: Dict[str, Any]):
        """Store prediction result in Redis"""
        try:
            result_key = f"prediction_result:{model_id}:{data_id}"
            await self.redis_client.setex(
                result_key, 
                3600,  # 1 hour TTL
                json.dumps(result)
            )
            self.logger.info(f"Worker {self.worker_id} stored result in Redis: {result_key}")
        except Exception as e:
            self.logger.error(f"Worker {self.worker_id} failed to store result: {e}")
            
    def stop(self):
        """Stop the worker"""
        self.running = False
        self.logger.info(f"Worker {self.worker_id} stopped")

class WorkerManager:
    """Manages multiple prediction workers"""
    
    def __init__(self, num_workers: int = 4, queue_name: str = "predict"):
        self.num_workers = num_workers
        self.queue_name = queue_name
        self.workers = []
        self.redis_client = None
        self.running = False
        self.logger = logging.getLogger("WorkerManager")
        
    async def initialize_redis(self):
        """Initialize Redis connection"""
        try:
            redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
            self.redis_client = redis.from_url(redis_url)
            
            # Test connection
            await self.redis_client.ping()
            self.logger.info(f"Connected to Redis: {redis_url}")
            
        except Exception as e:
            self.logger.error(f"Failed to connect to Redis: {e}")
            raise
            
    async def start_workers(self):
        """Start all workers"""
        if not self.redis_client:
            await self.initialize_redis()
            
        self.running = True
        self.logger.info(f"Starting {self.num_workers} prediction workers...")
        
        # Create and start workers
        for i in range(self.num_workers):
            worker = PredictWorker(i + 1, self.redis_client, self.queue_name)
            self.workers.append(worker)
            
        # Start all workers concurrently
        worker_tasks = [worker.start() for worker in self.workers]
        await asyncio.gather(*worker_tasks, return_exceptions=True)
        
    def stop_workers(self):
        """Stop all workers"""
        self.running = False
        self.logger.info("Stopping all workers...")
        
        for worker in self.workers:
            worker.stop()
            
    async def close_redis(self):
        """Close Redis connection"""
        if self.redis_client:
            await self.redis_client.close()
            self.logger.info("Redis connection closed")

async def main():
    """Main function to run the worker manager"""
    worker_manager = WorkerManager(num_workers=4)
    
    # Set up signal handlers for graceful shutdown
    def signal_handler(signum, frame):
        logger.info("Received shutdown signal")
        worker_manager.stop_workers()
        
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    try:
        await worker_manager.start_workers()
    except KeyboardInterrupt:
        logger.info("Received keyboard interrupt")
    finally:
        worker_manager.stop_workers()
        await worker_manager.close_redis()
        logger.info("Worker manager shutdown complete")

if __name__ == "__main__":
    asyncio.run(main())
