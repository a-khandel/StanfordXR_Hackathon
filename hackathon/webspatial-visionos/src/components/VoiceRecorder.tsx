import { useEffect, useState, useRef, useCallback } from 'react'

interface VoiceRecorderProps {
  onTranscript: (text: string) => void
  className?: string
}

export function VoiceRecorder({ onTranscript, className = '' }: VoiceRecorderProps) {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
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
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Could not access microphone. Please check permissions.')
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
        onTranscript(result.transcript)
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
    <button
      onClick={toggleRecording}
      disabled={isProcessing}
      className={`voice-recorder ${isListening ? 'listening' : ''} ${isProcessing ? 'processing' : ''} ${className}`}
      title={`${isListening ? 'Stop' : 'Start'} recording (Cmd+M)`}
      style={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        border: 'none',
        background: isListening
          ? 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)'
          : isProcessing
          ? 'linear-gradient(135deg, #ffd89b 0%, #19547b 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        cursor: isProcessing ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        boxShadow: isListening
          ? '0 0 20px rgba(255, 65, 108, 0.6)'
          : '0 2px 8px rgba(0, 0, 0, 0.15)',
        transition: 'all 0.3s ease',
        animation: isListening ? 'pulse 1.5s infinite' : 'none',
      }}
    >
      {isProcessing ? '⏳' : isListening ? '🎙️' : '🎤'}
    </button>
  )
}
