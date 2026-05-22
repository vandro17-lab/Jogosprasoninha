'use client'

import { motion } from 'framer-motion'

const HEIGHTS = [0.30, 0.60, 1.00, 0.75, 0.50, 0.90, 0.40, 0.70, 1.00, 0.60, 0.30, 0.80]
const SPEEDS  = [0.80, 0.70, 0.90, 0.75, 0.85, 0.65, 0.95, 0.72, 0.88, 0.68, 0.82, 0.78]

export default function AudioWaves({ active }: { active: boolean }) {
  return (
    <div
      className="flex items-center justify-center gap-[3px] px-5 py-3 rounded-full"
      style={{
        background: active
          ? 'linear-gradient(180deg, rgba(255,253,249,0.72), rgba(247,237,216,0.55))'
          : 'linear-gradient(180deg, rgba(255,253,249,0.55), rgba(240,232,216,0.40))',
        border: '1px solid rgba(232,213,163,0.45)',
        boxShadow: active
          ? '0 1px 0 rgba(255,255,255,0.6) inset, 0 0 16px rgba(201,168,76,0.28), 0 6px 18px -6px rgba(201,168,76,0.22)'
          : '0 1px 0 rgba(255,255,255,0.5) inset, 0 1px 2px rgba(61,50,40,0.04)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        transition: 'box-shadow 0.4s ease, background 0.4s ease',
      }}
    >
      {HEIGHTS.map((h, i) => (
        <motion.div
          key={i}
          animate={
            active
              ? { scaleY: [0.25, h, 0.25] }
              : { scaleY: 0.18 }
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
                }
              : { duration: 0.4, ease: 'easeOut' }
          }
          style={{
            width: 4,
            height: 36,
            borderRadius: 9999,
            transformOrigin: 'center',
            background: active
              ? 'linear-gradient(180deg, #F0DBA0 0%, #C9A84C 60%, #A07830 100%)'
              : 'linear-gradient(180deg, #E8D5A3 0%, #D8C088 100%)',
            boxShadow: active ? '0 0 4px rgba(201,168,76,0.55)' : 'none',
            transition: 'background 0.3s ease',
          }}
        />
      ))}
    </div>
  )
}
