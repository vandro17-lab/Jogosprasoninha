'use client'

import { motion } from 'framer-motion'

type Position = 'tl' | 'tr' | 'bl' | 'br'

interface FloralOrnamentProps {
  position: Position
  size?: number
  tone?: 'gold' | 'rose'
  opacity?: number
}

const TRANSFORMS: Record<Position, { style: React.CSSProperties; rotate: number }> = {
  tl: { style: { top: -10, left: -10 },     rotate: 0 },
  tr: { style: { top: -10, right: -10 },    rotate: 90 },
  br: { style: { bottom: -10, right: -10 }, rotate: 180 },
  bl: { style: { bottom: -10, left: -10 },  rotate: 270 },
}

export default function FloralOrnament({
  position,
  size = 56,
  tone = 'gold',
  opacity = 0.7,
}: FloralOrnamentProps) {
  const { style, rotate } = TRANSFORMS[position]
  const color = tone === 'gold' ? '#C9A84C' : '#D8A8A8'

  return (
    <motion.div
      aria-hidden
      className="absolute pointer-events-none select-none"
      style={{ ...style, width: size, height: size, color, opacity, zIndex: 2 }}
      initial={{ opacity: 0, scale: 0.7, rotate: rotate - 8 }}
      animate={{ opacity, scale: 1, rotate }}
      transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      <svg viewBox="0 0 64 64" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={0.9} strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 2 C 12 2, 22 6, 28 14" opacity="0.85" />
        <path d="M2 2 C 2 12, 6 22, 14 28" opacity="0.85" />
        <path d="M8 8 C 14 10, 20 14, 24 20" opacity="0.55" />
        <path d="M22 8 C 24 10, 25 13, 24 16 C 22 19, 19 19, 17 17 C 16 15, 17 12, 19 11 C 21 10, 23 11, 23 13" opacity="0.7" />
        <circle cx="24" cy="24" r="1.2" fill="currentColor" stroke="none" opacity="0.8" />
        <path d="M30 6 C 32 4, 35 4, 36 6 C 36 9, 33 10, 31 9" opacity="0.6" />
        <path d="M6 30 C 4 32, 4 35, 6 36 C 9 36, 10 33, 9 31" opacity="0.6" />
        <circle cx="32" cy="4" r="0.8" fill="currentColor" stroke="none" opacity="0.65" />
        <circle cx="4" cy="32" r="0.8" fill="currentColor" stroke="none" opacity="0.65" />
      </svg>
    </motion.div>
  )
}
