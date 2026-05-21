'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'
import { Play, Volume2, VolumeX } from 'lucide-react'
import DecoBackground from '@/components/DecoBackground'
import GiftReveal from './GiftReveal'

const VIDEO_SRC = '/homenagem/abertura.mp4'
const POSTER_SRC = '/sonia.jpg'
const GIFT_REVEAL_AT = 22 // segundos de vídeo antes de revelar o presente
const FALLBACK_REVEAL_MS = 7000 // caso o vídeo ainda não exista

const easeLuxe = [0.22, 1, 0.36, 1] as const

const textContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.18, delayChildren: 0.2 } },
}
const textItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: easeLuxe } },
}

export default function IntroScene({ onOpen }: { onOpen: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const giftRef = useRef<HTMLDivElement>(null)

  const [started, setStarted] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [showGift, setShowGift] = useState(false)
  const [videoFailed, setVideoFailed] = useState(false)

  // micro-parallax (tilt) on pointer
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const srx = useSpring(rx, { stiffness: 110, damping: 16 })
  const sry = useSpring(ry, { stiffness: 110, damping: 16 })

  const revealGift = useCallback(() => {
    setShowGift((prev) => {
      if (prev) return prev
      setTimeout(() => giftRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 140)
      return true
    })
  }, [])

  // fallback reveal when there is no playable video
  useEffect(() => {
    if (!videoFailed || showGift) return
    const t = setTimeout(revealGift, FALLBACK_REVEAL_MS)
    return () => clearTimeout(t)
  }, [videoFailed, showGift, revealGift])

  function handlePointerMove(e: React.PointerEvent) {
    const el = frameRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    ry.set(px * 7)
    rx.set(-py * 7)
  }
  function handlePointerLeave() {
    rx.set(0)
    ry.set(0)
  }

  async function handleStart() {
    const v = videoRef.current
    setStarted(true)
    if (!v) return
    try {
      await v.play()
      setPlaying(true)
    } catch {
      setPlaying(false)
    }
  }

  function togglePlay() {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      v.play().then(() => setPlaying(true)).catch(() => {})
    } else {
      v.pause()
      setPlaying(false)
    }
  }

  function toggleMute(e: React.MouseEvent) {
    e.stopPropagation()
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
  }

  function handleFrameClick() {
    if (videoFailed) return
    if (!started) handleStart()
    else togglePlay()
  }

  function handleTimeUpdate() {
    const v = videoRef.current
    if (!v) return
    if (v.currentTime >= GIFT_REVEAL_AT) revealGift()
  }

  return (
    <section
      className="relative min-h-[100dvh] w-full overflow-x-hidden overflow-y-auto flex flex-col items-center justify-center px-6 py-12"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, #FDFCFA 0%, #FBF0F0 48%, #F7EDD8 100%)' }}
      />
      <DecoBackground variant="ornate" />

      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center gap-8">
        {/* Emotional opening text */}
        <motion.div
          variants={textContainer}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center text-center gap-3"
        >
          <motion.span variants={textItem} className="tracking-luxe text-gold-dark flex items-center gap-2">
            <span aria-hidden className="inline-block w-6 h-px" style={{ background: 'linear-gradient(90deg, transparent, #C9A84C)' }} />
            Uma mensagem para você
            <span aria-hidden className="inline-block w-6 h-px" style={{ background: 'linear-gradient(90deg, #C9A84C, transparent)' }} />
          </motion.span>

          <motion.h1 variants={textItem} className="heading-display text-[1.7rem] sm:text-3xl text-text-dark leading-snug">
            <span className="text-gradient-gold">Sônia</span>, você é muito
            <br className="hidden sm:block" /> importante para nós.
          </motion.h1>

          <motion.p variants={textItem} className="text-text-dark/90 text-[15px] leading-relaxed max-w-sm">
            Evandro, Rodrigo, Rafael, Raquel e Dudu te amam muito.
          </motion.p>
          <motion.p variants={textItem} className="text-text-muted text-sm leading-relaxed max-w-sm">
            Mas existem muitas pessoas preparando uma grande surpresa para você.
          </motion.p>
        </motion.div>

        {/* Cinematic video frame */}
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.1, ease: easeLuxe, delay: 0.5 }}
          className="w-full"
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            className="w-full"
          >
            <motion.div
              ref={frameRef}
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerLeave}
              style={{ rotateX: srx, rotateY: sry, transformPerspective: 1100 }}
              className="relative w-full rounded-[28px] p-[1.5px]"
            >
              <div
                className="absolute inset-0 rounded-[28px] pointer-events-none"
                style={{ background: 'var(--gradient-gold-border)', boxShadow: 'var(--shadow-floating)' }}
              />
              <div
                onClick={handleFrameClick}
                className="relative rounded-[27px] overflow-hidden cursor-pointer flex items-center justify-center min-h-[300px]"
                style={{ background: '#16110c' }}
              >
                {!videoFailed ? (
                  <video
                    ref={videoRef}
                    poster={POSTER_SRC}
                    preload="metadata"
                    playsInline
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={() => { setPlaying(false); revealGift() }}
                    onError={() => setVideoFailed(true)}
                    className="w-full h-auto max-h-[56vh] object-contain block"
                  >
                    <source src={VIDEO_SRC} type="video/mp4" />
                  </video>
                ) : (
                  <motion.img
                    src={POSTER_SRC}
                    alt="Sônia"
                    className="w-full h-[44vh] object-cover block"
                    initial={{ scale: 1.06 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 12, ease: 'easeOut' }}
                  />
                )}

                {/* film grain + vignette */}
                <div className="absolute inset-0 cinema-grain" />
                <div className="absolute inset-0 dark-frame-vignette" />

                {/* start gate */}
                <AnimatePresence>
                  {!started && !videoFailed && (
                    <motion.div
                      key="gate"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6 }}
                      className="absolute inset-0 flex flex-col items-center justify-center gap-4"
                      style={{ background: 'rgba(15,11,7,0.42)', backdropFilter: 'blur(2px)' }}
                    >
                      <motion.span
                        className="relative flex items-center justify-center rounded-full"
                        style={{
                          width: 78,
                          height: 78,
                          background: 'linear-gradient(135deg, #F0DBA0, #C9A84C 55%, #9C7228)',
                          boxShadow: '0 1px 0 rgba(255,255,255,0.4) inset, 0 8px 28px rgba(201,168,76,0.5)',
                        }}
                        animate={{ scale: [1, 1.06, 1] }}
                        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <Play size={30} color="#fff" fill="#fff" style={{ marginLeft: 4 }} />
                      </motion.span>
                      <span className="text-white/90 text-sm tracking-wide font-medium">Toque para começar</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* resume overlay (paused mid-video) */}
                <AnimatePresence>
                  {started && !playing && !videoFailed && (
                    <motion.div
                      key="resume"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ background: 'rgba(15,11,7,0.25)' }}
                    >
                      <span
                        className="flex items-center justify-center rounded-full"
                        style={{ width: 64, height: 64, background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.35)' }}
                      >
                        <Play size={26} color="#fff" fill="#fff" style={{ marginLeft: 3 }} />
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* mute toggle */}
                {started && !videoFailed && (
                  <button
                    onClick={toggleMute}
                    aria-label={muted ? 'Ativar som' : 'Desativar som'}
                    className="absolute bottom-3 right-3 z-10 flex items-center justify-center rounded-full"
                    style={{ width: 38, height: 38, background: 'rgba(15,11,7,0.5)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.18)' }}
                  >
                    {muted ? <VolumeX size={17} color="#fff" /> : <Volume2 size={17} color="#fff" />}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Gift reveal */}
        <div ref={giftRef} className="min-h-[12px] w-full flex justify-center">
          <AnimatePresence>
            {showGift && <GiftReveal key="gift" onOpen={onOpen} />}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
