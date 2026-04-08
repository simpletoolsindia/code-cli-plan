// Voice Input - Audio capture and speech-to-text
// Based on Claude Code's voice service

export interface VoiceConfig {
  language?: string
  audioFormat?: 'wav' | 'mp3' | 'webm' | 'ogg'
  sampleRate?: number
  silenceThreshold?: number
  maxDuration?: number
}

export interface AudioDevice {
  id: string
  name: string
  isDefault: boolean
}

export interface VoiceResult {
  text: string
  confidence?: number
  language?: string
  duration?: number
}

export const defaultVoiceConfig: VoiceConfig = {
  language: 'en-US',
  audioFormat: 'webm',
  sampleRate: 16000,
  silenceThreshold: 500,
  maxDuration: 30000,
}

// List available audio input devices
export async function listAudioDevices(): Promise<AudioDevice[]> {
  try {
    // Use Web Speech API if available (browser environment)
    if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const audioInputs = devices.filter(d => d.kind === 'audioinput')

      return audioInputs.map((device, idx) => ({
        id: device.deviceId,
        name: device.label || `Microphone ${idx + 1}`,
        isDefault: device.deviceId === 'default',
      }))
    }

    // Fallback for Node.js
    return [{ id: 'default', name: 'Default Microphone', isDefault: true }]
  } catch (e) {
    console.error('[Voice] Failed to list devices:', e)
    return [{ id: 'default', name: 'Default', isDefault: true }]
  }
}

// Audio recorder using MediaRecorder
export class AudioRecorder {
  private mediaRecorder?: MediaRecorder
  private audioChunks: Blob[] = []
  private stream?: MediaStream
  private config: VoiceConfig

  constructor(config: VoiceConfig = defaultVoiceConfig) {
    this.config = config
  }

  async start(deviceId?: string): Promise<void> {
    const constraints: MediaStreamConstraints = {
      audio: deviceId ? { deviceId: { exact: deviceId } } : true,
    }

    this.stream = await navigator.mediaDevices.getUserMedia(constraints)
    this.audioChunks = []

    const mimeType = this.getMimeType()
    this.mediaRecorder = new MediaRecorder(this.stream, { mimeType })

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        this.audioChunks.push(e.data)
      }
    }

    this.mediaRecorder.start()
  }

  async stop(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('Recorder not started'))
        return
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.audioChunks, { type: this.getMimeType() })
        resolve(blob)
      }

      this.mediaRecorder.stop()
      this.stream?.getTracks().forEach(t => t.stop())
    })
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording'
  }

  private getMimeType(): string {
    const formats: Record<string, string> = {
      webm: 'audio/webm',
      wav: 'audio/wav',
      mp3: 'audio/mp3',
      ogg: 'audio/ogg',
    }
    return formats[this.config.audioFormat ?? 'webm'] ?? 'audio/webm'
  }
}

// Speech-to-text using Web Speech API
export async function transcribeAudio(
  audioBlob: Blob,
  config: VoiceConfig = defaultVoiceConfig
): Promise<VoiceResult> {
  // For browser environment, use SpeechRecognition
  if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
    return transcribeWithWebSpeech(audioBlob, config)
  }

  // For Node.js or when Web Speech unavailable, use API
  return transcribeWithAPI(audioBlob, config)
}

// Web Speech API transcription
async function transcribeWithWebSpeech(
  _audioBlob: Blob,
  config: VoiceConfig
): Promise<VoiceResult> {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

  return new Promise((resolve, reject) => {
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = config.language ?? 'en-US'

    recognition.onresult = (event: any) => {
      const result = event.results[0][0]
      resolve({
        text: result.transcript,
        confidence: result.confidence,
        language: config.language,
      })
    }

    recognition.onerror = (event: any) => {
      reject(new Error(`Speech recognition error: ${event.error}`))
    }

    // Note: Web Speech API uses microphone directly, not audio blob
    // This would need to be connected to the MediaRecorder stream
    recognition.start()
  })
}

// API-based transcription (OpenAI Whisper or similar)
async function transcribeWithAPI(
  audioBlob: Blob,
  config: VoiceConfig
): Promise<VoiceResult> {
  // Convert blob to base64
  const arrayBuffer = await audioBlob.arrayBuffer()
  const base64 = Buffer.from(arrayBuffer).toString('base64')

  // Determine API endpoint from environment
  const apiUrl = process.env.VOICE_API_URL ?? 'https://api.openai.com/v1/audio/transcriptions'
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not set for voice transcription')
  }

  const formData = new FormData()
  formData.append('file', audioBlob, 'audio.webm')
  formData.append('model', 'whisper-1')
  if (config.language) {
    formData.append('language', config.language.split('-')[0])
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`Transcription failed: ${response.statusText}`)
  }

  const data = await response.json()

  return {
    text: data.text ?? '',
    language: config.language,
    duration: data.duration,
  }
}

// Voice command execution
export interface VoiceCommand {
  action: 'edit' | 'read' | 'search' | 'commit' | 'run'
  target?: string
  params?: Record<string, unknown>
}

// Parse voice command
export function parseVoiceCommand(text: string): VoiceCommand | null {
  const lower = text.toLowerCase()

  // Edit commands
  if (lower.includes('edit') || lower.includes('change') || lower.includes('update')) {
    const fileMatch = text.match(/(?:file|edit|change|update)\s+(\S+\.\w+)/i)
    return {
      action: 'edit',
      target: fileMatch?.[1],
    }
  }

  // Read commands
  if (lower.includes('read') || lower.includes('show') || lower.includes('open')) {
    const fileMatch = text.match(/(?:read|show|open)\s+(\S+\.\w+)/i)
    return {
      action: 'read',
      target: fileMatch?.[1],
    }
  }

  // Search commands
  if (lower.includes('search') || lower.includes('find')) {
    const queryMatch = text.match(/(?:search|find)\s+(?:for\s+)?["']?([^"']+)["']?/i)
    return {
      action: 'search',
      target: queryMatch?.[1],
    }
  }

  // Commit commands
  if (lower.includes('commit') || lower.includes('save')) {
    return { action: 'commit' }
  }

  // Run commands
  if (lower.includes('run') || lower.includes('execute') || lower.includes('start')) {
    const cmdMatch = text.match(/(?:run|execute|start)\s+(.+)/i)
    return {
      action: 'run',
      target: cmdMatch?.[1],
    }
  }

  return null
}

// Main voice input handler
export class VoiceInput {
  private recorder?: AudioRecorder
  private config: VoiceConfig

  constructor(config: VoiceConfig = defaultVoiceConfig) {
    this.config = config
    this.recorder = new AudioRecorder(config)
  }

  async startRecording(deviceId?: string): Promise<void> {
    await this.recorder?.start(deviceId)
  }

  async stopRecording(): Promise<VoiceResult> {
    const blob = await this.recorder?.stop()
    if (!blob) throw new Error('No audio recorded')

    return transcribeAudio(blob, this.config)
  }

  async voiceToCommand(deviceId?: string): Promise<VoiceCommand | null> {
    await this.startRecording(deviceId)

    // Wait for user to stop (in real implementation, use push-to-talk or silence detection)
    await new Promise(resolve => setTimeout(resolve, this.config.maxDuration ?? 30000))

    const result = await this.stopRecording()
    return parseVoiceCommand(result.text)
  }
}

export default {
  VoiceInput,
  AudioRecorder,
  listAudioDevices,
  transcribeAudio,
  parseVoiceCommand,
  defaultVoiceConfig,
}
