'use client'

import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  duration?: number
  onDone?: () => void
}

export default function Toast({ message, duration = 2600, onDone }: ToastProps) {
  const [phase, setPhase] = useState<'in' | 'visible' | 'out'>('in')

  useEffect(() => {
    const toVisible = setTimeout(() => setPhase('visible'), 50)
    const toOut = setTimeout(() => setPhase('out'), duration - 400)
    const toDone = setTimeout(() => onDone?.(), duration)
    return () => { clearTimeout(toVisible); clearTimeout(toOut); clearTimeout(toDone) }
  }, [duration, onDone])

  const isShowing = phase === 'visible'
  const opacity = phase === 'in' ? 0 : phase === 'visible' ? 1 : 0
  const scale = phase === 'in' ? 0.88 : phase === 'visible' ? 1 : 0.88

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-8"
      style={{
        backdropFilter: isShowing ? 'blur(3px)' : 'none',
        background: isShowing ? 'rgba(250,247,242,0.4)' : 'transparent',
        transition: 'backdrop-filter 0.3s ease, background 0.3s ease',
        pointerEvents: 'none',
      }}
    >
      <div
        className="rounded-3xl px-8 py-6 text-center max-w-xs"
        style={{
          background: 'linear-gradient(135deg, #FFFDF9 0%, #F5EDD8 100%)',
          border: '1px solid #E8D5A3',
          boxShadow: '0 12px 40px rgba(201,168,76,0.30)',
          opacity,
          transform: `scale(${scale})`,
          transition: 'opacity 0.35s ease, transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        <p className="text-text-dark text-base leading-relaxed">{message}</p>
      </div>
    </div>
  )
}
