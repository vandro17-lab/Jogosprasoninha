'use client'

import { motion } from 'framer-motion'

const HEIGHTS = [0.30, 0.60, 1.00, 0.75, 0.50, 0.90, 0.40, 0.70, 1.00, 0.60, 0.30, 0.80]
const SPEEDS  = [0.80, 0.70, 0.90, 0.75, 0.85, 0.65, 0.95, 0.72, 0.88, 0.68, 0.82, 0.78]

export default function AudioWaves({ active }: { active: boolean }) {
  return (
    <div className="flex items-center justify-center gap-[3px] h-10">
      {HEIGHTS.map((h, i) => (
        <motion.div
          key={i}
          animate={
            active
              ? { scaleY: [0.25, h, 0.25], backgroundColor: '#C9A84C' }
              : { scaleY: 0.18, backgroundColor: '#E8D5A3' }
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
                  backgroundColor: { duration: 0.3 },
                }
              : { duration: 0.4, ease: 'easeOut' }
          }
          style={{
            width: 4,
            height: 36,
            borderRadius: 9999,
            transformOrigin: 'center',
            backgroundColor: '#E8D5A3',
          }}
        />
      ))}
    </div>
  )
}
