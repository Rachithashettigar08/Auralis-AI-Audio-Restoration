
import uuid
from pathlib import Path

import librosa

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse

from app.services.audio_analyzer import analyze_audio
from app.services.noise_reducer import reduce_noise
from app.database import add_audio_record, update_restoration_status, get_audio_history


router = APIRouter(
    prefix="/api/audio",
    tags=["Audio"]
)

# Upload directory
UPLOAD_DIR = Path(__file__).resolve().parents[2] / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Upload restrictions
ALLOWED_EXTENSIONS = {".wav", ".mp3"}
MAX_FILE_SIZE = 25 * 1024 * 1024
CHUNK_SIZE = 1024 * 1024


def find_audio_file(audio_id: str) -> Path:
    """Validate audio ID and locate its uploaded file."""

    try:
        validated_id = str(uuid.UUID(audio_id))
    except (ValueError, AttributeError, TypeError):
        raise HTTPException(
            status_code=400,
            detail="Invalid audio ID."
        )

    for extension in ALLOWED_EXTENSIONS:
        candidate = UPLOAD_DIR / f"{validated_id}{extension}"

        if candidate.is_file():
            return candidate

    raise HTTPException(
        status_code=404,
        detail="Uploaded audio file not found."
    )


@router.post("/upload")
async def upload_audio(file: UploadFile = File(...)):
    """Upload, validate and store audio, then record it in history."""

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Filename is required."
        )

    extension = Path(file.filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only WAV and MP3 files are supported."
        )

    audio_id = str(uuid.uuid4())
    saved_filename = f"{audio_id}{extension}"
    file_path = UPLOAD_DIR / saved_filename
    total_size = 0

    try:
        # Save the uploaded file in chunks.
        with file_path.open("wb") as output_file:
            while True:
                chunk = await file.read(CHUNK_SIZE)

                if not chunk:
                    break

                total_size += len(chunk)

                if total_size > MAX_FILE_SIZE:
                    raise HTTPException(
                        status_code=413,
                        detail="File size must not exceed 25 MB."
                    )

                output_file.write(chunk)

        if total_size == 0:
            raise HTTPException(
                status_code=400,
                detail="Uploaded audio file is empty."
            )

        # Validate actual audio content.
        try:
            audio_data, _ = librosa.load(
                str(file_path),
                sr=None,
                mono=True,
                duration=1.0
            )

            if audio_data.size == 0:
                raise ValueError("No audio data found.")

        except Exception:
            raise HTTPException(
                status_code=422,
                detail="The uploaded file is not valid or supported audio."
            )

        # Save upload information in SQLite history.
        add_audio_record(
            audio_id=audio_id,
            filename=Path(file.filename).name,
            audio_format=extension.lstrip("."),
            file_size=total_size
        )

        return {
            "success": True,
            "message": "Audio uploaded successfully.",
            "audio_id": audio_id,
            "original_filename": Path(file.filename).name,
            "saved_filename": saved_filename,
            "file_size": total_size,
            "format": extension.lstrip(".")
        }

    except HTTPException:
        file_path.unlink(missing_ok=True)
        raise

    except Exception:
        file_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=500,
            detail="Unable to upload and save audio."
        )

    finally:
        await file.close()


@router.get("/analyze/{audio_id}")
async def analyze_uploaded_audio(audio_id: str):
    """Analyze a previously uploaded audio file."""

    file_path = find_audio_file(audio_id)
    validated_id = file_path.stem

    try:
        analysis_result = analyze_audio(str(file_path))

        return {
            "success": True,
            "audio_id": validated_id,
            "analysis": analysis_result
        }

    except FileNotFoundError:
        raise HTTPException(
            status_code=404,
            detail="Audio file not found."
        )

    except ValueError as error:
        raise HTTPException(
            status_code=422,
            detail=str(error)
        )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="An error occurred while analyzing the audio."
        )


@router.post("/restore/{audio_id}")
async def restore_uploaded_audio(audio_id: str):
    """Reduce noise, save restored WAV and update history."""

    input_path = find_audio_file(audio_id)
    validated_id = input_path.stem

    output_path = UPLOAD_DIR / f"{validated_id}_restored.wav"

    try:
        result = reduce_noise(
            str(input_path),
            str(output_path)
        )

        if not result.get("success") or not output_path.is_file():
            raise HTTPException(
                status_code=500,
                detail="Noise reduction failed."
            )

        # Update history only after successful restoration.
        updated = update_restoration_status(
            validated_id,
            output_path.name
        )

        if not updated:
            raise HTTPException(
                status_code=500,
                detail="Restoration history record could not be updated."
            )

        return FileResponse(
            path=str(output_path),
            media_type="audio/wav",
            filename=output_path.name
        )

    except HTTPException:
        raise

    except FileNotFoundError:
        raise HTTPException(
            status_code=404,
            detail="Input audio file not found."
        )

    except ValueError as error:
        raise HTTPException(
            status_code=422,
            detail=str(error)
        )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Noise reduction could not be completed."
        )


@router.get("/history")
async def get_audio_history_endpoint():
    """Return all uploaded audio and restoration history records."""

    try:
        records = get_audio_history()

        return {
            "success": True,
            "total_records": len(records),
            "history": records
        }

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to retrieve audio history."
        )
