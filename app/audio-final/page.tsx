'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Square, Heart } from 'lucide-react'
import AudioWaves from '@/components/AudioWaves'
import ProgressDots from '@/components/ProgressDots'
import DecoBackground from '@/components/DecoBackground'
import { getSession } from '@/lib/session-store'

type RecordState = 'idle' | 'recording' | 'preview' | 'uploading' | 'done'

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: 'easeOut' as const } },
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.10 } },
}

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

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  return (
    <main className="min-h-screen flex flex-col px-6 py-10 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at top, #F7EDD8 0%, #FDFCFA 65%)' }}
      />
      <DecoBackground variant="default" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-sm w-full mx-auto flex flex-col gap-6"
      >
        <motion.div variants={itemVariants} className="text-center">
          <ProgressDots total={5} current={4} />
          <h1 className="font-playfair text-xl text-text-dark mt-4">
            Deixe um recado para a Sônia
          </h1>
          <p className="text-text-muted text-sm mt-1 leading-relaxed">
            Ela vai ouvir essa mensagem no aniversário 🤍
          </p>
          <p className="text-xs text-text-muted mt-2">
            Pode falar algo simples… um carinho, uma saudade, um desejo bonito 😊
          </p>
        </motion.div>

        {/* Recorder card */}
        <motion.div variants={itemVariants} className="glass-card p-8 flex flex-col items-center gap-6">
          <AnimatePresence mode="wait">
            {state === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex flex-col items-center gap-6 w-full"
              >
                <p className="text-text-muted text-sm text-center">
                  Toque no botão para gravar uma mensagem de voz
                </p>
                <AudioWaves active={false} />
                <motion.button
                  onClick={startRecording}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.92 }}
                  style={{
                    width: 88,
                    height: 88,
                    borderRadius: '50%',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #C9A84C 0%, #A07830 100%)',
                    boxShadow: '0 6px 24px rgba(201,168,76,0.45)',
                    cursor: 'pointer',
                  }}
                >
                  <Mic size={34} color="white" />
                </motion.button>
              </motion.div>
            )}

            {state === 'recording' && (
              <motion.div
                key="recording"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex flex-col items-center gap-6 w-full"
              >
                <div className="flex items-center gap-2">
                  <motion.span
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    className="inline-block w-2 h-2 rounded-full bg-red-400"
                  />
                  <p className="text-text-muted text-sm">Gravando…</p>
                </div>
                <p className="font-playfair text-3xl text-gold">{formatTime(elapsed)}</p>
                <AudioWaves active={true} />
                <div className="relative">
                  {/* Expanding ring */}
                  <motion.div
                    animate={{ scale: [1, 2.0, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' as const }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '50%',
                      background: 'rgba(200, 76, 76, 0.25)',
                    }}
                  />
                  <motion.button
                    onClick={stopRecording}
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.92 }}
                    style={{
                      position: 'relative',
                      width: 88,
                      height: 88,
                      borderRadius: '50%',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, #C84C4C 0%, #A03030 100%)',
                      boxShadow: '0 6px 24px rgba(200, 76, 76, 0.45)',
                      cursor: 'pointer',
                    }}
                  >
                    <Square size={30} color="white" fill="white" />
                  </motion.button>
                </div>
                <p className="text-text-muted text-xs">Toque para finalizar</p>
              </motion.div>
            )}

            {state === 'preview' && audioUrl && (
              <motion.div
                key="preview"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex flex-col items-center gap-4 w-full"
              >
                <p className="text-text-muted text-sm text-center">Ouça com calma antes de enviar 😊</p>
                <audio controls src={audioUrl} className="w-full rounded-xl" />
                <div className="flex gap-3 w-full">
                  <motion.button
                    onClick={reRecord}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex-1 py-3 rounded-2xl text-text-dark text-sm font-medium"
                    style={{ background: 'rgba(240,232,216,0.7)', border: '1px solid rgba(232,213,163,0.8)' }}
                  >
                    Gravar novamente
                  </motion.button>
                  <motion.button
                    onClick={sendAudio}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex-1 py-3 rounded-2xl text-white text-sm font-medium flex items-center justify-center gap-2 shimmer-btn"
                  >
                    Enviar <Heart size={14} fill="white" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {state === 'uploading' && (
              <motion.div
                key="uploading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-4"
              >
                <p className="text-text-muted text-sm">Enviando seu áudio…</p>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    border: '2px solid rgba(201,168,76,0.25)',
                    borderTopColor: '#C9A84C',
                  }}
                />
              </motion.div>
            )}

            {state === 'done' && (
              <motion.p
                key="done"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-gold font-playfair text-lg"
              >
                Áudio enviado 🤍
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {(state === 'idle' || state === 'preview') && (
          <motion.button
            variants={itemVariants}
            onClick={() => router.push('/obrigado')}
            className="text-text-muted text-sm underline text-center"
          >
            Pular esta etapa
          </motion.button>
        )}
      </motion.div>
    </main>
  )
}
