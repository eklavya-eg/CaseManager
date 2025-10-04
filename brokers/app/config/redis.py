import os

class RedisConfig:
    REDIS_URL:str = os.getenv('REDIS_URL', 'redis://localhost:6379/0')

redis_config = RedisConfig()