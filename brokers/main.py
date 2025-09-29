import uvicorn
from app import App

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000)

# gunicorn app:app -k uvicorn.workers.UvicornWorker -w 6 -b 0.0.0.0:8000 --timeout 600 --keep-alive 120
