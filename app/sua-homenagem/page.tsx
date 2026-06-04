'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Play, Pause, Music2, Camera, MessageSquare, Loader2, Gift, Video, X, ChevronLeft, ChevronRight, Maximize2, Share2 } from 'lucide-react'
import DecoBackground from '@/components/DecoBackground'
import FloralOrnament from '@/components/FloralOrnament'

const THANK_YOU_MSG = 'Oi! Estou passando rapidinho para agradecer pela mensagem que você deixou para mim. Gostei muito do seu carinho e da sua lembrança. Que Deus abençoe você e sua família. ❤️'

interface Tribute {
  id: string
  nome: string
  parentesco: string
  telefone: string | null
  is_first: boolean
  is_last: boolean
  mensagem: string | null
  fotos: string[]
  audio: string | null
  videos: string[]
}

interface GalleryPhoto {
  url: string
  nome: string
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="#25D366" style={{ flexShrink: 0 }}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  )
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
      {duration > 0 && isFinite(duration) && (
        <span className="text-xs text-text-muted shrink-0">{fmt(duration)}</span>
      )}
    </div>
  )
}

/* ─── Photo carousel ─── */
function PhotoCarousel({ fotos, nome, onOpen }: { fotos: string[]; nome: string; onOpen: (idx: number) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  function onScroll() {
    const el = scrollRef.current
    if (!el) return
    const index = Math.round(el.scrollLeft / el.offsetWidth)
    setActiveIndex(index)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <Camera size={11} color="#C9A84C" />
          <span className="text-xs text-text-muted font-medium uppercase tracking-wide">
            {fotos.length === 1 ? 'Foto' : `${fotos.length} fotos`}
          </span>
        </div>
        {fotos.length > 1 && (
          <div className="flex items-center gap-1">
            {fotos.map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === activeIndex ? 16 : 6,
                  height: 6,
                  background: i === activeIndex ? '#C9A84C' : 'rgba(201,168,76,0.3)',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Scroll container */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="flex overflow-x-auto snap-x snap-mandatory gap-2 pb-1"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {fotos.map((url, i) => (
          <button
            key={i}
            onClick={() => onOpen(i)}
            className="relative shrink-0 snap-center overflow-hidden rounded-2xl active:scale-95 transition-transform group"
            style={{
              width: fotos.length === 1 ? '100%' : 'calc(85%)',
              height: 220,
              boxShadow: '0 4px 16px rgba(61,50,40,0.15)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`Foto ${i + 1} de ${nome}`} className="w-full h-full object-cover" />
            {/* Ampliar hint overlay */}
            <div
              className="absolute inset-0 flex items-end justify-end p-2.5 opacity-0 group-active:opacity-100 transition-opacity"
              style={{ background: 'linear-gradient(to top-left, rgba(0,0,0,0.35) 0%, transparent 55%)' }}
            >
              <div
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-white"
                style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', fontSize: 11 }}
              >
                <Maximize2 size={10} />
                <span>Ampliar</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Hint */}
      <p className="text-center text-xs mt-2.5" style={{ color: 'rgba(139,115,85,0.7)' }}>
        {fotos.length > 1
          ? '👆 Passe o dedo para ver mais · Toque para ampliar'
          : '👆 Toque na foto para ampliar'}
      </p>
    </div>
  )
}

/* ─── Lightbox ─── */
function Lightbox({ fotos, startIdx, onClose }: { fotos: string[]; startIdx: number; onClose: () => void }) {
  const [idx, setIdx] = useState(startIdx)
  const touchStartX = useRef(0)

  const prev = () => setIdx((i) => Math.max(0, i - 1))
  const next = () => setIdx((i) => Math.min(fotos.length - 1, i + 1))

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }
  function handleTouchEnd(e: React.TouchEvent) {
    const delta = touchStartX.current - e.changedTouches[0].clientX
    if (delta > 55) next()
    else if (delta < -55) prev()
  }

  async function handleSharePhoto() {
    const url = fotos[idx]
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const file = new File([blob], 'foto-sonia.jpg', { type: blob.type || 'image/jpeg' })
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Homenagem da Sônia 🎂' })
        return
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return
    }
    try {
      if (navigator.share) {
        await navigator.share({ url: window.location.href, title: 'Homenagem da Sônia 🎂' })
        return
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return
    }
    const a = document.createElement('a')
    a.href = url
    a.download = 'foto-sonia.jpg'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: 'rgba(8,4,2,0.97)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 shrink-0">
        <div className="flex items-center gap-3">
          {fotos.length > 1 && (
            <span className="text-white/55 text-sm font-medium">{idx + 1} de {fotos.length}</span>
          )}
          <button
            onClick={handleSharePhoto}
            className="flex items-center gap-1.5 rounded-full font-medium text-sm active:scale-95 transition-transform"
            style={{
              background: 'rgba(201,168,76,0.18)',
              border: '1px solid rgba(201,168,76,0.4)',
              color: '#F0D88A',
              padding: '8px 14px',
            }}
          >
            <Share2 size={14} />
            <span>Compartilhar</span>
          </button>
        </div>
        <button
          onClick={onClose}
          className="flex items-center gap-2 rounded-full font-semibold text-sm active:scale-95 transition-transform"
          style={{
            background: 'rgba(255,255,255,0.14)',
            border: '1.5px solid rgba(255,255,255,0.28)',
            color: '#fff',
            padding: '10px 18px',
          }}
        >
          <X size={16} strokeWidth={2.5} />
          <span>Fechar</span>
        </button>
      </div>

      {/* Image */}
      <div
        className="flex-1 flex items-center justify-center px-4 overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={onClose}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.img
            key={idx}
            src={fotos[idx]}
            alt={`Foto ${idx + 1}`}
            initial={{ opacity: 0, scale: 0.93 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.93 }}
            transition={{ duration: 0.18 }}
            className="rounded-2xl object-contain"
            style={{ maxWidth: '100%', maxHeight: '100%' }}
            onClick={(e) => e.stopPropagation()}
          />
        </AnimatePresence>
      </div>

      {/* Navigation */}
      {fotos.length > 1 && (
        <div className="flex items-center justify-center gap-3 px-4 py-5 shrink-0">
          <button
            onClick={prev}
            disabled={idx === 0}
            className="flex items-center gap-1.5 rounded-2xl font-medium text-sm active:scale-95 transition-all disabled:opacity-25"
            style={{
              background: 'rgba(255,255,255,0.10)',
              border: '1px solid rgba(255,255,255,0.18)',
              color: '#fff',
              padding: '12px 20px',
            }}
          >
            <ChevronLeft size={18} />
            Anterior
          </button>

          <div className="flex items-center gap-1.5">
            {fotos.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                style={{
                  width: i === idx ? 18 : 7,
                  height: 7,
                  borderRadius: 4,
                  background: i === idx ? '#C9A84C' : 'rgba(255,255,255,0.28)',
                  transition: 'all 0.2s ease',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>

          <button
            onClick={next}
            disabled={idx === fotos.length - 1}
            className="flex items-center gap-1.5 rounded-2xl font-medium text-sm active:scale-95 transition-all disabled:opacity-25"
            style={{
              background: 'rgba(255,255,255,0.10)',
              border: '1px solid rgba(255,255,255,0.18)',
              color: '#fff',
              padding: '12px 20px',
            }}
          >
            Próxima
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Single photo close hint */}
      {fotos.length === 1 && (
        <p className="text-center text-white/35 text-xs pb-8">Toque fora da foto ou no botão Fechar para sair</p>
      )}
    </motion.div>
  )
}

/* ─── Video player ─── */
function VideoPlayer({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hasStarted, setHasStarted] = useState(false)

  function handlePlayClick() {
    const v = videoRef.current
    if (!v) return
    setHasStarted(true)
    v.play().catch(() => setHasStarted(false))
  }

  async function handleShareVideo() {
    try {
      if (navigator.share) {
        await navigator.share({ url: window.location.href, title: 'Homenagem da Sônia 🎂' })
        return
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return
    }
    const a = document.createElement('a')
    a.href = src
    a.download = 'video-sonia.mp4'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div
        className="relative w-full overflow-hidden"
        style={{
          borderRadius: 20,
          border: '1px solid rgba(201,168,76,0.28)',
          boxShadow: '0 2px 0 rgba(255,255,255,0.7) inset, 0 8px 28px rgba(61,50,40,0.16)',
          background: '#0d0806',
        }}
      >
        <video
          ref={videoRef}
          controls
          playsInline
          src={src}
          style={{ width: '100%', display: 'block' }}
          onPlay={() => setHasStarted(true)}
        />

        {/* Play overlay — desaparece após o primeiro toque */}
        <AnimatePresence>
          {!hasStarted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex flex-col items-center justify-center"
              style={{ background: 'rgba(8,4,2,0.55)', cursor: 'pointer' }}
              onClick={handlePlayClick}
            >
              <motion.div
                whileTap={{ scale: 0.88 }}
                transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                className="flex flex-col items-center gap-3"
              >
                {/* Glow */}
                <div className="relative">
                  <div
                    className="absolute -inset-4 rounded-full animate-pulse opacity-50"
                    style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.45), transparent 70%)' }}
                  />
                  <div
                    className="relative w-20 h-20 rounded-full flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #D9B95C 0%, #C9A84C 100%)',
                      boxShadow: '0 8px 36px rgba(201,168,76,0.60)',
                    }}
                  >
                    <Play size={34} fill="white" color="white" style={{ marginLeft: 4 }} />
                  </div>
                </div>
                <span
                  className="font-semibold text-white text-base rounded-full px-5 py-2"
                  style={{
                    background: 'rgba(255,255,255,0.12)',
                    border: '1px solid rgba(255,255,255,0.22)',
                    textShadow: '0 1px 6px rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(6px)',
                  }}
                >
                  Toque para assistir
                </span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dica de controles */}
      {hasStarted && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-xs"
          style={{ color: 'rgba(139,115,85,0.65)' }}
        >
          Use os controles abaixo do vídeo para pausar ou colocar em tela cheia
        </motion.p>
      )}

      {/* Compartilhar */}
      <div className="flex justify-center">
        <button
          onClick={handleShareVideo}
          className="flex items-center gap-1.5 rounded-full text-xs active:scale-95 transition-transform"
          style={{
            background: 'rgba(201,168,76,0.12)',
            border: '1px solid rgba(201,168,76,0.32)',
            color: '#C9A84C',
            padding: '7px 14px',
          }}
        >
          <Share2 size={13} />
          <span>Compartilhar</span>
        </button>
      </div>
    </div>
  )
}

/* ─── Tribute card ─── */
function TributeCard({ tribute, index }: { tribute: Tribute; index: number }) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)

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
                className="text-text-dark whitespace-pre-wrap"
                style={{
                  fontFamily: 'var(--font-playfair), Georgia, serif',
                  fontStyle: 'italic',
                  fontSize: 'clamp(22px, 2.8vw, 24px)',
                  lineHeight: 1.6,
                }}
              >
                &ldquo;{tribute.mensagem}&rdquo;
              </p>
            </div>
          )}

          {/* Photos carousel */}
          {tribute.fotos.length > 0 && (
            <PhotoCarousel fotos={tribute.fotos} nome={tribute.nome} onOpen={setLightboxIdx} />
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

          {/* Videos */}
          {tribute.videos?.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2.5">
                <Video size={11} color="#C9A84C" />
                <span className="text-xs text-text-muted font-medium uppercase tracking-wide">
                  {tribute.videos.length === 1 ? 'Vídeo' : `${tribute.videos.length} vídeos`}
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {tribute.videos.map((url, i) => (
                  <VideoPlayer key={i} src={url} />
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {lightboxIdx !== null && (
          <Lightbox
            fotos={tribute.fotos}
            startIdx={lightboxIdx}
            onClose={() => setLightboxIdx(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}

/* ─── Closing section ─── */
function ClosingSection({ contacts }: { contacts: { nome: string; telefone: string }[] }) {
  return (
    <div className="w-full flex flex-col gap-7">
      {/* Decorative separator */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.5))' }} />
        <div className="flex items-center gap-1">
          <Heart size={12} color="#C9A84C" fill="#C9A84C" />
          <Heart size={18} color="#C9A84C" fill="#C9A84C" />
          <Heart size={12} color="#C9A84C" fill="#C9A84C" />
        </div>
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(201,168,76,0.5), transparent)' }} />
      </div>

      {/* Letter from Evandro */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full"
      >
        <FloralOrnament position="tl" size={36} tone="gold" opacity={0.35} />
        <FloralOrnament position="br" size={36} tone="gold" opacity={0.35} />
        <div
          className="relative p-6 rounded-3xl flex flex-col gap-5"
          style={{
            background: 'linear-gradient(135deg, rgba(253,252,250,0.97) 0%, rgba(247,237,216,0.65) 100%)',
            border: '1px solid rgba(201,168,76,0.28)',
            boxShadow: '0 2px 0 rgba(255,255,255,0.8) inset, 0 8px 32px -8px rgba(61,50,40,0.12)',
          }}
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-2xl">💝</span>
            <h2
              className="text-xl font-bold text-text-dark text-center"
              style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
            >
              Agradecer com carinho
            </h2>
          </div>

          <div
            className="flex flex-col gap-3 text-text-dark leading-relaxed"
            style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontStyle: 'italic', fontSize: 15 }}
          >
            <p>Mãezinha,</p>
            <p>
              Muitas das pessoas que estão aqui se dispuseram a participar porque gostam de você e quiseram
              deixar um pedacinho de carinho neste dia tão especial.
            </p>
            <p>Cada mensagem, foto, vídeo e lembrança foi enviada com muito carinho.</p>
            <p>
              Se você quiser agradecer alguma dessas pessoas, abaixo estarão disponíveis os contatos de quem
              autorizou compartilhar o WhatsApp.
            </p>
            <p>
              Ao tocar no botão de uma pessoa, o WhatsApp será aberto automaticamente já com uma mensagem
              de agradecimento pronta.
            </p>
            <p>
              Você pode enviar exatamente como está, editar do seu jeito ou até mesmo não enviar agora.
            </p>
            <p>E não se preocupe: o intuito não é gerar trabalho nem obrigação.</p>
            <p className="font-semibold" style={{ fontStyle: 'normal', color: '#5C4A32' }}>
              O carinho já foi entregue.
            </p>
            <p>O agradecimento pode acontecer hoje, amanhã ou quando você sentir vontade.</p>
          </div>

          <div className="flex flex-col items-end gap-0.5 pt-1" style={{ borderTop: '1px solid rgba(232,213,163,0.4)' }}>
            <p className="text-sm text-text-muted" style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontStyle: 'italic' }}>
              Com amor,
            </p>
            <p className="text-lg font-bold text-text-dark" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
              Evandro ❤️
            </p>
          </div>
        </div>
      </motion.div>

      {/* WhatsApp section — only if there are contacts */}
      {contacts.length > 0 && (
        <>
          {/* How it works */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="rounded-2xl p-4 flex flex-col gap-3"
            style={{
              background: 'rgba(232,213,163,0.18)',
              border: '1px solid rgba(201,168,76,0.25)',
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">ℹ️</span>
              <p className="text-sm font-semibold text-text-dark">Como funciona?</p>
            </div>
            <div className="flex flex-col gap-1.5 text-sm text-text-muted leading-relaxed">
              <p>Ao tocar em <span className="font-medium text-text-dark">&ldquo;Enviar agradecimento&rdquo;</span>, o WhatsApp abrirá com a mensagem já pronta.</p>
              <ul className="flex flex-col gap-1 mt-1">
                <li>• Você pode enviar como está</li>
                <li>• Pode editar o texto antes</li>
                <li>• Pode fechar sem enviar nada</li>
              </ul>
              <p className="font-semibold text-text-dark mt-1">Nada será enviado automaticamente.</p>
            </div>
          </motion.div>

          {/* Message preview */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="flex flex-col gap-2"
          >
            <div className="flex items-center gap-1.5 mb-0.5">
              <MessageSquare size={11} color="#C9A84C" />
              <span className="text-xs text-text-muted font-medium uppercase tracking-wide">Mensagem que será enviada</span>
            </div>
            <div
              className="rounded-2xl px-5 py-4"
              style={{
                background: 'rgba(255,253,249,0.9)',
                border: '1px solid rgba(201,168,76,0.30)',
                boxShadow: '0 2px 0 rgba(255,255,255,0.8) inset',
              }}
            >
              <p
                className="text-text-dark text-sm leading-relaxed"
                style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontStyle: 'italic' }}
              >
                &ldquo;{THANK_YOU_MSG}&rdquo;
              </p>
            </div>
          </motion.div>

          {/* Contacts */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="flex flex-col gap-3"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Heart size={11} color="#C9A84C" fill="#C9A84C" />
              <span className="text-xs text-text-muted font-medium uppercase tracking-wide">Toque para agradecer</span>
            </div>
            {contacts.map((c) => {
              const phone = c.telefone.replace(/\D/g, '')
              const waUrl = `https://wa.me/55${phone}?text=${encodeURIComponent(THANK_YOU_MSG)}`
              return (
                <motion.a
                  key={c.telefone}
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                  className="flex items-center gap-4 rounded-2xl px-5 py-4"
                  style={{
                    background: 'linear-gradient(135deg, rgba(253,252,250,0.98) 0%, rgba(247,237,216,0.55) 100%)',
                    border: '1px solid rgba(201,168,76,0.32)',
                    boxShadow: '0 2px 0 rgba(255,255,255,0.8) inset, 0 5px 18px -5px rgba(61,50,40,0.12)',
                    textDecoration: 'none',
                    display: 'flex',
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      background: 'rgba(37,211,102,0.10)',
                      border: '1.5px solid rgba(37,211,102,0.30)',
                    }}
                  >
                    <WhatsAppIcon />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-text-dark text-base leading-tight">{c.nome}</p>
                    <p className="text-text-muted text-sm mt-0.5">Enviar agradecimento</p>
                  </div>
                  <ChevronRight size={20} color="#C9A84C" style={{ flexShrink: 0 }} />
                </motion.a>
              )
            })}
          </motion.div>
        </>
      )}

      {/* Final note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col items-center gap-3 pt-2 pb-8"
      >
        <div className="flex items-center gap-1.5">
          <Heart size={12} color="#C9A84C" fill="#C9A84C" />
          <Heart size={20} color="#C9A84C" fill="#C9A84C" />
          <Heart size={12} color="#C9A84C" fill="#C9A84C" />
        </div>
        <p className="text-text-muted text-sm text-center leading-relaxed px-4">
          Feito com muito amor para você, Sônia 🌸
        </p>
        <p className="text-xs text-center" style={{ color: 'rgba(139,115,85,0.45)' }}>
          Este momento foi preparado especialmente para você.
        </p>
      </motion.div>
    </div>
  )
}

/* ─── Card especial do Evandro ─── */
function EvandroCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.75, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full"
    >
      <FloralOrnament position="tl" size={42} tone="gold" opacity={0.45} />
      <FloralOrnament position="br" size={42} tone="gold" opacity={0.45} />
      <div
        className="relative p-6 rounded-3xl flex flex-col gap-5"
        style={{
          background: 'linear-gradient(145deg, rgba(253,252,250,0.97) 0%, rgba(248,240,220,0.78) 100%)',
          border: '1.5px solid rgba(201,168,76,0.40)',
          boxShadow: '0 2px 0 rgba(255,255,255,0.88) inset, 0 12px 40px -8px rgba(61,50,40,0.15)',
        }}
      >
        {/* Rótulo superior */}
        <div className="flex justify-center">
          <div
            className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium tracking-widest uppercase"
            style={{
              background: 'linear-gradient(135deg, rgba(201,168,76,0.14) 0%, rgba(232,213,163,0.32) 100%)',
              border: '1px solid rgba(201,168,76,0.38)',
              color: '#A07830',
            }}
          >
            <Heart size={11} color="#C9A84C" fill="#C9A84C" />
            <span>Uma mensagem do seu filho</span>
            <Heart size={11} color="#C9A84C" fill="#C9A84C" />
          </div>
        </div>

        {/* Divisor decorativo */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.45))' }} />
          <Heart size={14} color="#C9A84C" fill="#C9A84C" />
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(201,168,76,0.45), transparent)' }} />
        </div>

        {/* Texto da carta */}
        <div
          className="rounded-2xl px-5 py-4"
          style={{ background: 'rgba(255,253,249,0.85)', border: '1px solid rgba(232,213,163,0.38)' }}
        >
          <div className="flex items-center gap-1.5 mb-3">
            <MessageSquare size={11} color="#C9A84C" />
            <span className="text-xs text-text-muted font-medium uppercase tracking-wide">Mensagem</span>
          </div>
          <p
            className="text-text-dark"
            style={{
              fontFamily: 'var(--font-playfair), Georgia, serif',
              fontStyle: 'italic',
              fontSize: 'clamp(15px, 2.2vw, 17px)',
              lineHeight: 1.8,
              whiteSpace: 'pre-line',
            }}
          >
            &ldquo;Mãezinha, eu tentei reunir aqui um pouco do carinho que as pessoas sentem por você.{'\n\n'}Cada mensagem, cada foto e cada áudio foi deixado com amor, para que você pudesse sentir, de pertinho, o quanto é especial na vida de tanta gente.{'\n\n'}Fiz tudo com muito carinho, pensando em você.{'\n\n'}Te amo muito.&rdquo;
          </p>
        </div>

        {/* Assinatura */}
        <div
          className="flex flex-col items-end gap-0.5 pt-1"
          style={{ borderTop: '1px solid rgba(232,213,163,0.4)' }}
        >
          <p
            className="text-sm"
            style={{
              fontFamily: 'var(--font-playfair), Georgia, serif',
              fontStyle: 'italic',
              color: '#8B7355',
            }}
          >
            Com amor,
          </p>
          <p
            className="text-xl font-bold text-text-dark"
            style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
          >
            Evandro ❤️
          </p>
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Gallery tile (mosaico) ─── */
function GalleryTile({ photo, isFirst, index, onClick }: {
  photo: GalleryPhoto
  isFirst: boolean
  index: number
  onClick: () => void
}) {
  const [imgError, setImgError] = useState(false)

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.06, 0.4) }}
      onClick={onClick}
      style={{
        gridColumn: isFirst ? '1 / -1' : undefined,
        aspectRatio: isFirst ? '4 / 3' : '1 / 1',
        borderRadius: 16,
        border: '1px solid rgba(201,168,76,0.24)',
        boxShadow: '0 3px 14px -4px rgba(61,50,40,0.22)',
        background: '#150d04',
        display: 'block',
        cursor: 'pointer',
        outline: 'none',
        overflow: 'hidden',
        position: 'relative',
      }}
      className="active:scale-95 transition-transform"
    >
      {!imgError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo.url}
          alt={`Foto de ${photo.nome}`}
          loading="lazy"
          decoding="async"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={() => setImgError(true)}
        />
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Camera size={22} color="rgba(201,168,76,0.35)" />
        </div>
      )}

      {/* Etiqueta com nome */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '20px 10px 8px',
          background: 'linear-gradient(to top, rgba(8,3,0,0.72) 0%, transparent 100%)',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
        }}
      >
        <Heart size={8} color="rgba(201,168,76,0.8)" fill="rgba(201,168,76,0.8)" style={{ flexShrink: 0 }} />
        <span
          style={{
            fontSize: 11,
            fontFamily: 'var(--font-playfair), Georgia, serif',
            fontStyle: 'italic',
            color: 'rgba(255,255,255,0.82)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {photo.nome}
        </span>
      </div>
    </motion.button>
  )
}

/* ─── Gallery lightbox (separado do Lightbox dos cards) ─── */
function GalleryLightbox({ photos, startIdx, onClose }: {
  photos: GalleryPhoto[]
  startIdx: number
  onClose: () => void
}) {
  const [idx, setIdx] = useState(startIdx)
  const touchStartX = useRef(0)

  const prev = () => setIdx((i) => Math.max(0, i - 1))
  const next = () => setIdx((i) => Math.min(photos.length - 1, i + 1))

  // Trava o scroll do fundo enquanto o lightbox está aberto
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }
  function handleTouchEnd(e: React.TouchEvent) {
    const delta = touchStartX.current - e.changedTouches[0].clientX
    if (delta > 55) next()
    else if (delta < -55) prev()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: 'rgba(6,3,1,0.97)' }}
    >
      {/* Cabeçalho: etiqueta da pessoa + botão fechar */}
      <div className="flex items-center justify-between px-4 py-4 shrink-0">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs"
            style={{
              background: 'rgba(201,168,76,0.15)',
              border: '1px solid rgba(201,168,76,0.32)',
              color: '#F0D88A',
            }}
          >
            <Heart size={9} color="#C9A84C" fill="#C9A84C" />
            <span>Foto de {photos[idx].nome}</span>
            <span style={{ color: 'rgba(255,255,255,0.35)', marginLeft: 4 }}>
              {idx + 1}/{photos.length}
            </span>
          </motion.div>
        </AnimatePresence>

        <button
          onClick={onClose}
          className="flex items-center gap-2 rounded-full font-semibold text-sm active:scale-95 transition-transform"
          style={{
            background: 'rgba(255,255,255,0.14)',
            border: '1.5px solid rgba(255,255,255,0.28)',
            color: '#fff',
            padding: '10px 18px',
          }}
        >
          <X size={16} strokeWidth={2.5} />
          <span>Fechar</span>
        </button>
      </div>

      {/* Foto */}
      <div
        className="flex-1 flex items-center justify-center px-3 overflow-hidden min-h-0"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={onClose}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.img
            key={idx}
            src={photos[idx].url}
            alt={`Foto de ${photos[idx].nome}`}
            initial={{ opacity: 0, scale: 0.93 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.93 }}
            transition={{ duration: 0.18 }}
            className="rounded-2xl object-contain"
            style={{ maxWidth: '100%', maxHeight: '100%' }}
            onClick={(e) => e.stopPropagation()}
          />
        </AnimatePresence>
      </div>

      {/* Navegação — área de toque generosa */}
      <div className="flex items-center justify-between px-4 py-5 shrink-0 gap-3">
        <button
          onClick={prev}
          disabled={idx === 0}
          className="flex items-center justify-center gap-2 rounded-2xl font-medium text-sm active:scale-95 transition-all disabled:opacity-25"
          style={{
            background: 'rgba(255,255,255,0.10)',
            border: '1px solid rgba(255,255,255,0.18)',
            color: '#fff',
            padding: '14px 0',
            flex: 1,
          }}
        >
          <ChevronLeft size={20} />
          <span>Anterior</span>
        </button>

        <button
          onClick={next}
          disabled={idx === photos.length - 1}
          className="flex items-center justify-center gap-2 rounded-2xl font-medium text-sm active:scale-95 transition-all disabled:opacity-25"
          style={{
            background: 'rgba(255,255,255,0.10)',
            border: '1px solid rgba(255,255,255,0.18)',
            color: '#fff',
            padding: '14px 0',
            flex: 1,
          }}
        >
          <span>Próxima</span>
          <ChevronRight size={20} />
        </button>
      </div>
    </motion.div>
  )
}

/* ─── Galeria geral de fotos ─── */
function PhotoGallery({ tributes }: { tributes: Tribute[] }) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)

  // Coleta e deduplica todas as fotos com o nome de quem enviou
  const allPhotos: GalleryPhoto[] = []
  const seen = new Set<string>()
  for (const t of tributes) {
    for (const url of t.fotos ?? []) {
      if (url && !seen.has(url)) {
        seen.add(url)
        allPhotos.push({ url, nome: t.nome })
      }
    }
  }

  if (allPhotos.length === 0) return null

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Separador decorativo */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.5))' }} />
        <div className="flex items-center gap-1.5">
          <Camera size={11} color="#C9A84C" />
          <Heart size={14} color="#C9A84C" fill="#C9A84C" />
          <Camera size={11} color="#C9A84C" />
        </div>
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(201,168,76,0.5), transparent)' }} />
      </div>

      {/* Cabeçalho emocional */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-2 text-center px-2"
      >
        <div
          className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium tracking-widest uppercase"
          style={{
            background: 'linear-gradient(135deg, rgba(201,168,76,0.12) 0%, rgba(232,213,163,0.28) 100%)',
            border: '1px solid rgba(201,168,76,0.32)',
            color: '#A07830',
          }}
        >
          <Camera size={10} color="#A07830" />
          <span>Memórias em fotos</span>
        </div>
        <p className="text-text-muted text-sm leading-relaxed mt-1">
          Alguns pedacinhos de carinho que ficaram guardados para você.
        </p>
        <p className="text-xs leading-relaxed px-2" style={{ color: 'rgba(139,115,85,0.65)' }}>
          Depois de ler e ouvir tantas mensagens, aqui estão algumas lembranças em imagens.
        </p>
      </motion.div>

      {/* Mosaico 2 colunas — primeira foto destaque */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
        }}
      >
        {allPhotos.map((photo, i) => (
          <GalleryTile
            key={photo.url}
            photo={photo}
            isFirst={i === 0}
            index={i}
            onClick={() => setLightboxIdx(i)}
          />
        ))}
      </motion.div>

      <p className="text-center text-xs" style={{ color: 'rgba(139,115,85,0.5)' }}>
        👆 Toque em uma foto para ver maior
      </p>

      {/* Lightbox da galeria — estado separado do carrossel dos cards */}
      <AnimatePresence>
        {lightboxIdx !== null && (
          <GalleryLightbox
            photos={allPhotos}
            startIdx={lightboxIdx}
            onClose={() => setLightboxIdx(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── Tela de erro de carregamento ─── */
function LoadFailedScreen() {
  return (
    <motion.div
      key="load-failed"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-8 text-center"
      style={{ background: 'radial-gradient(ellipse at 50% 40%, #FDFCFA 0%, #FBF0F0 50%, #F7EDD8 100%)' }}
    >
      <FloralOrnament position="tl" size={60} tone="gold" opacity={0.3} />
      <FloralOrnament position="br" size={60} tone="gold" opacity={0.3} />

      <div className="relative z-10 flex flex-col items-center gap-8 max-w-xs">
        <span className="text-5xl">🌸</span>

        <div className="flex flex-col gap-3">
          <h2
            className="text-xl font-bold text-text-dark"
            style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
          >
            Um momento...
          </h2>
          <p className="text-text-muted text-base leading-relaxed">
            Tivemos um probleminha para carregar sua homenagem. Toque no botão abaixo para tentar novamente.
          </p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="w-full py-4 rounded-2xl font-semibold text-white text-base active:scale-95 transition-transform"
          style={{
            background: 'linear-gradient(135deg, #D9B95C 0%, #C9A84C 100%)',
            boxShadow: '0 4px 24px rgba(201,168,76,0.45)',
          }}
        >
          Tentar novamente
        </button>
      </div>
    </motion.div>
  )
}

/* ─── Splash screen com progresso real ─── */
function SplashScreen({ progress }: { progress: number }) {
  const [imgErr, setImgErr] = useState(false)

  return (
    <motion.div
      key="splash"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.06 }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-8 overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 35% 25%, #FDFCFA 0%, #FBF0F0 48%, #F7EDD8 100%)' }}
    >
      <DecoBackground variant="ornate" />
      <FloralOrnament position="tl" size={72} tone="gold" opacity={0.38} />
      <FloralOrnament position="tr" size={72} tone="gold" opacity={0.38} />
      <FloralOrnament position="bl" size={72} tone="gold" opacity={0.38} />
      <FloralOrnament position="br" size={72} tone="gold" opacity={0.38} />

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium animate-breathe"
          style={{
            background: 'linear-gradient(135deg, rgba(201,168,76,0.14) 0%, rgba(232,213,163,0.30) 100%)',
            border: '1px solid rgba(201,168,76,0.35)',
            color: '#A07830',
            letterSpacing: '0.16em',
            boxShadow: '0 1px 0 rgba(255,255,255,0.5) inset, 0 4px 12px -4px rgba(201,168,76,0.25)',
          }}
        >
          🎂 59 anos · 4 de junho
        </motion.div>

        {/* Photo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.82 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div
            className="absolute -inset-8 rounded-full opacity-55 animate-glow-pulse"
            style={{ background: 'radial-gradient(circle, rgba(232,213,163,0.6), transparent 65%)' }}
          />
          <div
            className="absolute -inset-3 rounded-full animate-breathe"
            style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.18), transparent 70%)' }}
          />
          <div
            className="relative w-44 h-44 rounded-full overflow-hidden"
            style={{
              boxShadow: '0 1px 0 rgba(255,255,255,0.9) inset, 0 14px 52px rgba(201,168,76,0.5), 0 28px 72px -14px rgba(61,50,40,0.30)',
              border: '5px solid #FFFDF9',
              background: '#F0E8D8',
            }}
          >
            {!imgErr ? (
              <Image
                src="/sonia.jpg"
                alt="Sônia"
                width={176}
                height={176}
                className="w-full h-full object-cover object-top"
                priority
                onError={() => setImgErr(true)}
              />
            ) : (
              <span
                className="flex items-center justify-center h-full text-6xl font-bold"
                style={{ fontFamily: 'var(--font-playfair)', color: '#C9A84C' }}
              >S</span>
            )}
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="flex flex-col items-center gap-1.5 text-center"
        >
          <p className="text-sm font-medium tracking-widest uppercase" style={{ color: '#A07830' }}>
            Uma surpresa para
          </p>
          <h1
            className="text-5xl font-bold"
            style={{ fontFamily: 'var(--font-playfair), Georgia, serif', color: '#3D3228', textShadow: '0 2px 12px rgba(201,168,76,0.18)' }}
          >
            Sônia
          </h1>
          <p className="text-sm mt-1" style={{ color: '#C9A84C', fontFamily: 'var(--font-playfair)', fontStyle: 'italic' }}>
            com todo o nosso amor 🤍
          </p>
        </motion.div>

        {/* Barra de progresso real */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.85 }}
          className="flex flex-col items-center gap-2.5 w-64"
        >
          <div className="flex items-center justify-between w-full">
            <p className="text-xs text-text-muted" style={{ letterSpacing: '0.06em' }}>
              Carregando homenagem…
            </p>
            <p className="text-xs font-semibold" style={{ color: '#A07830' }}>
              {progress}%
            </p>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(201,168,76,0.18)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #D9B95C, #C9A84C)' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
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
  const [showButton, setShowButton] = useState(false)

  function handleVideoEnded() {
    setShowButton(true)
  }

  // Show button after 5s max even if video is still playing
  useEffect(() => {
    const t = setTimeout(() => setShowButton(true), 5000)
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
      {/* Photo base layer — always visible; shows through if video autoplay is blocked */}
      <div className="absolute inset-0">
        <Image
          src="/sonia.jpg"
          alt="Sônia"
          fill
          className="object-cover object-top"
          priority
        />
      </div>

      {/* Video overlay — on top of the photo */}
      <video
        ref={videoRef}
        src="/video.mp4"
        autoPlay
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        onEnded={handleVideoEnded}
      />

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
  const [splashDone, setSplashDone] = useState(false)
  const [progress, setProgress] = useState(0)
  const [loadFailed, setLoadFailed] = useState(false)
  const [imgError, setImgError] = useState(false)
  const tributesRef = useRef<HTMLDivElement>(null)
  const loadedRef = useRef(0)
  const totalRef = useRef(0)

  useEffect(() => {
    // Global 25s safety timer — if still loading, show friendly error instead of hanging forever
    const globalTimer = setTimeout(() => setLoadFailed(true), 25000)

    async function loadAll() {
      // 1. Fetch with 8s timeout
      let participants: Tribute[] = []
      try {
        const controller = new AbortController()
        const fetchTimeout = setTimeout(() => controller.abort(), 8000)
        const res = await fetch('/api/homenagem', { signal: controller.signal })
        clearTimeout(fetchTimeout)
        const data = await res.json()
        participants = data.participants ?? []
      } catch {
        participants = []
      }
      setTributes(participants)

      // 2. Media URLs — participant videos excluded (large, load lazily in VideoPlayer)
      const photoUrls = [
        '/sonia.jpg',
        ...participants.flatMap((p) => p.fotos ?? []),
      ]
      const audioUrls = participants.filter((p) => p.audio).map((p) => p.audio as string)
      const videoUrls = ['/video.mp4']
      const total = photoUrls.length + audioUrls.length + videoUrls.length

      totalRef.current = total
      loadedRef.current = 0

      function onItemLoaded() {
        loadedRef.current += 1
        const pct = Math.round((loadedRef.current / totalRef.current) * 100)
        setProgress(pct)
        if (loadedRef.current >= totalRef.current) {
          clearTimeout(globalTimer)
          setTimeout(() => setSplashDone(true), 400)
        }
      }

      function preload(src: string, type: 'image' | 'audio' | 'video') {
        let settled = false
        const settle = () => {
          if (settled) return
          settled = true
          onItemLoaded()
        }
        const timeout = setTimeout(settle, 8000)

        if (type === 'image') {
          const img = new window.Image()
          img.onload = () => { clearTimeout(timeout); settle() }
          img.onerror = () => { clearTimeout(timeout); settle() }
          img.src = src
        } else if (type === 'audio') {
          const el = new Audio()
          el.preload = 'metadata'
          el.onloadeddata = () => { clearTimeout(timeout); settle() }
          el.onerror = () => { clearTimeout(timeout); settle() }
          el.src = src
        } else {
          const el = document.createElement('video')
          el.preload = 'metadata'
          el.onloadedmetadata = () => { clearTimeout(timeout); settle() }
          el.onerror = () => { clearTimeout(timeout); settle() }
          el.src = src
        }
      }

      photoUrls.forEach((url) => preload(url, 'image'))
      audioUrls.forEach((url) => preload(url, 'audio'))
      videoUrls.forEach((url) => preload(url, 'video'))
    }

    loadAll().catch(() => { clearTimeout(globalTimer); setProgress(100); setSplashDone(true) })
    return () => clearTimeout(globalTimer)
  }, [])

  function handleReveal() {
    setRevealed(true)
    setTimeout(() => {
      tributesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 600)
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Splash de carregamento */}
      <AnimatePresence>
        {!splashDone && !loadFailed && <SplashScreen progress={progress} />}
      </AnimatePresence>

      {/* Error screen */}
      <AnimatePresence>
        {loadFailed && <LoadFailedScreen />}
      </AnimatePresence>

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
            className="min-h-screen flex flex-col items-center px-5 pb-12 relative overflow-hidden"
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
              {tributes.length === 0 ? (
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
                  <EvandroCard />
                  {tributes.map((t, i) => (
                    <TributeCard key={t.id} tribute={t} index={i} />
                  ))}
                  <PhotoGallery tributes={tributes} />
                  <ClosingSection
                    contacts={tributes
                      .filter((t) => t.telefone)
                      .map((t) => ({ nome: t.nome, telefone: t.telefone! }))}
                  />
                </div>
              )}
            </div>
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  )
}
