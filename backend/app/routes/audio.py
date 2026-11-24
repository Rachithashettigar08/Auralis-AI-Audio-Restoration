
import uuid
from pathlib import Path

from fastapi import APIRouter, UploadFile, File, HTTPException

# Create Audio API router
router = APIRouter(
    prefix="/api/audio",
    tags=["Audio"]
)

# Locate backend/uploads directory
UPLOAD_DIR = Path(__file__).resolve().parents[2] / "uploads"

# Create uploads directory if it doesn't exist
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Supported audio formats
ALLOWED_EXTENSIONS = {".wav", ".mp3"}

# Maximum upload size: 25 MB
MAX_FILE_SIZE = 25 * 1024 * 1024


@router.post("/upload")
async def upload_audio(file: UploadFile = File(...)):
    """
    Upload and store WAV or MP3 audio files.
    """

    # Check filename
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Filename is required."
        )

    # Extract extension
    extension = Path(file.filename).suffix.lower()

    # Validate file extension
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only WAV and MP3 files are supported."
        )

    try:
        # Read uploaded audio
        content = await file.read()

        # Check empty file
        if not content:
            raise HTTPException(
                status_code=400,
                detail="Uploaded audio file is empty."
            )

        # Check file size
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail="File size must not exceed 25 MB."
            )

        # Generate unique audio ID
        audio_id = str(uuid.uuid4())

        # Generate safe filename
        saved_filename = f"{audio_id}{extension}"

        # Save file
        file_path = UPLOAD_DIR / saved_filename
        file_path.write_bytes(content)

        # Return upload details
        return {
            "success": True,
            "message": "Audio uploaded successfully.",
            "audio_id": audio_id,
            "original_filename": Path(file.filename).name,
            "saved_filename": saved_filename,
            "file_size": len(content),
            "format": extension.lstrip(".")
        }

    except HTTPException:
        raise

    except OSError:
        raise HTTPException(
            status_code=500,
            detail="Unable to save uploaded audio."
        )

    finally:
        await file.close()
