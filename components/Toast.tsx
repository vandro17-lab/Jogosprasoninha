'use client'

import { useEffect, useRef } from 'react'

interface ToastProps {
  message: string
  duration?: number
  onDone?: () => void
}

export default function Toast({ message, duration = 2600, onDone }: ToastProps) {
  // Ref evita que o callback recriado a cada render cancele os timers
  const onDoneRef = useRef(onDone)
  useEffect(() => { onDoneRef.current = onDone })

  useEffect(() => {
    const timer = setTimeout(() => onDoneRef.current?.(), duration)
    return () => clearTimeout(timer)
  }, [duration]) // duration é estável — onDone vive no ref

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-8"
      style={{
        backdropFilter: 'blur(3px)',
        WebkitBackdropFilter: 'blur(3px)',
        background: 'rgba(250,247,242,0.45)',
        animation: `toast-bg-enter ${duration}ms ease forwards`,
        pointerEvents: 'none',
      }}
    >
      <div
        className="rounded-3xl px-8 py-6 text-center max-w-xs"
        style={{
          background: 'linear-gradient(135deg, #FFFDF9 0%, #F5EDD8 100%)',
          border: '1px solid #E8D5A3',
          boxShadow: '0 12px 40px rgba(201,168,76,0.30)',
          animation: `toast-enter ${duration}ms cubic-bezier(0.34,1.4,0.64,1) forwards`,
        }}
      >
        <p className="text-text-dark text-base leading-relaxed">{message}</p>
      </div>
    </div>
  )
}
