'use client'

import { motion } from 'framer-motion'

interface ProgressDotsProps {
  total: number
  current: number
}

export default function ProgressDots({ total, current }: ProgressDotsProps) {
  return (
    <div className="flex items-center gap-1.5 justify-center">
      {Array.from({ length: total }).map((_, i) => {
        const isActive = i === current
        const isDone = i < current
        return (
          <motion.div
            key={i}
            animate={{ width: isActive ? 28 : 8, opacity: isDone ? 0.6 : 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{
              height: 4,
              borderRadius: 9999,
              background: isDone || isActive ? '#C9A84C' : '#E8D5A3',
              flexShrink: 0,
            }}
          />
        )
      })}
    </div>
  )
}
