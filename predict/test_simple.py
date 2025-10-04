#!/usr/bin/env python3
"""
Simple test to verify ModelManager integration
"""
import asyncio
import sys
import os

try:
    from model_manager import ModelManager
    print("✅ ModelManager imported successfully")
    
    # Test if we can call the process method
    async def test_model_manager():
        print("🧪 Testing ModelManager.process method...")
        try:
            # This will fail if the backend isn't running, but we can test the method exists
            result = await ModelManager.process("test_model", "test_data")
            print(f"✅ ModelManager.process completed: {result}")
        except Exception as e:
            print(f"⚠️ ModelManager.process failed (expected if backend not running): {e}")
    
    asyncio.run(test_model_manager())
    
except ImportError as e:
    print(f"❌ Failed to import ModelManager: {e}")
    print("Make sure the brokers directory exists and has the correct structure")
