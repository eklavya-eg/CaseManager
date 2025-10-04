#!/usr/bin/env python3
"""
Startup script for prediction workers
Starts 4 workers that use ModelManager and brpop on Redis predict queue
"""
import asyncio
import os
import sys
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add current directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from worker_manager import WorkerManager

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

async def main():
    """Main function to start prediction workers"""
    logger.info("🚀 Starting Prediction Workers...")
    
    # Get number of workers from environment or default to 4
    num_workers = int(os.getenv("PREDICT_WORKERS", 4))
    queue_name = os.getenv("PREDICT_QUEUE", "predict")
    
    logger.info(f"📊 Starting {num_workers} workers on queue '{queue_name}'")
    
    # Create and start worker manager
    worker_manager = WorkerManager(num_workers=num_workers, queue_name=queue_name)
    
    try:
        await worker_manager.start_workers()
    except KeyboardInterrupt:
        logger.info("🛑 Received keyboard interrupt, shutting down...")
    except Exception as e:
        logger.error(f"❌ Error starting workers: {e}")
    finally:
        worker_manager.stop_workers()
        await worker_manager.close_redis()
        logger.info("✅ Workers shutdown complete")

if __name__ == "__main__":
    asyncio.run(main())
