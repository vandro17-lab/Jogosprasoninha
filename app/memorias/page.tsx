'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import MicButton from '@/components/MicButton'
import AudioWaves from '@/components/AudioWaves'
import ProgressDots from '@/components/ProgressDots'
import { getSession, saveSession } from '@/lib/session-store'

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult
  length: number
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative
  isFinal: boolean
  length: number
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  start(): void
  stop(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: Event) => void) | null
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance
    webkitSpeechRecognition: new () => SpeechRecognitionInstance
  }
}

export default function MemoriasPage() {
  const router = useRouter()
  const [recording, setRecording] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [aiResponse, setAiResponse] = useState<string | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [memoriesCount, setMemoriesCount] = useState(0)
  const [error, setError] = useState('')
  const [finalizing, setFinalizing] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(true)

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const transcriptRef = useRef('')

  const session = getSession()

  useEffect(() => {
    if (!session.nome) { router.replace('/identificacao'); return }
    setMemoriesCount(session.memories?.length ?? 0)

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) setSpeechSupported(false)
  }, [])

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startRecording = useCallback(() => {
    setError('')
    setAiResponse(null)
    transcriptRef.current = ''

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      setError('Seu navegador não suporta gravação de voz. Use o Chrome 😊')
      return
    }

    const recognition = new SR()
    recognition.lang = 'pt-BR'
    recognition.continuous = true
    recognition.interimResults = false

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const results = Array.from(event.results)
      transcriptRef.current = results
        .filter((r) => r.isFinal)
        .map((r) => r[0].transcript)
        .join(' ')
        .trim()
    }

    recognition.onerror = () => {
      stopRecording()
      setError('Não consegui ouvir. Tente de novo 😊')
    }

    recognition.start()
    recognitionRef.current = recognition

    setRecording(true)
    setElapsed(0)
    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000)
  }, [stopTimer])

  const stopRecording = useCallback(async () => {
    recognitionRef.current?.stop()
    recognitionRef.current = null
    stopTimer()
    setRecording(false)

    const transcript = transcriptRef.current
    if (!transcript) {
      setError('Não ouvi nada. Tente falar mais perto do microfone 😊')
      return
    }

    setProcessing(true)
    try {
      const session = getSession()

      // Salva memória bruta
      await fetch('/api/save-memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId: session.participantId, memoriaBreita: transcript }),
      })

      // Pede resposta da IA
      const res = await fetch('/api/generate-final', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'quick',
          transcript,
          nome: session.nome,
        }),
      })
      const data = await res.json()

      // Atualiza sessão com nova memória
      const updatedMemories = [...(session.memories ?? []), transcript]
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
    if (recording) {
      stopRecording()
    } else {
      startRecording()
    }
  }, [recording, startRecording, stopRecording])

  async function handleFinalize() {
    const session = getSession()
    if (!session.memories?.length) {
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
          participantId: session.participantId,
          nome: session.nome,
          parentesco: session.parentesco,
          memories: session.memories,
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

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

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
          {!recording && !processing && !aiResponse && (
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
            </div>
          )}

          {processing && (
            <div className="text-center animate-fade-in">
              <p className="text-text-muted text-sm">Organizando sua lembrança…</p>
            </div>
          )}

          <AudioWaves active={recording} />

          {!processing && (
            <MicButton
              recording={recording}
              onClick={handleMicClick}
              disabled={processing || finalizing}
            />
          )}

          {processing && (
            <div className="w-12 h-12 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
          )}

          {aiResponse && !recording && !processing && (
            <div className="w-full text-center animate-fade-in">
              <div
                className="rounded-2xl p-4"
                style={{ background: '#F0E8D8' }}
              >
                <p className="text-text-dark text-sm leading-relaxed whitespace-pre-line">{aiResponse}</p>
              </div>
            </div>
          )}

          {error && (
            <p className="text-red-400 text-sm text-center animate-fade-in">{error}</p>
          )}

          {!speechSupported && (
            <p className="text-amber-600 text-xs text-center">
              Use o Chrome para gravar voz 😊
            </p>
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
