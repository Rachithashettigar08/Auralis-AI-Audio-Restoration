
import os
from pathlib import Path

import librosa
import noisereduce as nr
import numpy as np
import soundfile as sf


def reduce_noise(input_path: str, output_path: str) -> dict:
    """Reduce background noise and save the restored audio as WAV."""

    if not os.path.isfile(input_path):
        raise FileNotFoundError("Input audio file not found.")

    try:
        audio, sample_rate = librosa.load(
            input_path,
            sr=None,
            mono=False
        )

        if audio.size == 0:
            raise ValueError("The input audio file is empty.")

        if not np.all(np.isfinite(audio)):
            raise ValueError("Audio contains invalid numeric values.")

        # Process each channel separately to preserve stereo audio.
        if audio.ndim == 1:
            cleaned_audio = nr.reduce_noise(
                y=audio,
                sr=sample_rate,
                stationary=False,
                prop_decrease=0.8
            )
        elif audio.ndim == 2:
            cleaned_channels = [
                nr.reduce_noise(
                    y=channel,
                    sr=sample_rate,
                    stationary=False,
                    prop_decrease=0.8
                )
                for channel in audio
            ]
            cleaned_audio = np.stack(cleaned_channels, axis=0)
        else:
            raise ValueError("Unsupported audio channel configuration.")

        if not np.all(np.isfinite(cleaned_audio)):
            raise ValueError("Noise reduction produced invalid audio.")

        output = Path(output_path)
        output.parent.mkdir(parents=True, exist_ok=True)

        # SoundFile expects stereo data as (samples, channels).
        audio_to_save = (
            cleaned_audio.T if cleaned_audio.ndim == 2
            else cleaned_audio
        )

        sf.write(
            str(output),
            audio_to_save,
            sample_rate,
            format="WAV"
        )

        return {
            "success": True,
            "message": "Noise reduction completed successfully.",
            "output_path": str(output),
            "sample_rate": int(sample_rate),
            "channels": 1 if cleaned_audio.ndim == 1 else int(cleaned_audio.shape[0]),
            "duration_seconds": round(cleaned_audio.shape[-1] / sample_rate, 2)
        }

    except (FileNotFoundError, ValueError):
        raise
    except Exception as error:
        raise RuntimeError("Audio noise reduction could not be completed.") from error
