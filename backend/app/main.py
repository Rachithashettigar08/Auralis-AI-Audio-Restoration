from fastapi import FastAPI
from app.routes.audio import router as audio_router

app = FastAPI(
    title="Auralis - AI Audio Restoration",
    description="AI-powered audio restoration system",
    version="1.0.0"
)
app.include_router(audio_router)

@app.get("/")
def home():
    return {
        "message": "Welcome to Auralis AI Audio Restoration!"
    }