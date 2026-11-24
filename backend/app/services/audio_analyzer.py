
import os

import librosa
import numpy as np


def analyze_audio(file_path: str) -> dict:
    """
    Analyze an audio recording and return measurable
    audio characteristics and basic degradation indicators.

    Args:
        file_path: Path to the uploaded audio file.

    Returns:
        Dictionary containing audio analysis results.
    """

    if not os.path.isfile(file_path):
        raise FileNotFoundError("Audio file not found.")

    # Load audio without changing its original sample rate.
    audio, sample_rate = librosa.load(
        file_path,
        sr=None,
        mono=True
    )

    if audio.size == 0:
        raise ValueError("The uploaded audio file is empty.")

    # Basic audio information
    duration = len(audio) / sample_rate
    peak_amplitude = float(np.max(np.abs(audio)))
    mean_amplitude = float(np.mean(np.abs(audio)))

    # RMS energy
    rms = librosa.feature.rms(y=audio)[0]
    average_rms = float(np.mean(rms))
    max_rms = float(np.max(rms))

    # Zero crossing rate
    zcr = librosa.feature.zero_crossing_rate(y=audio)[0]
    average_zcr = float(np.mean(zcr))

    # Spectral characteristics
    spectral_centroid = librosa.feature.spectral_centroid(
        y=audio,
        sr=sample_rate
    )[0]

    spectral_bandwidth = librosa.feature.spectral_bandwidth(
        y=audio,
        sr=sample_rate
    )[0]

    spectral_rolloff = librosa.feature.spectral_rolloff(
        y=audio,
        sr=sample_rate
    )[0]

    # Clipping detection
    clipping_threshold = 0.999
    clipped_samples = int(
        np.sum(np.abs(audio) >= clipping_threshold)
    )

    clipping_percentage = (
        clipped_samples / len(audio)
    ) * 100

    # Silence detection using frame RMS
    silence_threshold = max(1e-4, max_rms * 0.01)
    silent_frames = int(np.sum(rms < silence_threshold))

    silence_percentage = (
        silent_frames / len(rms)
    ) * 100

    # Basic degradation indicators
    degradation = {
        "possible_clipping": bool(clipping_percentage > 0.1),
        "significant_silence": bool(silence_percentage > 20),
    }

    # Return JSON-friendly results
    return {
        "success": True,
        "audio_information": {
            "duration_seconds": round(float(duration), 3),
            "sample_rate": int(sample_rate),
            "channels_analyzed": 1,
            "total_samples": int(len(audio)),
        },
        "amplitude_metrics": {
            "peak_amplitude": round(peak_amplitude, 6),
            "mean_amplitude": round(mean_amplitude, 6),
            "average_rms": round(average_rms, 6),
            "maximum_rms": round(max_rms, 6),
        },
        "frequency_metrics": {
            "zero_crossing_rate": round(average_zcr, 6),
            "spectral_centroid_hz": round(
                float(np.mean(spectral_centroid)), 3
            ),
            "spectral_bandwidth_hz": round(
                float(np.mean(spectral_bandwidth)), 3
            ),
            "spectral_rolloff_hz": round(
                float(np.mean(spectral_rolloff)), 3
            ),
        },
        "degradation_indicators": {
            "clipping_percentage": round(
                float(clipping_percentage), 4
            ),
            "silence_percentage": round(
                float(silence_percentage), 2
            ),
            **degradation,
        },
        "analysis_notes": [
            "Audio was converted to mono for analysis.",
            "Clipping and silence are basic signal indicators.",
            "Noise, echo and reverberation require additional "
            "analysis and cannot be reliably confirmed by "
            "these measurements alone."
        ]
    }
