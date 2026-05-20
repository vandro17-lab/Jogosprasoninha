'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Mic2, Square } from 'lucide-react'

interface MicButtonProps {
  recording: boolean
  onClick: () => void
  disabled?: boolean
}

export default function MicButton({ recording, onClick, disabled }: MicButtonProps) {
  return (
    <div className="relative flex items-center justify-center">
      {/* Expanding rings when recording */}
      <AnimatePresence>
        {recording && (
          <>
            <motion.div
              key="ring1"
              initial={{ scale: 1, opacity: 0.7 }}
              animate={{ scale: 2.2, opacity: 0 }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'rgba(200, 76, 76, 0.25)',
              }}
            />
            <motion.div
              key="ring2"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
              style={{
                position: 'absolute',
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'rgba(200, 76, 76, 0.20)',
              }}
            />
          </>
        )}
      </AnimatePresence>

      <motion.button
        onClick={onClick}
        disabled={disabled}
        whileHover={disabled ? {} : { scale: 1.06 }}
        whileTap={disabled ? {} : { scale: 0.90 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        aria-label={recording ? 'Parar gravação' : 'Iniciar gravação'}
        style={{
          position: 'relative',
          zIndex: 10,
          width: 80,
          height: 80,
          borderRadius: '50%',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          background: recording
            ? 'linear-gradient(135deg, #C84C4C 0%, #A03030 100%)'
            : 'linear-gradient(135deg, #C9A84C 0%, #A07830 100%)',
          boxShadow: recording
            ? '0 6px 24px rgba(200, 76, 76, 0.45)'
            : '0 6px 24px rgba(201, 168, 76, 0.45)',
        }}
      >
        <AnimatePresence mode="wait">
          {recording ? (
            <motion.span
              key="stop"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Square size={28} color="white" fill="white" />
            </motion.span>
          ) : (
            <motion.span
              key="mic"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Mic2 size={30} color="white" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  )
}
