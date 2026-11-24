
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.audio import router as audio_router


app = FastAPI(
    title="Auralis - AI Audio Restoration",
    description="AI-powered audio restoration system",
    version="1.0.0"
)

# Allow local frontend development servers to access the API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(audio_router)


@app.get("/")
def home():
    return {
        "success": True,
        "message": "Welcome to Auralis AI Audio Restoration!"
    }
