import sounddevice as sd
import numpy as np

print(sd.query_devices())

duration = 3
sample_rate = 16000

print("🎤 Recording for 3 seconds… TALK NOW!")
audio = sd.rec(int(duration * sample_rate), 
               samplerate=sample_rate, 
               channels=1, 
               dtype='int16')

sd.wait()
print("Done.")
print("Max amplitude:", np.max(np.abs(audio)))
