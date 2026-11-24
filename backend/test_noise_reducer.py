
import numpy as np
import soundfile as sf
from pathlib import Path
from app.services.noise_reducer import reduce_noise

# Generate 5 seconds of test audio
sample_rate = 22050
duration = 5

time = np.linspace(
    0, duration, sample_rate * duration, endpoint=False
)

# Simulated voice-like signal mixed with background noise
clean_signal = (
    0.3 * np.sin(2 * np.pi * 440 * time)
    + 0.15 * np.sin(2 * np.pi * 660 * time)
)

noise = np.random.normal(0, 0.08, len(time))
noisy_signal = clean_signal + noise

# Save noisy test audio
uploads = Path("uploads")
uploads.mkdir(exist_ok=True)

input_file = uploads / "noisy_test.wav"
output_file = uploads / "cleaned_test.wav"

sf.write(input_file, noisy_signal, sample_rate)

print("Noisy test audio created.")

# Run noise reduction
result = reduce_noise(str(input_file), str(output_file))

print(result)
print("TEST COMPLETED")
