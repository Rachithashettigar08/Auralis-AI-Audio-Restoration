
import wave
import math
import struct

# Generate a 3-second test audio signal
sample_rate = 44100
duration = 3
frequency = 440

output_file = "test_audio.wav"

with wave.open(output_file, "w") as audio:
    audio.setnchannels(1)
    audio.setsampwidth(2)
    audio.setframerate(sample_rate)

    for i in range(sample_rate * duration):
        value = math.sin(
            2 * math.pi * frequency * i / sample_rate
        )

        amplitude = int(value * 12000)

        audio.writeframes(
            struct.pack("<h", amplitude)
        )

print("Test audio created successfully!")
print("File name:", output_file)
print("Duration: 3 seconds")
print("Format: WAV")
