#!/usr/bin/env python3
"""
Task producer for testing prediction workers
Adds tasks to the Redis predict queue for workers to process
"""
import asyncio
import json
import os
import sys
import logging
import redis.asyncio as redis
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class TaskProducer:
    """Produces prediction tasks to Redis queue"""
    
    def __init__(self, queue_name: str = "predict"):
        self.queue_name = queue_name
        self.redis_client = None
        
    async def initialize_redis(self):
        """Initialize Redis connection"""
        try:
            redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
            self.redis_client = redis.from_url(redis_url)
            
            # Test connection
            await self.redis_client.ping()
            logger.info(f"Connected to Redis: {redis_url}")
            
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            raise
            
    async def add_prediction_task(self, model_id: str, data_id: str):
        """Add a prediction task to the queue"""
        if not self.redis_client:
            await self.initialize_redis()
            
        task_data = {
            "model_id": model_id,
            "data_id": data_id,
            "timestamp": asyncio.get_event_loop().time()
        }
        
        try:
            # Push task to the queue
            await self.redis_client.lpush(self.queue_name, json.dumps(task_data))
            logger.info(f"Added prediction task: model_id={model_id}, data_id={data_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to add task: {e}")
            return False
            
    async def get_queue_length(self):
        """Get the current length of the queue"""
        if not self.redis_client:
            await self.initialize_redis()
            
        try:
            length = await self.redis_client.llen(self.queue_name)
            return length
        except Exception as e:
            logger.error(f"Failed to get queue length: {e}")
            return -1
            
    async def close_redis(self):
        """Close Redis connection"""
        if self.redis_client:
            await self.redis_client.close()
            logger.info("Redis connection closed")

async def main():
    """Main function for testing task production"""
    producer = TaskProducer()
    
    try:
        await producer.initialize_redis()
        
        # Example: Add some test tasks
        test_tasks = [
            ("model_123", "data_456"),
            ("model_789", "data_012"),
            ("model_345", "data_678"),
        ]
        
        logger.info("Adding test prediction tasks...")
        for model_id, data_id in test_tasks:
            await producer.add_prediction_task(model_id, data_id)
            await asyncio.sleep(0.1)  # Small delay between tasks
            
        # Check queue length
        queue_length = await producer.get_queue_length()
        logger.info(f"Queue length: {queue_length}")
        
    except Exception as e:
        logger.error(f"Error in task producer: {e}")
    finally:
        await producer.close_redis()

if __name__ == "__main__":
    asyncio.run(main())
