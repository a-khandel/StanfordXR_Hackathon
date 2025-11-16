import sounddevice as sd 
import numpy as np 
import queue
import threading
from faster_whisper import WhisperModel
from conversation import get_diagram_actions
import json
import time

sampleRate = 16000
block_duration = 0.5
channels = 1

frames_per_block = int(sampleRate * block_duration)

audio_queue = queue.Queue()
audio_buffer = []   # stores audio while listening
model = WhisperModel("small.en", device="cpu", compute_type="int8")

listen = False   # start muted


# ------------------------------------------------------------
# TOGGLE LISTEN WITH ENTER (macOS SAFE)
# ------------------------------------------------------------
def toggle_listen():
    global listen
    while True:
        input("\nPress ENTER to toggle listening…")
        listen = not listen
        print("\n==> LISTEN =", listen)

        # if user switched to mute, process audio
        if not listen:
            process_audio()


# ------------------------------------------------------------
# PROCESS buffered audio ONCE after mute
# ------------------------------------------------------------
def process_audio():
    global audio_buffer

    if len(audio_buffer) == 0:
        print("No audio recorded.")
        return

    print("Processing audio...")

    audio_data = np.concatenate(audio_buffer).flatten().astype(np.float32)
    audio_buffer = []  # clear buffer for next command

    # TRANSCRIBE
    segments, _ = model.transcribe(
        audio_data,
        language="en",
        beam_size=1
    )

    full_text = " ".join([s.text for s in segments]).strip()
    print("Full transcript:", full_text)

    # GPT REASONING (optional)
    # actions = get_diagram_actions(full_text)

    # WRITE natural-language prompt for the agent (Option A)
    out = {
        "id": time.time(),
        "message": full_text    # <-- THIS is the important fix
    }

    with open("public/actions.json", "w") as f:
        json.dump(out, f, indent=2)

    print("Wrote public/actions.json")


# ------------------------------------------------------------
# AUDIO CALLBACK
# ------------------------------------------------------------
def audio_callback(indata, frames, time, status):
    if status:
        print(status)
    if listen:
        audio_queue.put(indata.copy())


# ------------------------------------------------------------
# RECORD MICROPHONE
# ------------------------------------------------------------
def recorder():
    with sd.InputStream(
        samplerate=sampleRate,
        channels=channels,
        callback=audio_callback,
        blocksize=frames_per_block
    ):
        print("System ready.")
        print("Press ENTER to start talking…")
        while True:
            sd.sleep(100)


# ------------------------------------------------------------
# BUFFER AUDIO CHUNKS
# ------------------------------------------------------------
def buffer_loop():
    global audio_buffer

    while True:
        if listen and not audio_queue.empty():
            audio_buffer.append(audio_queue.get())
        time.sleep(0.01)


# ------------------------------------------------------------
# START THREADS
# ------------------------------------------------------------
threading.Thread(target=recorder, daemon=True).start()
threading.Thread(target=buffer_loop, daemon=True).start()
threading.Thread(target=toggle_listen, daemon=True).start()

while True:
    time.sleep(1)
