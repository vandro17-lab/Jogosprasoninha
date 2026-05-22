'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Play, Pause, Music2, Camera, MessageSquare, Loader2 } from 'lucide-react'
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

function TributeCard({ tribute, index }: { tribute: Tribute; index: number }) {
  const [lightbox, setLightbox] = useState<string | null>(null)

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full"
      >
        <FloralOrnament position="tl" size={36} tone="gold" opacity={0.4} />
        <FloralOrnament position="br" size={36} tone="gold" opacity={0.4} />

        <div
          className="relative p-6 rounded-3xl flex flex-col gap-4"
          style={{
            background: 'linear-gradient(135deg, rgba(253,252,250,0.95) 0%, rgba(247,237,216,0.6) 100%)',
            border: '1px solid rgba(201,168,76,0.25)',
            boxShadow: '0 2px 0 rgba(255,255,255,0.8) inset, 0 8px 32px -8px rgba(61,50,40,0.10)',
          }}
        >
          {/* Author header */}
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
            <Heart size={14} color="#C9A84C" className="ml-auto shrink-0" fill="#C9A84C" />
          </div>

          {/* Message */}
          {tribute.mensagem && (
            <div
              className="rounded-2xl px-4 py-3"
              style={{
                background: 'rgba(255,253,249,0.8)',
                border: '1px solid rgba(232,213,163,0.35)',
              }}
            >
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

      {/* Lightbox */}
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

export default function SuaHomenagem() {
  const [tributes, setTributes] = useState<Tribute[]>([])
  const [loading, setLoading] = useState(true)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    fetch('/api/homenagem')
      .then((r) => r.json())
      .then((d) => setTributes(d.participants ?? []))
      .catch(() => setTributes([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="min-h-screen flex flex-col items-center px-5 pb-16 relative overflow-hidden">
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
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-5 w-full"
        >
          {/* Badge */}
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

          {/* Photo */}
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

          {/* Title */}
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
          transition={{ duration: 0.8, delay: 0.3 }}
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

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: tributes.length * 0.08 + 0.4 }}
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
    </main>
  )
}
