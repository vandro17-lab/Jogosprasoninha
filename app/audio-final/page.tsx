'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AudioWaves from '@/components/AudioWaves'
import ProgressDots from '@/components/ProgressDots'
import { getSession } from '@/lib/session-store'

type RecordState = 'idle' | 'recording' | 'preview' | 'uploading' | 'done'

export default function AudioFinalPage() {
  const router = useRouter()
  const [state, setState] = useState<RecordState>('idle')
  const [elapsed, setElapsed] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [participantId, setParticipantId] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    const s = getSession()
    if (!s.nome) { router.replace('/identificacao'); return }
    setParticipantId(s.participantId)
  }, [])

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      chunksRef.current = []

      const mr = new MediaRecorder(stream)
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        setState('preview')
        streamRef.current?.getTracks().forEach((t) => t.stop())
      }

      mr.start()
      mediaRecorderRef.current = mr
      setState('recording')
      setElapsed(0)
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000)
    } catch {
      alert('Não foi possível acessar o microfone. Verifique as permissões 😊')
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop()
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }

  function reRecord() {
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioUrl(null)
    setState('idle')
  }

  async function sendAudio() {
    if (!audioUrl) return
    setState('uploading')
    try {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
      const form = new FormData()
      form.append('file', blob, 'audio-final.webm')
      form.append('participantId', participantId ?? 'unknown')
      form.append('tipo', 'final')
      await fetch('/api/upload-audio', { method: 'POST', body: form })
    } catch {
      // Upload failed silently, still proceed
    }
    setState('done')
    setTimeout(() => router.push('/obrigado'), 800)
  }

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  return (
    <main className="min-h-screen flex flex-col px-6 py-10">
      <div className="max-w-sm w-full mx-auto flex flex-col gap-6 animate-fade-in">
        <div className="text-center">
          <ProgressDots total={5} current={4} />
          <h1 className="font-playfair text-xl text-text-dark mt-4">
            Deixe um recado para a Sônia 🎙️
          </h1>
          <p className="text-text-muted text-sm mt-1 leading-relaxed">
            Ela vai ouvir essa mensagem no aniversário 🤍
          </p>
          <p className="text-xs text-text-muted mt-2">
            Pode falar algo simples… um carinho, uma saudade, um desejo bonito 😊
          </p>
        </div>

        {/* Card do gravador */}
        <div
          className="rounded-3xl p-8 flex flex-col items-center gap-6"
          style={{ background: '#FFFDF9', border: '1px solid #E8D5A3' }}
        >
          {state === 'idle' && (
            <>
              <p className="text-text-muted text-sm text-center">
                Toque no botão para gravar uma mensagem de voz
              </p>
              <AudioWaves active={false} />
              <button
                onClick={startRecording}
                className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #C9A84C 0%, #A07830 100%)',
                  boxShadow: '0 4px 20px rgba(201,168,76,0.35)',
                }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
              </button>
            </>
          )}

          {state === 'recording' && (
            <>
              <p className="text-text-muted text-sm">🎙️ Gravando…</p>
              <p className="font-playfair text-3xl text-gold">{formatTime(elapsed)}</p>
              <AudioWaves active={true} />
              <button
                onClick={stopRecording}
                className="w-20 h-20 rounded-full bg-red-400 hover:bg-red-500 flex items-center justify-center shadow-lg transition-all duration-200 active:scale-95"
              >
                <div className="w-7 h-7 rounded bg-white" />
              </button>
              <p className="text-text-muted text-xs">Toque para finalizar</p>
            </>
          )}

          {state === 'preview' && audioUrl && (
            <>
              <p className="text-text-muted text-sm text-center">Ouça com calma antes de enviar 😊</p>
              <audio controls src={audioUrl} className="w-full rounded-xl" />
              <div className="flex gap-3 w-full">
                <button
                  onClick={reRecord}
                  className="flex-1 py-3 rounded-2xl text-text-dark text-sm font-medium transition-all duration-200 active:scale-98"
                  style={{ background: '#F0E8D8', border: '1px solid #E8D5A3' }}
                >
                  Gravar novamente
                </button>
                <button
                  onClick={sendAudio}
                  className="flex-1 py-3 rounded-2xl text-white text-sm font-medium transition-all duration-200 active:scale-98 shadow-md"
                  style={{ background: 'linear-gradient(135deg, #C9A84C 0%, #A07830 100%)' }}
                >
                  Enviar 🤍
                </button>
              </div>
            </>
          )}

          {state === 'uploading' && (
            <>
              <p className="text-text-muted text-sm">Enviando seu áudio…</p>
              <div className="w-12 h-12 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
            </>
          )}

          {state === 'done' && (
            <p className="text-gold font-playfair text-lg animate-fade-in">Áudio enviado 🤍</p>
          )}
        </div>

        {/* Pular */}
        {(state === 'idle' || state === 'preview') && (
          <button
            onClick={() => router.push('/obrigado')}
            className="text-text-muted text-sm underline text-center"
          >
            Pular esta etapa
          </button>
        )}
      </div>
    </main>
  )
}
