#!/usr/bin/env python3
"""
Integration script to start prediction workers alongside the main application
"""
import asyncio
import subprocess
import sys
import os
import signal
import time
from pathlib import Path

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from worker_manager import WorkerManager

class PredictWorkerIntegration:
    """Integration class to manage prediction workers with the main application"""
    
    def __init__(self, num_workers: int = 4):
        self.num_workers = num_workers
        self.worker_manager = None
        self.worker_task = None
        
    async def start_workers(self):
        """Start the prediction workers"""
        print(f"🚀 Starting {self.num_workers} prediction workers...")
        
        self.worker_manager = WorkerManager(num_workers=self.num_workers)
        
        # Start workers in a separate task
        self.worker_task = asyncio.create_task(self.worker_manager.start_workers())
        
        print("✅ Prediction workers started successfully")
        
    async def stop_workers(self):
        """Stop the prediction workers"""
        if self.worker_manager:
            print("🛑 Stopping prediction workers...")
            self.worker_manager.stop_workers()
            
        if self.worker_task:
            self.worker_task.cancel()
            try:
                await self.worker_task
            except asyncio.CancelledError:
                pass
                
        if self.worker_manager:
            await self.worker_manager.close_redis()
            
        print("✅ Prediction workers stopped")

async def main():
    """Main function for standalone worker execution"""
    integration = PredictWorkerIntegration(num_workers=4)
    
    # Set up signal handlers
    def signal_handler(signum, frame):
        print(f"\n🛑 Received signal {signum}, shutting down...")
        asyncio.create_task(integration.stop_workers())
        
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    try:
        await integration.start_workers()
        
        # Keep running until interrupted
        while True:
            await asyncio.sleep(1)
            
    except KeyboardInterrupt:
        print("\n🛑 Received keyboard interrupt")
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        await integration.stop_workers()

if __name__ == "__main__":
    asyncio.run(main())
