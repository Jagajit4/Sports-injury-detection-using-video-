from fastapi import FastAPI
from .routes import auth
from .database import engine
from . import models

app = FastAPI()
app.include_router(auth.router)
models.Base.metadata.create_all(bind=engine)

@app.get("/")
def home():
    return {
        "project": "Sports Injury Risk Detection",
        "status": "Backend is running successfully!"
    }

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }