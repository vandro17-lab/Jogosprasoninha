'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import MicButton from '@/components/MicButton'
import AudioWaves from '@/components/AudioWaves'
import ProgressDots from '@/components/ProgressDots'
import { getSession, saveSession } from '@/lib/session-store'

const MAX_DURATION = 120 // 2 minutos
const WARN_AT = 90      // aviso aos 30s restantes

export default function MemoriasPage() {
  const router = useRouter()
  const [recording, setRecording] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [aiResponse, setAiResponse] = useState<string | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [memoriesCount, setMemoriesCount] = useState(0)
  const [error, setError] = useState('')
  const [finalizing, setFinalizing] = useState(false)
  const [audioSaved, setAudioSaved] = useState(false) // fallback: áudio salvo sem transcrição

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const mimeTypeRef = useRef('audio/webm')

  const session = getSession()

  useEffect(() => {
    if (!session.nome) { router.replace('/identificacao'); return }
    setMemoriesCount(session.memories?.length ?? 0)
  }, [])

  // Auto-para ao atingir 2 minutos
  useEffect(() => {
    if (recording && elapsed >= MAX_DURATION) stopRecording()
  }, [elapsed, recording])

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }, [])

  const startRecording = useCallback(async () => {
    setError('')
    setAiResponse(null)
    setAudioSaved(false)
    chunksRef.current = []

    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      setError('Não consegui acessar o microfone. Verifique as permissões 😊')
      return
    }
    streamRef.current = stream

    const mimeType =
      MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' :
      MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' :
      MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' :
      ''
    mimeTypeRef.current = mimeType

    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {})
    mediaRecorderRef.current = recorder
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
    recorder.start(1000)

    setRecording(true)
    setElapsed(0)
    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000)
  }, [])

  const stopRecording = useCallback(async () => {
    stopTimer()
    setRecording(false)

    const recorder = mediaRecorderRef.current
    if (!recorder) return

    await new Promise<void>((resolve) => { recorder.onstop = () => resolve(); recorder.stop() })
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    mediaRecorderRef.current = null

    const chunks = chunksRef.current
    if (!chunks.length) {
      setError('Não ouvi nada. Tente falar mais perto do microfone 😊')
      return
    }

    const mimeType = mimeTypeRef.current || 'audio/webm'
    const ext = mimeType.includes('mp4') ? 'mp4' : mimeType.includes('ogg') ? 'ogg' : 'webm'
    const blob = new Blob(chunks, { type: mimeType })

    setProcessing(true)
    try {
      // 1. Transcrever com Groq Whisper (com retry automático no servidor)
      const form = new FormData()
      form.append('audio', blob, `audio.${ext}`)
      const transcribeRes = await fetch('/api/transcribe', { method: 'POST', body: form })
      const transcribeData = await transcribeRes.json()

      // Fallback: se transcrição falhou, salvar áudio bruto no Supabase
      if (transcribeData.failed || !transcribeData.transcript?.trim()) {
        const currentSession = getSession()
        const fallbackForm = new FormData()
        fallbackForm.append('file', blob, `audio.${ext}`)
        fallbackForm.append('participantId', currentSession.participantId ?? '')
        fallbackForm.append('tipo', 'memoria_pendente')
        await fetch('/api/upload-audio', { method: 'POST', body: fallbackForm })
        setAudioSaved(true)
        setProcessing(false)
        return
      }

      const transcript = transcribeData.transcript
      const currentSession = getSession()

      // 2. Salvar memória bruta
      await fetch('/api/save-memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId: currentSession.participantId, memoriaBreita: transcript }),
      })

      // 3. Resposta da IA
      const res = await fetch('/api/generate-final', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'quick', transcript, nome: currentSession.nome }),
      })
      const data = await res.json()

      // 4. Atualizar sessão
      const updatedMemories = [...(currentSession.memories ?? []), transcript]
      saveSession({ memories: updatedMemories })
      setMemoriesCount(updatedMemories.length)
      setAiResponse(data.response ?? 'Que lembrança bonita 😊')
    } catch {
      setAiResponse('Que lembrança bonita 😊\n\nPode contar mais uma ou finalizar quando quiser.')
    } finally {
      setProcessing(false)
    }
  }, [stopTimer])

  const handleMicClick = useCallback(() => {
    if (recording) stopRecording()
    else startRecording()
  }, [recording, startRecording, stopRecording])

  async function handleFinalize() {
    const currentSession = getSession()
    if (!currentSession.memories?.length) {
      setError('Conta pelo menos uma lembrança antes de finalizar 😊')
      return
    }
    setFinalizing(true)
    try {
      const res = await fetch('/api/generate-final', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'final',
          participantId: currentSession.participantId,
          nome: currentSession.nome,
          parentesco: currentSession.parentesco,
          memories: currentSession.memories,
        }),
      })
      const data = await res.json()
      saveSession({ memoriaFinal: data.mensagemFinal })
      router.push('/revisao')
    } catch {
      setError('Algo deu errado. Tente de novo 😊')
      setFinalizing(false)
    }
  }

  const remaining = MAX_DURATION - elapsed
  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  return (
    <main className="min-h-screen flex flex-col px-6 py-10">
      <div className="max-w-sm w-full mx-auto flex flex-col gap-6 animate-fade-in">
        <div className="text-center">
          <ProgressDots total={5} current={1} />
          {memoriesCount > 0 && (
            <p className="text-text-muted text-xs mt-3">
              {memoriesCount} {memoriesCount === 1 ? 'lembrança guardada' : 'lembranças guardadas'} 🤍
            </p>
          )}
        </div>

        {/* Card principal */}
        <div
          className="rounded-3xl p-8 flex flex-col items-center gap-6"
          style={{ background: '#FFFDF9', border: '1px solid #E8D5A3' }}
        >
          {!recording && !processing && !aiResponse && !audioSaved && (
            <div className="text-center animate-fade-in">
              <p className="font-playfair text-xl text-text-dark">
                {memoriesCount === 0
                  ? `Perfeito${session.nome ? `, ${session.nome}` : ''} 😊`
                  : 'Mais uma? 😊'}
              </p>
              <p className="text-text-muted text-sm mt-2 leading-relaxed">
                {memoriesCount === 0
                  ? 'Agora é só tocar no microfone e contar uma lembrança da Sônia.\n\nPode falar do seu jeito mesmo.'
                  : 'Toque no microfone para contar mais uma lembrança.'}
              </p>
            </div>
          )}

          {recording && (
            <div className="text-center animate-fade-in">
              <p className="text-text-muted text-sm">Estou ouvindo…</p>
              <p className="font-playfair text-3xl text-gold mt-1">{formatTime(elapsed)}</p>
              {elapsed >= WARN_AT && (
                <p className="text-amber-500 text-xs mt-1 animate-fade-in">
                  {remaining}s restantes
                </p>
              )}
            </div>
          )}

          {processing && (
            <div className="text-center animate-fade-in">
              <p className="text-text-muted text-sm">Transcrevendo sua lembrança…</p>
            </div>
          )}

          {/* Fallback: áudio salvo sem transcrição */}
          {audioSaved && !recording && !processing && (
            <div className="w-full text-center animate-fade-in">
              <div className="rounded-2xl p-4" style={{ background: '#F0E8D8' }}>
                <p className="text-text-dark text-sm leading-relaxed">
                  Sua gravação foi salva com carinho 🤍<br />
                  <span className="text-text-muted text-xs">Assim que possível ela será processada.</span>
                </p>
              </div>
            </div>
          )}

          <AudioWaves active={recording} />

          {!processing && (
            <MicButton recording={recording} onClick={handleMicClick} disabled={processing || finalizing} />
          )}

          {processing && (
            <div className="w-12 h-12 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
          )}

          {aiResponse && !recording && !processing && (
            <div className="w-full text-center animate-fade-in">
              <div className="rounded-2xl p-4" style={{ background: '#F0E8D8' }}>
                <p className="text-text-dark text-sm leading-relaxed whitespace-pre-line">{aiResponse}</p>
              </div>
            </div>
          )}

          {error && (
            <p className="text-red-400 text-sm text-center animate-fade-in">{error}</p>
          )}
        </div>

        {/* Botão finalizar */}
        <button
          onClick={handleFinalize}
          disabled={finalizing || recording || processing || memoriesCount === 0}
          className="w-full py-4 rounded-2xl font-medium text-gold-dark text-base transition-all duration-200 active:scale-98 disabled:opacity-40"
          style={{ background: '#F0E8D8', border: '1px solid #E8D5A3' }}
        >
          {finalizing ? 'Preparando sua mensagem…' : 'Finalizar ✓'}
        </button>

        {memoriesCount === 0 && (
          <p className="text-text-muted text-xs text-center">
            Grave pelo menos uma lembrança para finalizar
          </p>
        )}
      </div>
    </main>
  )
}
