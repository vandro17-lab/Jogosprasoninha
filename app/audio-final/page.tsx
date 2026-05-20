'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Square, Heart } from 'lucide-react'
import AudioWaves from '@/components/AudioWaves'
import ProgressDots from '@/components/ProgressDots'
import DecoBackground from '@/components/DecoBackground'
import FloralOrnament from '@/components/FloralOrnament'
import SectionTitle from '@/components/SectionTitle'
import { getSession } from '@/lib/session-store'

type RecordState = 'idle' | 'recording' | 'preview' | 'uploading' | 'done'

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
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
  const [liveStream, setLiveStream] = useState<MediaStream | null>(null)

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
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: { ideal: true },
          noiseSuppression: { ideal: true },
          autoGainControl: { ideal: true },
          channelCount: { ideal: 1 },
        },
      })
      streamRef.current = stream
      setLiveStream(stream)
      chunksRef.current = []

      const mimeType =
        MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' :
        MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' :
        MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : ''

      const mr = new MediaRecorder(stream, {
        ...(mimeType ? { mimeType } : {}),
        audioBitsPerSecond: 96000,
      })
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        setState('preview')
        streamRef.current?.getTracks().forEach((t) => t.stop())
        setLiveStream(null)
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
    <main className="min-h-screen flex flex-col px-6 py-12 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at top, #F7EDD8 0%, #FDFCFA 65%)' }}
      />
      <DecoBackground variant="ornate" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-sm w-full mx-auto flex flex-col gap-7"
      >
        <motion.div variants={itemVariants} className="flex flex-col items-center gap-4">
          <ProgressDots total={5} current={4} />
          <SectionTitle
            eyebrow="Recado final"
            title="Deixe um recado para a Sônia"
            subtitle="ela vai ouvir no aniversário 🤍"
          />
          <p className="text-xs text-text-muted text-center max-w-[260px]">
            Pode falar algo simples… um carinho, uma saudade, um desejo bonito 😊
          </p>
        </motion.div>

        {/* Recorder card */}
        <motion.div variants={itemVariants} className="relative">
          <FloralOrnament position="tl" size={46} tone="rose" opacity={0.55} />
          <FloralOrnament position="br" size={46} tone="rose" opacity={0.55} />

          <div className="glass-card-soft-rose p-8 flex flex-col items-center gap-6 relative">
            <div className="relative w-full flex flex-col items-center gap-6" style={{ zIndex: 2 }}>
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
                    <PremiumRecordButton onClick={startRecording} recording={false} />
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
                        className="inline-block w-2 h-2 rounded-full"
                        style={{ background: '#D85A5A', boxShadow: '0 0 8px rgba(216,90,90,0.7)' }}
                      />
                      <p className="text-text-muted text-sm">Gravando…</p>
                    </div>
                    <p className="font-playfair text-4xl text-gradient-gold">{formatTime(elapsed)}</p>
                    <AudioWaves active={true} stream={liveStream} />
                    <PremiumRecordButton onClick={stopRecording} recording={true} />
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
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                        className="flex-1 py-3 rounded-2xl text-text-dark text-sm font-medium focus-ring"
                        style={{
                          background: 'linear-gradient(180deg, rgba(255,253,249,0.85), rgba(240,232,216,0.65))',
                          border: '1px solid rgba(232,213,163,0.65)',
                          boxShadow: '0 1px 0 rgba(255,255,255,0.6) inset, 0 4px 10px -4px rgba(61,50,40,0.08)',
                        }}
                      >
                        Gravar novamente
                      </motion.button>
                      <motion.button
                        onClick={sendAudio}
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                        className="flex-1 py-3 rounded-2xl text-white text-sm font-medium flex items-center justify-center gap-2 shimmer-btn focus-ring"
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
                        boxShadow: '0 0 12px rgba(201,168,76,0.30)',
                      }}
                    />
                  </motion.div>
                )}

                {state === 'done' && (
                  <motion.p
                    key="done"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-gradient-gold font-playfair text-xl"
                  >
                    Áudio enviado 🤍
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {(state === 'idle' || state === 'preview') && (
          <motion.button
            variants={itemVariants}
            onClick={() => router.push('/obrigado')}
            className="text-text-muted text-sm underline decoration-dotted underline-offset-4 text-center hover:text-gold-dark transition-colors focus-ring"
          >
            Pular esta etapa
          </motion.button>
        )}
      </motion.div>
    </main>
  )
}

function PremiumRecordButton({ onClick, recording }: { onClick: () => void; recording: boolean }) {
  const size = 88
  return (
    <div className="relative flex items-center justify-center" style={{ width: size + 24, height: size + 24 }}>
      {/* Ambient halo */}
      <div
        aria-hidden
        className="absolute rounded-full"
        style={{
          width: size + 36,
          height: size + 36,
          background: recording
            ? 'radial-gradient(circle, rgba(200,76,76,0.22) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(201,168,76,0.25) 0%, transparent 70%)',
          filter: 'blur(10px)',
        }}
      />
      {recording && (
        <motion.div
          animate={{ scale: [1, 2.0, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' as const }}
          style={{
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: '50%',
            background: 'rgba(200, 76, 76, 0.22)',
          }}
        />
      )}
      {/* Trim ring */}
      <div
        aria-hidden
        className="absolute rounded-full"
        style={{
          width: size + 7,
          height: size + 7,
          border: recording
            ? '1.5px solid rgba(232, 200, 200, 0.55)'
            : '1.5px solid rgba(232, 213, 163, 0.65)',
          boxShadow: recording
            ? 'inset 0 0 12px rgba(200, 76, 76, 0.10)'
            : 'inset 0 0 12px rgba(201, 168, 76, 0.10)',
        }}
      />
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        aria-label={recording ? 'Parar gravação' : 'Iniciar gravação'}
        className="focus-ring"
        style={{
          position: 'relative',
          width: size,
          height: size,
          borderRadius: '50%',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          background: recording
            ? 'linear-gradient(150deg, #D45C5C 0%, #C84C4C 45%, #9A2828 100%)'
            : 'linear-gradient(150deg, #D9B95C 0%, #C9A84C 45%, #8E6A24 100%)',
          boxShadow: recording
            ? '0 1px 0 rgba(255,255,255,0.35) inset, 0 4px 14px rgba(200, 76, 76, 0.42), 0 14px 36px -6px rgba(200, 76, 76, 0.45)'
            : '0 1px 0 rgba(255,255,255,0.45) inset, 0 4px 14px rgba(201, 168, 76, 0.42), 0 14px 36px -6px rgba(201, 168, 76, 0.48)',
        }}
      >
        <span
          aria-hidden
          style={{
            position: 'absolute',
            inset: 4,
            borderRadius: '50%',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.08) 35%, transparent 55%)',
            pointerEvents: 'none',
          }}
        />
        {recording
          ? <Square size={30} color="white" fill="white" style={{ position: 'relative', zIndex: 2 }} />
          : <Mic size={34} color="white" strokeWidth={1.8} style={{ position: 'relative', zIndex: 2 }} />}
      </motion.button>
    </div>
  )
}
