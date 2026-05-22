'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Play, Pause, Music2, Camera, MessageSquare, Loader2, Gift } from 'lucide-react'
import DecoBackground from '@/components/DecoBackground'
import FloralOrnament from '@/components/FloralOrnament'

interface Tribute {
  id: string
  nome: string
  parentesco: string
  mensagem: string | null
  fotos: string[]
  audio: string | null
}

/* ─── Audio player ─── */
function AudioPlayer({ src, nome }: { src: string; nome: string }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)

  function toggle() {
    const el = audioRef.current
    if (!el) return
    if (playing) { el.pause() } else { el.play() }
    setPlaying(!playing)
  }

  function fmt(s: number) {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div
      className="flex items-center gap-3 rounded-2xl px-4 py-3"
      style={{
        background: 'linear-gradient(135deg, rgba(201,168,76,0.12) 0%, rgba(232,213,163,0.22) 100%)',
        border: '1px solid rgba(201,168,76,0.3)',
      }}
    >
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={(e) => {
          const el = e.currentTarget
          setProgress(el.duration ? (el.currentTime / el.duration) * 100 : 0)
        }}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => { setPlaying(false); setProgress(0) }}
      />
      <button
        onClick={toggle}
        className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 transition-transform active:scale-90"
        style={{ background: 'linear-gradient(135deg, #D9B95C 0%, #C9A84C 100%)', boxShadow: '0 4px 12px rgba(201,168,76,0.4)' }}
      >
        {playing ? <Pause size={16} fill="white" /> : <Play size={16} fill="white" style={{ marginLeft: 2 }} />}
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gold-dark truncate">{nome}</p>
        <div className="mt-1.5 h-1.5 rounded-full bg-gold/20 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-200"
            style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #D9B95C, #C9A84C)' }}
          />
        </div>
      </div>
      {duration > 0 && (
        <span className="text-xs text-text-muted shrink-0">{fmt(duration)}</span>
      )}
    </div>
  )
}

/* ─── Tribute card ─── */
function TributeCard({ tribute, index }: { tribute: Tribute; index: number }) {
  const [lightbox, setLightbox] = useState<string | null>(null)

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full"
      >
        <FloralOrnament position="tl" size={36} tone="gold" opacity={0.4} />
        <FloralOrnament position="br" size={36} tone="gold" opacity={0.4} />
        <div
          className="relative p-6 rounded-3xl flex flex-col gap-4"
          style={{
            background: 'linear-gradient(135deg, rgba(253,252,250,0.96) 0%, rgba(247,237,216,0.6) 100%)',
            border: '1px solid rgba(201,168,76,0.25)',
            boxShadow: '0 2px 0 rgba(255,255,255,0.8) inset, 0 8px 32px -8px rgba(61,50,40,0.10)',
          }}
        >
          {/* Author */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-base shrink-0"
              style={{ background: 'linear-gradient(135deg, #D9B95C 0%, #A07830 100%)', boxShadow: '0 4px 10px rgba(201,168,76,0.35)' }}
            >
              {tribute.nome[0].toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-text-dark text-sm">{tribute.nome}</p>
              <p className="text-text-muted text-xs capitalize">{tribute.parentesco} da Sônia</p>
            </div>
            <Heart size={14} color="#C9A84C" fill="#C9A84C" className="ml-auto shrink-0" />
          </div>

          {/* Message */}
          {tribute.mensagem && (
            <div className="rounded-2xl px-4 py-3" style={{ background: 'rgba(255,253,249,0.8)', border: '1px solid rgba(232,213,163,0.35)' }}>
              <div className="flex items-center gap-1.5 mb-2">
                <MessageSquare size={11} color="#C9A84C" />
                <span className="text-xs text-text-muted font-medium uppercase tracking-wide">Mensagem</span>
              </div>
              <p
                className="text-text-dark text-sm leading-relaxed whitespace-pre-wrap"
                style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontStyle: 'italic' }}
              >
                &ldquo;{tribute.mensagem}&rdquo;
              </p>
            </div>
          )}

          {/* Photos */}
          {tribute.fotos.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2.5">
                <Camera size={11} color="#C9A84C" />
                <span className="text-xs text-text-muted font-medium uppercase tracking-wide">
                  {tribute.fotos.length === 1 ? 'Foto' : `${tribute.fotos.length} fotos`}
                </span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {tribute.fotos.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setLightbox(url)}
                    className="relative overflow-hidden rounded-2xl transition-transform hover:scale-[1.02] active:scale-95"
                    style={{
                      width: tribute.fotos.length === 1 ? '100%' : 88,
                      height: tribute.fotos.length === 1 ? 220 : 88,
                      boxShadow: '0 4px 14px rgba(61,50,40,0.15)',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Foto de ${tribute.nome}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Audio */}
          {tribute.audio && (
            <div>
              <div className="flex items-center gap-1.5 mb-2.5">
                <Music2 size={11} color="#C9A84C" />
                <span className="text-xs text-text-muted font-medium uppercase tracking-wide">Recado de voz</span>
              </div>
              <AudioPlayer src={tribute.audio} nome={tribute.nome} />
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightbox}
              alt="Foto ampliada"
              className="max-w-full max-h-[90vh] rounded-2xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/* ─── Gift button ─── */
function GiftButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center gap-4"
    >
      <p
        className="text-white/80 text-sm text-center leading-relaxed px-6"
        style={{ textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}
      >
        Tem algo muito especial esperando por você
      </p>

      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: 'spring', stiffness: 340, damping: 20 }}
        className="relative flex flex-col items-center gap-3 group"
      >
        {/* Glow ring */}
        <motion.div
          animate={{ scale: [1, 1.18, 1], opacity: [0.55, 0.15, 0.55] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.55), transparent 70%)', filter: 'blur(12px)' }}
        />

        {/* Gift box */}
        <div
          className="relative w-24 h-24 rounded-3xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(145deg, rgba(255,253,249,0.18) 0%, rgba(201,168,76,0.22) 100%)',
            border: '1.5px solid rgba(201,168,76,0.55)',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.08) inset, 0 8px 32px rgba(201,168,76,0.35)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <Gift size={44} color="#F0D88A" strokeWidth={1.4} />
        </div>

        <span
          className="text-base font-semibold tracking-wide"
          style={{
            color: '#F0D88A',
            textShadow: '0 1px 12px rgba(201,168,76,0.6)',
            fontFamily: 'var(--font-playfair), Georgia, serif',
          }}
        >
          Abrir minha homenagem
        </span>
      </motion.button>
    </motion.div>
  )
}

/* ─── Intro screen (video or photo) ─── */
function IntroScreen({ onReveal }: { onReveal: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoEnded, setVideoEnded] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const [showButton, setShowButton] = useState(false)

  // Show button after video ends, or after 1.5s if no video
  useEffect(() => {
    if (videoError) {
      const t = setTimeout(() => setShowButton(true), 1500)
      return () => clearTimeout(t)
    }
  }, [videoError])

  function handleVideoEnded() {
    setVideoEnded(true)
    setShowButton(true)
  }

  // Also show button after 12s max even if video is still playing
  useEffect(() => {
    const t = setTimeout(() => setShowButton(true), 12000)
    return () => clearTimeout(t)
  }, [])

  return (
    <motion.div
      key="intro"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-20 flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Video background */}
      {!videoError && (
        <video
          ref={videoRef}
          src="/video.mp4"
          autoPlay
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          onEnded={handleVideoEnded}
          onError={() => setVideoError(true)}
        />
      )}

      {/* Photo fallback (shown when no video) */}
      {videoError && (
        <div className="absolute inset-0">
          <Image
            src="/sonia.jpg"
            alt="Sônia"
            fill
            className="object-cover object-top"
            priority
          />
        </div>
      )}

      {/* Cinematic overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to top, rgba(20,10,2,0.92) 0%, rgba(20,10,2,0.45) 40%, rgba(20,10,2,0.30) 60%, rgba(20,10,2,0.55) 100%)',
        }}
      />

      {/* Top text */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.4 }}
        className="absolute top-0 left-0 right-0 flex flex-col items-center pt-16 px-6"
      >
        <p
          className="text-white/70 text-xs uppercase tracking-[0.22em] mb-2"
          style={{ textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}
        >
          59 anos · com muito amor
        </p>
        <h1
          className="text-4xl font-bold text-white text-center leading-tight"
          style={{
            fontFamily: 'var(--font-playfair), Georgia, serif',
            textShadow: '0 2px 24px rgba(0,0,0,0.5)',
          }}
        >
          Feliz Aniversário,
          <br />
          <span style={{ color: '#F0D88A' }}>Sônia</span> 🤍
        </h1>
      </motion.div>

      {/* Bottom — gift button */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-16 px-6">
        <AnimatePresence>
          {showButton && <GiftButton onClick={onReveal} />}
        </AnimatePresence>

        {!showButton && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <Loader2 size={16} color="rgba(255,255,255,0.4)" className="animate-spin" />
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

/* ─── Main page ─── */
export default function SuaHomenagem() {
  const [revealed, setRevealed] = useState(false)
  const [tributes, setTributes] = useState<Tribute[]>([])
  const [loading, setLoading] = useState(true)
  const [imgError, setImgError] = useState(false)
  const tributesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/homenagem')
      .then((r) => r.json())
      .then((d) => setTributes(d.participants ?? []))
      .catch(() => setTributes([]))
      .finally(() => setLoading(false))
  }, [])

  function handleReveal() {
    setRevealed(true)
    setTimeout(() => {
      tributesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 600)
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Intro screen */}
      <AnimatePresence>
        {!revealed && <IntroScreen onReveal={handleReveal} />}
      </AnimatePresence>

      {/* Tributes section */}
      <AnimatePresence>
        {revealed && (
          <motion.main
            ref={tributesRef}
            key="tributes"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
            className="min-h-screen flex flex-col items-center px-5 pb-16 relative overflow-hidden"
          >
            {/* Background */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 30% 10%, #FDFCFA 0%, #FBF0F0 45%, #F7EDD8 100%)' }}
            />
            <DecoBackground variant="ornate" />

            <div className="relative z-10 max-w-sm w-full flex flex-col items-center gap-8 pt-14">

              {/* Hero */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="flex flex-col items-center gap-5 w-full"
              >
                <div
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
                  style={{
                    background: 'linear-gradient(135deg, rgba(201,168,76,0.14) 0%, rgba(232,213,163,0.30) 100%)',
                    border: '1px solid rgba(201,168,76,0.35)',
                    color: '#A07830',
                  }}
                >
                  <Heart size={14} color="#C9A84C" fill="#C9A84C" />
                  <span style={{ fontSize: '0.7rem', letterSpacing: '0.18em' }}>FELIZ ANIVERSÁRIO, SÔNIA</span>
                  <Heart size={14} color="#C9A84C" fill="#C9A84C" />
                </div>

                <div className="relative">
                  <div
                    className="absolute -inset-4 rounded-full opacity-30 animate-glow-pulse"
                    style={{ background: 'radial-gradient(circle, rgba(232,213,163,0.6), transparent 70%)' }}
                  />
                  <div
                    className="relative w-36 h-36 rounded-full overflow-hidden"
                    style={{
                      boxShadow: '0 1px 0 rgba(255,255,255,0.8) inset, 0 10px 40px rgba(201,168,76,0.35), 0 20px 60px -10px rgba(61,50,40,0.25)',
                      border: '4px solid #FFFDF9',
                      background: '#F0E8D8',
                    }}
                  >
                    {!imgError ? (
                      <Image
                        src="/sonia.jpg"
                        alt="Sônia"
                        width={144}
                        height={144}
                        className="w-full h-full object-cover object-top"
                        priority
                        onError={() => setImgError(true)}
                      />
                    ) : (
                      <span className="font-playfair text-5xl text-gold flex items-center justify-center h-full">S</span>
                    )}
                  </div>
                </div>

                <div className="text-center flex flex-col gap-2">
                  <h1
                    className="text-3xl font-bold text-text-dark leading-tight"
                    style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
                  >
                    Sua Homenagem 🤍
                  </h1>
                  <p className="text-text-muted text-sm leading-relaxed px-4">
                    As pessoas que você ama prepararam algo especial para você.
                  </p>
                </div>
              </motion.div>

              {/* Divider */}
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.35 }}
                className="w-full flex items-center gap-3"
              >
                <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.5))' }} />
                <Heart size={14} color="#C9A84C" fill="#C9A84C" />
                <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(201,168,76,0.5), transparent)' }} />
              </motion.div>

              {/* Tributes */}
              {loading ? (
                <div className="flex flex-col items-center gap-3 py-12">
                  <Loader2 size={28} color="#C9A84C" className="animate-spin" />
                  <p className="text-text-muted text-sm">Carregando suas homenagens…</p>
                </div>
              ) : tributes.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 flex flex-col items-center gap-3"
                >
                  <Heart size={36} color="#C9A84C" fill="rgba(201,168,76,0.2)" />
                  <p className="text-text-dark font-medium">As homenagens estão a caminho…</p>
                  <p className="text-text-muted text-sm">Em breve aparecerão aqui com todo o carinho 🌸</p>
                </motion.div>
              ) : (
                <div className="w-full flex flex-col gap-5">
                  {tributes.map((t, i) => (
                    <TributeCard key={t.id} tribute={t} index={i} />
                  ))}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: tributes.length * 0.1 + 0.4 }}
                    className="flex flex-col items-center gap-2 pt-6 pb-4"
                  >
                    <Heart size={20} color="#C9A84C" fill="#C9A84C" />
                    <p className="text-text-muted text-xs text-center leading-relaxed">
                      Feito com muito amor para você, Sônia 🌸
                    </p>
                  </motion.div>
                </div>
              )}
            </div>
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  )
}
