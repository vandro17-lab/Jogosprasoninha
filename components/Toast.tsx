'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

interface ToastProps {
  message: string
  duration?: number
  onDone?: () => void
}

const SPARKLE_POS = [
  { top: 8,    left: 14,  size: 12, delay: 0.0 },
  { top: 14,   right: 16, size: 10, delay: 0.6 },
  { bottom: 12, right: 24, size: 11, delay: 1.2 },
  { bottom: 16, left: 28, size: 9,  delay: 1.8 },
]

export default function Toast({ message, duration = 2600, onDone }: ToastProps) {
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(true)
  const onDoneRef = useRef(onDone)
  useEffect(() => { onDoneRef.current = onDone })

  useEffect(() => {
    setMounted(true)
    const hideAt = duration - 400
    const hideTimer = setTimeout(() => setVisible(false), hideAt > 0 ? hideAt : duration)
    const doneTimer = setTimeout(() => onDoneRef.current?.(), duration)
    return () => { clearTimeout(hideTimer); clearTimeout(doneTimer) }
  }, [duration])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 2rem',
            backdropFilter: 'blur(10px) saturate(120%)',
            WebkitBackdropFilter: 'blur(10px) saturate(120%)',
            background: 'rgba(253, 252, 250, 0.55)',
            pointerEvents: 'none',
          }}
        >
          <motion.div
            initial={{ scale: 0.82, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.90, y: -8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24, delay: 0.05 }}
            className="glass-card-ornate relative"
            style={{
              padding: '1.85rem 2.1rem',
              textAlign: 'center',
              maxWidth: '20.5rem',
            }}
          >
            {/* Floating sparkles around toast */}
            {SPARKLE_POS.map((p, i) => (
              <motion.div
                key={i}
                aria-hidden
                className="absolute"
                style={{
                  top: p.top,
                  left: p.left,
                  right: p.right,
                  bottom: p.bottom,
                  width: p.size,
                  height: p.size,
                  color: '#C9A84C',
                  zIndex: 3,
                }}
                animate={{ opacity: [0, 0.95, 0], scale: [0.6, 1.1, 0.7], rotate: [0, 90] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width={p.size} height={p.size}>
                  <path d="M12 1 L13.4 9.2 L22 12 L13.4 14.8 L12 23 L10.6 14.8 L2 12 L10.6 9.2 Z" />
                </svg>
              </motion.div>
            ))}

            <p
              className="relative"
              style={{ color: '#3D3228', fontSize: '1rem', lineHeight: '1.65', whiteSpace: 'pre-line', zIndex: 2 }}
            >
              {message}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
