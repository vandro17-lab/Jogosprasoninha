'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

const HEIGHTS = [0.30, 0.60, 1.00, 0.75, 0.50, 0.90, 0.40, 0.70, 1.00, 0.60, 0.30, 0.80]
const SPEEDS  = [0.80, 0.70, 0.90, 0.75, 0.85, 0.65, 0.95, 0.72, 0.88, 0.68, 0.82, 0.78]
const BAR_COUNT = HEIGHTS.length

interface AudioWavesProps {
  active: boolean
  stream?: MediaStream | null
}

export default function AudioWaves({ active, stream }: AudioWavesProps) {
  const [levels, setLevels] = useState<number[] | null>(null)
  const rafRef = useRef<number | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)

  useEffect(() => {
    if (!active || !stream) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      sourceRef.current?.disconnect()
      analyserRef.current?.disconnect()
      sourceRef.current = null
      analyserRef.current = null
      if (ctxRef.current && ctxRef.current.state !== 'closed') {
        ctxRef.current.close().catch(() => {})
      }
      ctxRef.current = null
      setLevels(null)
      return
    }

    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctor()
    const source = ctx.createMediaStreamSource(stream)
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 64
    analyser.smoothingTimeConstant = 0.78
    source.connect(analyser)

    const data = new Uint8Array(analyser.frequencyBinCount)
    ctxRef.current = ctx
    sourceRef.current = source
    analyserRef.current = analyser

    const tick = () => {
      analyser.getByteFrequencyData(data)
      const usableBins = Math.min(data.length, 22)
      const next: number[] = new Array(BAR_COUNT)
      for (let i = 0; i < BAR_COUNT; i++) {
        const idx = Math.floor((i / BAR_COUNT) * usableBins)
        const v = data[idx] / 255
        next[i] = Math.max(0.18, Math.min(1, Math.pow(v, 0.55) * 1.45))
      }
      setLevels(next)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      source.disconnect()
      analyser.disconnect()
      ctx.close().catch(() => {})
    }
  }, [active, stream])

  const useReal = active && !!stream && levels !== null

  return (
    <div
      className="flex items-center justify-center gap-[3px] px-5 py-3 rounded-full"
      style={{
        background: active
          ? 'linear-gradient(180deg, rgba(255,253,249,0.72), rgba(247,237,216,0.55))'
          : 'linear-gradient(180deg, rgba(255,253,249,0.55), rgba(240,232,216,0.40))',
        border: '1px solid rgba(232,213,163,0.45)',
        boxShadow: active
          ? '0 1px 0 rgba(255,255,255,0.6) inset, 0 0 16px rgba(201,168,76,0.28), 0 6px 18px -6px rgba(201,168,76,0.22)'
          : '0 1px 0 rgba(255,255,255,0.5) inset, 0 1px 2px rgba(61,50,40,0.04)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        transition: 'box-shadow 0.4s ease, background 0.4s ease',
      }}
    >
      {HEIGHTS.map((h, i) => {
        const realLevel = useReal ? levels![i] : null

        if (realLevel != null) {
          return (
            <div
              key={i}
              style={{
                width: 4,
                height: 36,
                borderRadius: 9999,
                transformOrigin: 'center',
                transform: `scaleY(${realLevel})`,
                background: 'linear-gradient(180deg, #F0DBA0 0%, #C9A84C 60%, #A07830 100%)',
                boxShadow: '0 0 4px rgba(201,168,76,0.55)',
                transition: 'transform 70ms linear',
              }}
            />
          )
        }

        return (
          <motion.div
            key={i}
            animate={
              active
                ? { scaleY: [0.25, h, 0.25] }
                : { scaleY: 0.18 }
            }
            transition={
              active
                ? {
                    scaleY: {
                      duration: SPEEDS[i],
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: i * 0.065,
                    },
                  }
                : { duration: 0.4, ease: 'easeOut' }
            }
            style={{
              width: 4,
              height: 36,
              borderRadius: 9999,
              transformOrigin: 'center',
              background: active
                ? 'linear-gradient(180deg, #F0DBA0 0%, #C9A84C 60%, #A07830 100%)'
                : 'linear-gradient(180deg, #E8D5A3 0%, #D8C088 100%)',
              boxShadow: active ? '0 0 4px rgba(201,168,76,0.55)' : 'none',
              transition: 'background 0.3s ease',
            }}
          />
        )
      })}
    </div>
  )
}
