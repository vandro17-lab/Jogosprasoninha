'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Mic2, Square } from 'lucide-react'

interface MicButtonProps {
  recording: boolean
  onClick: () => void
  disabled?: boolean
  size?: number
}

export default function MicButton({ recording, onClick, disabled, size = 84 }: MicButtonProps) {
  const ringColor = recording ? 'rgba(200, 76, 76, 0.25)' : 'rgba(201, 168, 76, 0.22)'
  const ringColor2 = recording ? 'rgba(200, 76, 76, 0.18)' : 'rgba(201, 168, 76, 0.16)'

  return (
    <div className="relative flex items-center justify-center" style={{ width: size + 16, height: size + 16 }}>
      {/* Ambient glow base (always-on subtle aura) */}
      <div
        aria-hidden
        className="absolute rounded-full"
        style={{
          width: size + 32,
          height: size + 32,
          background: recording
            ? 'radial-gradient(circle, rgba(200,76,76,0.18) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(201,168,76,0.20) 0%, transparent 70%)',
          filter: 'blur(8px)',
        }}
      />

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
                width: size,
                height: size,
                borderRadius: '50%',
                background: ringColor,
              }}
            />
            <motion.div
              key="ring2"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
              style={{
                position: 'absolute',
                width: size,
                height: size,
                borderRadius: '50%',
                background: ringColor2,
              }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Outer gold/rose trim ring */}
      <div
        aria-hidden
        className="absolute rounded-full"
        style={{
          width: size + 6,
          height: size + 6,
          border: recording
            ? '1.5px solid rgba(232, 200, 200, 0.55)'
            : '1.5px solid rgba(232, 213, 163, 0.65)',
          boxShadow: recording
            ? 'inset 0 0 12px rgba(200, 76, 76, 0.10)'
            : 'inset 0 0 12px rgba(201, 168, 76, 0.10)',
        }}
      />

      <motion.button
        onClick={onClick}
        disabled={disabled}
        whileHover={disabled ? {} : { scale: 1.06 }}
        whileTap={disabled ? {} : { scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        aria-label={recording ? 'Parar gravação' : 'Iniciar gravação'}
        className="focus-ring"
        style={{
          position: 'relative',
          zIndex: 10,
          width: size,
          height: size,
          borderRadius: '50%',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          background: recording
            ? 'linear-gradient(150deg, #D45C5C 0%, #C84C4C 45%, #9A2828 100%)'
            : 'linear-gradient(150deg, #D9B95C 0%, #C9A84C 45%, #8E6A24 100%)',
          boxShadow: recording
            ? '0 1px 0 rgba(255,255,255,0.35) inset, 0 4px 14px rgba(200, 76, 76, 0.42), 0 14px 36px -6px rgba(200, 76, 76, 0.45)'
            : '0 1px 0 rgba(255,255,255,0.45) inset, 0 4px 14px rgba(201, 168, 76, 0.42), 0 14px 36px -6px rgba(201, 168, 76, 0.48)',
        }}
      >
        {/* Inner glossy highlight */}
        <span
          aria-hidden
          style={{
            position: 'absolute',
            inset: 4,
            borderRadius: '50%',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.08) 35%, transparent 55%)',
            pointerEvents: 'none',
          }}
        />

        <AnimatePresence mode="wait">
          {recording ? (
            <motion.span
              key="stop"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ position: 'relative', zIndex: 2 }}
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
              style={{ position: 'relative', zIndex: 2 }}
            >
              <Mic2 size={32} color="white" strokeWidth={1.8} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  )
}
