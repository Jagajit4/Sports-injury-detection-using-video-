from fastapi import FastAPI

# Create a FastAPI application
app = FastAPI()

# Home route
@app.get("/")
def home():
    return {
        "project": "Sports Injury Risk Detection",
        "status": "Backend is running successfully!"
    }

# Health check route
@app.get("/health")
def health():
    return {
        "status": "OK"
    }