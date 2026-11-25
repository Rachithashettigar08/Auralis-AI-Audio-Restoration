
import io
import shutil

import numpy as np
import soundfile as sf
import pytest

from fastapi.testclient import TestClient

from app.main import app
from app.routes import audio as audio_routes
from app import database


@pytest.fixture
def client(tmp_path, monkeypatch):
    """Use temporary upload and database locations for every test."""

    monkeypatch.setattr(audio_routes, "UPLOAD_DIR", tmp_path)
    monkeypatch.setattr(
        database,
        "DATABASE_PATH",
        tmp_path / "test_history.db"
    )

    database.initialize_database()

    with TestClient(app) as test_client:
        yield test_client


def create_test_wav():
    """Create a valid sample WAV file for API testing."""

    sample_rate = 22050
    duration = 2

    time = np.linspace(
        0,
        duration,
        sample_rate * duration,
        endpoint=False
    )

    audio = 0.3 * np.sin(2 * np.pi * 440 * time)

    buffer = io.BytesIO()
    sf.write(buffer, audio, sample_rate, format="WAV")
    buffer.seek(0)

    return buffer


def test_home_endpoint(client):
    response = client.get("/")

    assert response.status_code == 200
    assert response.json()["success"] is True


def test_upload_valid_audio(client):
    response = client.post(
        "/api/audio/upload",
        files={
            "file": (
                "test.wav",
                create_test_wav(),
                "audio/wav"
            )
        }
    )

    assert response.status_code == 200
    assert response.json()["success"] is True
    assert "audio_id" in response.json()


def test_reject_unsupported_file(client):
    response = client.post(
        "/api/audio/upload",
        files={
            "file": (
                "test.txt",
                b"not an audio file",
                "text/plain"
            )
        }
    )

    assert response.status_code == 400


def test_reject_empty_file(client):
    response = client.post(
        "/api/audio/upload",
        files={
            "file": (
                "empty.wav",
                b"",
                "audio/wav"
            )
        }
    )

    assert response.status_code == 400


def test_reject_invalid_audio_id(client):
    response = client.get(
        "/api/audio/analyze/invalid-id"
    )

    assert response.status_code == 400


def test_analyze_uploaded_audio(client):
    upload_response = client.post(
        "/api/audio/upload",
        files={
            "file": (
                "test.wav",
                create_test_wav(),
                "audio/wav"
            )
        }
    )

    assert upload_response.status_code == 200

    audio_id = upload_response.json()["audio_id"]

    response = client.get(
        f"/api/audio/analyze/{audio_id}"
    )

    assert response.status_code == 200
    assert response.json()["success"] is True
    assert "analysis" in response.json()


def test_restore_uploaded_audio(client, monkeypatch):
    upload_response = client.post(
        "/api/audio/upload",
        files={
            "file": (
                "test.wav",
                create_test_wav(),
                "audio/wav"
            )
        }
    )

    assert upload_response.status_code == 200

    audio_id = upload_response.json()["audio_id"]

    def fake_reduce_noise(input_path, output_path):
        shutil.copyfile(input_path, output_path)
        return {"success": True}

    monkeypatch.setattr(
        audio_routes,
        "reduce_noise",
        fake_reduce_noise
    )

    response = client.post(
        f"/api/audio/restore/{audio_id}"
    )

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("audio/wav")
    assert len(response.content) > 0

    # Verify that restoration status was updated in history.
    history_response = client.get("/api/audio/history")

    assert history_response.status_code == 200

    history = history_response.json()["history"]

    assert len(history) == 1
    assert history[0]["audio_id"] == audio_id
    assert history[0]["restoration_status"] == "Restored"
    assert history[0]["restored_filename"] == f"{audio_id}_restored.wav"


def test_audio_history_records_upload(client):
    upload_response = client.post(
        "/api/audio/upload",
        files={
            "file": (
                "test.wav",
                create_test_wav(),
                "audio/wav"
            )
        }
    )

    assert upload_response.status_code == 200

    audio_id = upload_response.json()["audio_id"]

    response = client.get("/api/audio/history")

    assert response.status_code == 200

    data = response.json()

    assert data["success"] is True
    assert data["total_records"] == 1
    assert len(data["history"]) == 1

    record = data["history"][0]

    assert record["audio_id"] == audio_id
    assert record["original_filename"] == "test.wav"
    assert record["restoration_status"] == "Not restored"


def test_reject_invalid_audio_content(client):
    response = client.post(
        "/api/audio/upload",
        files={
            "file": (
                "fake.wav",
                b"This is not a real audio file",
                "audio/wav"
            )
        }
    )

    assert response.status_code == 422
    assert "not valid" in response.json()["detail"]
