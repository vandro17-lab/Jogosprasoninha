'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface ToastProps {
  message: string
  duration?: number
  onDone?: () => void
}

export default function Toast({ message, duration = 2600, onDone }: ToastProps) {
  const [mounted, setMounted] = useState(false)
  const onDoneRef = useRef(onDone)
  useEffect(() => { onDoneRef.current = onDone })

  useEffect(() => {
    setMounted(true)
    const timer = setTimeout(() => onDoneRef.current?.(), duration)
    return () => clearTimeout(timer)
  }, [duration])

  if (!mounted) return null

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 2rem',
        backdropFilter: 'blur(3px)',
        WebkitBackdropFilter: 'blur(3px)',
        background: 'rgba(250,247,242,0.45)',
        animation: `toast-bg-enter ${duration}ms ease forwards`,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #FFFDF9 0%, #F5EDD8 100%)',
          border: '1px solid #E8D5A3',
          boxShadow: '0 12px 40px rgba(201,168,76,0.30)',
          borderRadius: '1.5rem',
          padding: '1.5rem 2rem',
          textAlign: 'center',
          maxWidth: '20rem',
          animation: `toast-enter ${duration}ms cubic-bezier(0.34,1.4,0.64,1) forwards`,
        }}
      >
        <p style={{ color: '#3D3228', fontSize: '1rem', lineHeight: '1.6', whiteSpace: 'pre-line' }}>{message}</p>
      </div>
    </div>,
    document.body
  )
}
