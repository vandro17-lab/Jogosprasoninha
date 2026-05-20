'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

interface ToastProps {
  message: string
  duration?: number
  onDone?: () => void
}

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
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            background: 'rgba(253, 252, 250, 0.55)',
            pointerEvents: 'none',
          }}
        >
          <motion.div
            initial={{ scale: 0.82, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.90, y: -8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24, delay: 0.05 }}
            className="glass-card"
            style={{
              padding: '1.75rem 2rem',
              textAlign: 'center',
              maxWidth: '20rem',
            }}
          >
            <p style={{ color: '#3D3228', fontSize: '1rem', lineHeight: '1.65', whiteSpace: 'pre-line' }}>
              {message}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
