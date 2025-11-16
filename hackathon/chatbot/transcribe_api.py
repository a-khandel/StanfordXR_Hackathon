from flask import Flask, request, jsonify
from flask_cors import CORS
from faster_whisper import WhisperModel
import numpy as np
import io
import wave
import tempfile
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for browser requests

# Initialize  Whisper model
model = WhisperModel("small.en", device="cpu", compute_type="int8")

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    try:
        # Get audio file from request
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400

        audio_file = request.files['audio']

        # Save to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as temp_audio:
            audio_file.save(temp_audio.name)
            temp_path = temp_audio.name

        try:
            # Transcribe using Whisper
            segments, _ = model.transcribe(
                temp_path,
                language="en",
                beam_size=1
            )

            # Combine all segments into full text
            full_text = " ".join([s.text for s in segments]).strip()

            return jsonify({
                'success': True,
                'transcript': full_text
            })

        finally:
            # Clean up temp file
            if os.path.exists(temp_path):
                os.remove(temp_path)

    except Exception as e:
        print(f"Transcription error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'model': 'small.en'})

if __name__ == '__main__':
    print("Starting Whisper transcription API on http://localhost:8789")
    app.run(host='0.0.0.0', port=8789, debug=True)
