import { useCallback, useEffect, useRef, useState } from 'react'
import { TldrawAgent } from '../agent/TldrawAgent'

interface FloatingMicrophoneProps {
  agent: TldrawAgent
}

export function FloatingMicrophone({ agent }: FloatingMicrophoneProps) {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  console.log('FloatingMicrophone rendered', { isListening, isProcessing })

  const startRecording = useCallback(async () => {
    try {
      console.log('Requesting microphone access...')

      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia not supported in this environment')
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })

      console.log('Microphone access granted!')
      streamRef.current = stream

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        await processAudio(audioBlob)
      }

      mediaRecorder.start()
      setIsListening(true)
    } catch (error: any) {
      console.error('Error accessing microphone:', error)

      let errorMessage = 'Microphone Error:\n\n'

      if (error.name === 'NotAllowedError') {
        errorMessage += '❌ Permission denied.\n\n'
        errorMessage += 'VisionPro Emulator:\n'
        errorMessage += '1. Close the app\n'
        errorMessage += '2. Go to Settings > Privacy & Security > Microphone\n'
        errorMessage += '3. Enable microphone for Safari/Browser\n'
        errorMessage += '4. Reopen the app\n\n'
        errorMessage += 'Browser:\n'
        errorMessage += '• Click the lock icon in address bar\n'
        errorMessage += '• Allow microphone access'
      } else if (error.name === 'NotFoundError') {
        errorMessage += '❌ No microphone found.\n\n'
        errorMessage += 'VisionPro Emulator may not support microphone.\n'
        errorMessage += 'Try using keyboard shortcut Cmd+M or test in Safari browser.'
      } else {
        errorMessage += `❌ ${error.message}\n\n`
        errorMessage += 'Try:\n'
        errorMessage += '• Refreshing the page\n'
        errorMessage += '• Using Safari browser instead of emulator\n'
        errorMessage += '• Checking system microphone permissions'
      }

      alert(errorMessage)
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
      setIsListening(false)
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }, [])

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true)

    try {
      // Send audio to Python Whisper backend
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')

      const response = await fetch('http://localhost:8789/transcribe', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.success && result.transcript) {
        // Auto-submit to agent
        const transcript = result.transcript.trim()
        if (transcript) {
          agent.prompt({
            message: transcript,
            contextItems: [],
            bounds: agent.editor.getViewportPageBounds(),
            modelName: agent.$modelName.get(),
            selectedShapes: agent.editor.getSelectedShapes(),
            type: 'user',
          })
        }
      } else {
        throw new Error('No transcript returned')
      }

    } catch (error) {
      console.error('Error processing audio:', error)
      alert('Transcription failed. Make sure the Python backend is running on localhost:8789')
    } finally {
      setIsProcessing(false)
    }
  }

  const toggleRecording = useCallback(() => {
    console.log('toggleRecording clicked!', { isListening })
    if (isListening) {
      stopRecording()
    } else {
      startRecording()
    }
  }, [isListening, startRecording, stopRecording])

  // Handle cmd/ctrl key for toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd on Mac, Ctrl on Windows/Linux
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'm') {
        e.preventDefault()
        toggleRecording()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleRecording])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isListening) {
        stopRecording()
      }
    }
  }, [isListening, stopRecording])

  return (
    <div
      className="floating-microphone"
      style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 99999,
        pointerEvents: 'auto',
        touchAction: 'auto'
      }}
    >
      <button
        onClick={toggleRecording}
        onTouchEnd={(e) => {
          e.preventDefault()
          toggleRecording()
        }}
        disabled={isProcessing}
        className={`mic-button ${isListening ? 'listening' : ''} ${isProcessing ? 'processing' : ''}`}
        title={`${isListening ? 'Stop' : 'Start'} recording (Cmd+M)`}
        style={{
          pointerEvents: 'auto',
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent',
          userSelect: 'none'
        }}
      >
        {isProcessing ? '⏳' : isListening ? '🎙️' : '🎤'}
      </button>
      {isListening && (
        <div className="recording-indicator">
          <span className="recording-dot"></span>
          Recording...
        </div>
      )}
    </div>
  )
}
