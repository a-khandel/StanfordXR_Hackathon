# Voice Recording Integration Guide

## Overview
The voice recording feature has been successfully integrated with the Python Whisper transcription backend. This allows users to speak directly into the VisionPro app and have their speech transcribed and sent to the TLDraw AI agent.

## Architecture

### Three-Server Setup
1. **Frontend (Vite Dev Server)**: http://localhost:5173/webspatial/avp
   - React app with TLDraw integration
   - VoiceRecorder component for audio capture

2. **Worker Backend (Cloudflare)**: http://localhost:8787
   - Handles AI agent requests (/stream endpoint)
   - Proxies requests between frontend and AI

3. **Transcription API (Python Flask)**: http://localhost:8789
   - Accepts audio files via POST /transcribe
   - Uses Whisper (faster-whisper) for speech-to-text
   - Returns JSON with transcript

## How to Use

### Starting the Servers

1. **Start the Python Transcription API**:
   ```bash
   cd /Users/aryankhandelwal/Desktop/webspatial-projects/StanfordXR_Hackathon/chatbot
   python3 transcribe_api.py
   ```

2. **Start the Cloudflare Worker** (from webspatial-visionos directory):
   ```bash
   pnpm wrangler dev --port 8787
   ```

3. **Start the Frontend** (from webspatial-visionos directory):
   ```bash
   pnpm dev:avp
   ```

### Using Voice Input

1. **Click the microphone button** (🎤) in the chat input area
2. **Start speaking** - the button will turn red (🎙️) with a pulse animation
3. **Click again to stop** - the button will show a processing state (⏳)
4. **Transcription appears** - your spoken text will automatically populate the input field

### Keyboard Shortcut
- **Cmd+M (Mac) / Ctrl+M (Windows/Linux)**: Toggle recording on/off

## Files Modified/Created

### New Files
- `/StanfordXR_Hackathon/chatbot/transcribe_api.py` - Flask API for Whisper transcription
- `/StanfordXR_Hackathon/chatbot/requirements_api.txt` - Python dependencies

### Modified Files
- `/webspatial-visionos/src/components/VoiceRecorder.tsx` - Voice recording component
- `/webspatial-visionos/src/components/ChatInput.tsx` - Integrated VoiceRecorder
- `/webspatial-visionos/src/tldraw-agent.css` - Added pulse animation for recording state

## Technical Flow

1. User clicks microphone → Browser requests microphone permission
2. Audio recording starts → MediaRecorder captures audio as WebM
3. User stops recording → Audio blob is created
4. Audio blob sent to Python API → POST to http://localhost:8789/transcribe
5. Whisper processes audio → Returns transcript as JSON
6. Transcript populates input → User can edit/submit to AI agent

## Troubleshooting

### Port Already in Use
If port 8789 is already in use:
```bash
lsof -ti:8789 | xargs kill -9
python3 transcribe_api.py
```

### Microphone Permission Denied
- Check browser settings and allow microphone access
- On VisionPro, ensure app has microphone permissions

### Transcription Errors
- Ensure faster-whisper is installed: `pip3 install faster-whisper`
- Check Python API logs for errors
- Verify audio is being recorded (check blob size in console)

## Next Steps

To integrate diagram generation from voice:
1. Voice → Transcription (✓ Complete)
2. Transcription → ChatInput (✓ Complete)
3. ChatInput → AI Agent (✓ Complete)
4. AI Agent → Diagram Drawing (✓ Complete via existing agent)

The full voice-to-diagram pipeline is now functional!
