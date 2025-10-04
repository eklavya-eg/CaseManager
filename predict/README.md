# Predict Workers

This module provides prediction workers that use the ModelManager and Redis brpop functionality to process prediction tasks.

## Features

- **4 Workers**: Starts 4 concurrent workers by default
- **Redis Integration**: Uses Redis brpop for blocking task consumption
- **ModelManager Integration**: Leverages the existing ModelManager for predictions
- **Async Processing**: Fully asynchronous task processing
- **Graceful Shutdown**: Proper signal handling for clean shutdown

## Files

- `worker_manager.py`: Main worker management system
- `start_predict_workers.py`: Startup script for workers
- `task_producer.py`: Utility for adding tasks to the queue
- `requirements.txt`: Python dependencies

## Usage

### Starting Workers

```bash
# Start 4 workers (default)
python start_predict_workers.py

# Or with custom number of workers
PREDICT_WORKERS=8 python start_predict_workers.py
```

### Environment Variables

- `REDIS_URL`: Redis connection URL (default: redis://localhost:6379/0)
- `PREDICT_WORKERS`: Number of workers to start (default: 4)
- `PREDICT_QUEUE`: Queue name for tasks (default: predict)
- `BASE_URL`: Backend API URL for ModelManager (default: http://localhost:3000)
- `MONGO_URI`: MongoDB connection URI (default: mongodb://localhost:27017)

### Adding Tasks

Tasks are added to the Redis queue as JSON with the following structure:

```json
{
    "model_id": "model_123",
    "data_id": "data_456",
    "timestamp": 1234567890.123
}
```

### Testing

Use the task producer to add test tasks:

```bash
python task_producer.py
```

## Integration

The workers integrate with the existing system:

1. **ModelManager**: Uses the local ModelManager (copied from brokers module)
2. **Redis**: Connects to the same Redis instance used by Celery
3. **MongoDB**: Stores prediction results in the same MongoDB database

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Task Producer │───▶│   Redis Queue    │───▶│  Predict Workers│
│                 │    │    (predict)     │    │   (4 workers)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
                                                         ▼
                                               ┌─────────────────┐
                                               │  ModelManager   │
                                               │                 │
                                               └─────────────────┘
                                                         │
                                                         ▼
                                               ┌─────────────────┐
                                               │    MongoDB      │
                                               │  (predictions)  │
                                               └─────────────────┘
```
