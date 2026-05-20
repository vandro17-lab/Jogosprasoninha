'use client'

import { motion } from 'framer-motion'

interface ProgressDotsProps {
  total: number
  current: number
}

export default function ProgressDots({ total, current }: ProgressDotsProps) {
  const progress = total <= 1 ? 0 : Math.min(1, (current + 1) / total)

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={current + 1}
      className="relative flex items-center justify-center gap-2 mx-auto"
      style={{ maxWidth: 240 }}
    >
      {/* Track */}
      <div
        aria-hidden
        className="absolute left-0 right-0 top-1/2 -translate-y-1/2 rounded-full"
        style={{
          height: 2,
          background: 'linear-gradient(90deg, rgba(232,213,163,0.25), rgba(232,213,163,0.55) 50%, rgba(232,213,163,0.25))',
        }}
      />
      {/* Filled portion */}
      <motion.div
        aria-hidden
        className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full"
        style={{
          height: 2,
          background: 'linear-gradient(90deg, #E8D5A3 0%, #C9A84C 50%, #A07830 100%)',
          boxShadow: '0 0 6px rgba(201,168,76,0.55)',
        }}
        initial={false}
        animate={{ width: `${progress * 100}%` }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      />
      {/* Dots */}
      {Array.from({ length: total }).map((_, i) => {
        const isActive = i === current
        const isDone = i < current
        return (
          <motion.div
            key={i}
            className="relative"
            initial={false}
            animate={{
              width: isActive ? 30 : 8,
              height: 8,
              opacity: isDone ? 0.85 : 1,
            }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{
              borderRadius: 9999,
              background: isActive
                ? 'linear-gradient(90deg, #E8D5A3, #C9A84C, #A07830)'
                : isDone
                  ? '#C9A84C'
                  : 'rgba(232,213,163,0.55)',
              boxShadow: isActive
                ? '0 1px 0 rgba(255,255,255,0.55) inset, 0 0 12px rgba(201,168,76,0.55)'
                : isDone
                  ? '0 0 6px rgba(201,168,76,0.35)'
                  : 'none',
              flexShrink: 0,
              zIndex: 1,
              backgroundSize: isActive ? '200% 100%' : 'auto',
              animation: isActive ? 'shimmer 3.6s linear infinite' : undefined,
            }}
          />
        )
      })}
    </div>
  )
}
