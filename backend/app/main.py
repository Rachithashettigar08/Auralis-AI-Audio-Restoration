from fastapi import FastAPI

app = FastAPI(
    title="Auralis - AI Audio Restoration",
    description="AI-powered audio restoration system",
    version="1.0.0"
)

@app.get("/")
def home():
    return {
        "message": "Welcome to Auralis AI Audio Restoration!"
    }