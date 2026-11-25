
import sqlite3
from pathlib import Path
from datetime import datetime, timezone

# Database location
BASE_DIR = Path(__file__).resolve().parents[1]
DATABASE_PATH = BASE_DIR / "audio_history.db"


def get_connection():
    """Create and return a database connection."""
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():
    """Create the audio history table if it does not exist."""

    with get_connection() as connection:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS audio_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                audio_id TEXT UNIQUE NOT NULL,
                original_filename TEXT NOT NULL,
                audio_format TEXT NOT NULL,
                file_size INTEGER NOT NULL,
                uploaded_at TEXT NOT NULL,
                restoration_status TEXT NOT NULL DEFAULT 'Not restored',
                restored_filename TEXT
            )
        """)
        connection.commit()


def add_audio_record(audio_id, filename, audio_format, file_size):
    """Save a newly uploaded audio file in history."""

    with get_connection() as connection:
        connection.execute("""
            INSERT INTO audio_history (
                audio_id,
                original_filename,
                audio_format,
                file_size,
                uploaded_at
            )
            VALUES (?, ?, ?, ?, ?)
        """, (
            audio_id,
            filename,
            audio_format,
            file_size,
            datetime.now(timezone.utc).isoformat()
        ))
        connection.commit()


def update_restoration_status(audio_id, restored_filename):
    """Update the record after successful restoration."""

    with get_connection() as connection:
        cursor = connection.execute("""
            UPDATE audio_history
            SET restoration_status = ?,
                restored_filename = ?
            WHERE audio_id = ?
        """, (
            "Restored",
            restored_filename,
            audio_id
        ))
        connection.commit()

        return cursor.rowcount > 0


def get_audio_history():
    """Retrieve all audio records, newest first."""

    with get_connection() as connection:
        records = connection.execute("""
            SELECT
                audio_id,
                original_filename,
                audio_format,
                file_size,
                uploaded_at,
                restoration_status,
                restored_filename
            FROM audio_history
            ORDER BY id DESC
        """).fetchall()

        return [dict(record) for record in records]
