'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause } from 'lucide-react'

const BAR_COUNT = 40

function fmt(t: number) {
  if (!isFinite(t) || t < 0) t = 0
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function PremiumAudioPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const durFixRef = useRef(false)
  const [playing, setPlaying] = useState(false)
  const [cur, setCur] = useState(0)
  const [dur, setDur] = useState(0)

  // Gravações webm/opus do MediaRecorder costumam vir sem duração (Infinity).
  // Força o cálculo "buscando" o fim e voltando ao início.
  function handleLoadedMetadata(e: React.SyntheticEvent<HTMLAudioElement>) {
    const a = e.currentTarget
    if (isFinite(a.duration) && a.duration > 0) {
      setDur(a.duration)
    } else if (!durFixRef.current) {
      durFixRef.current = true
      try { a.currentTime = 1e101 } catch {}
    }
  }

  function handleDurationChange(e: React.SyntheticEvent<HTMLAudioElement>) {
    const a = e.currentTarget
    if (isFinite(a.duration) && a.duration > 0) {
      setDur(a.duration)
      if (durFixRef.current && a.currentTime > a.duration - 1) {
        durFixRef.current = false
        a.currentTime = 0
        setCur(0)
      }
    }
  }

  function handleTimeUpdate(e: React.SyntheticEvent<HTMLAudioElement>) {
    if (durFixRef.current) return
    setCur(e.currentTarget.currentTime)
  }

  const bars = useMemo(
    () =>
      Array.from({ length: BAR_COUNT }, (_, i) => {
        const v = Math.abs(Math.sin((i + 1) * 12.9898) * 43758.5453) % 1
        return 0.32 + v * 0.68
      }),
    []
  )

  // pause this player when another one starts
  useEffect(() => {
    function onOther(e: Event) {
      const el = (e as CustomEvent).detail
      if (el !== audioRef.current) {
        audioRef.current?.pause()
        setPlaying(false)
      }
    }
    window.addEventListener('homenagem-audio-play', onOther)
    return () => window.removeEventListener('homenagem-audio-play', onOther)
  }, [])

  function toggle() {
    const a = audioRef.current
    if (!a) return
    if (a.paused) {
      window.dispatchEvent(new CustomEvent('homenagem-audio-play', { detail: a }))
      a.play().then(() => setPlaying(true)).catch(() => {})
    } else {
      a.pause()
      setPlaying(false)
    }
  }

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const a = audioRef.current
    if (!a || !dur) return
    const r = e.currentTarget.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))
    a.currentTime = ratio * dur
    setCur(a.currentTime)
  }

  const progress = dur ? cur / dur : 0
  const activeIdx = Math.floor(progress * BAR_COUNT)

  return (
    <div
      className="flex items-center gap-3.5 rounded-2xl p-3.5"
      style={{
        background: 'linear-gradient(180deg, rgba(255,253,249,0.9), rgba(247,237,216,0.6))',
        border: '1px solid rgba(232,213,163,0.5)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.6) inset, 0 8px 24px -12px rgba(201,168,76,0.35)',
      }}
    >
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onLoadedMetadata={handleLoadedMetadata}
        onDurationChange={handleDurationChange}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => { setPlaying(false); setCur(0) }}
      />

      <button
        onClick={toggle}
        aria-label={playing ? 'Pausar áudio' : 'Tocar áudio'}
        className="relative shrink-0 flex items-center justify-center rounded-full focus-ring"
        style={{
          width: 52,
          height: 52,
          background: 'linear-gradient(135deg, #F0DBA0, #C9A84C 55%, #9C7228)',
          boxShadow: '0 1px 0 rgba(255,255,255,0.4) inset, 0 6px 18px rgba(201,168,76,0.45)',
        }}
      >
        {playing && (
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full"
            style={{ border: '1.5px solid rgba(201,168,76,0.5)' }}
            animate={{ scale: [1, 1.45], opacity: [0.6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
          />
        )}
        {playing ? (
          <Pause size={22} color="#fff" fill="#fff" />
        ) : (
          <Play size={22} color="#fff" fill="#fff" style={{ marginLeft: 3 }} />
        )}
      </button>

      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <div onClick={seek} className="flex items-center gap-[2.5px] h-9 cursor-pointer">
          {bars.map((h, i) => (
            <motion.span
              key={i}
              className="flex-1 rounded-full"
              style={{
                height: `${h * 100}%`,
                transformOrigin: 'center',
                background:
                  i <= activeIdx
                    ? 'linear-gradient(180deg, #F0DBA0, #C9A84C 60%, #A07830)'
                    : 'rgba(201,168,76,0.22)',
                boxShadow: i <= activeIdx ? '0 0 4px rgba(201,168,76,0.4)' : 'none',
              }}
              animate={playing && Math.abs(i - activeIdx) < 7 ? { scaleY: [1, 0.5, 1] } : { scaleY: 1 }}
              transition={
                playing
                  ? { duration: 0.75, repeat: Infinity, ease: 'easeInOut', delay: (i % 7) * 0.07 }
                  : { duration: 0.3 }
              }
            />
          ))}
        </div>
        <div className="flex justify-between text-[11px] text-text-muted" style={{ fontVariantNumeric: 'tabular-nums' }}>
          <span>{fmt(cur)}</span>
          <span>{fmt(dur)}</span>
        </div>
      </div>
    </div>
  )
}
