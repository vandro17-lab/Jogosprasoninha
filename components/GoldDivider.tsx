'use client'

import { motion } from 'framer-motion'

interface GoldDividerProps {
  label?: string
  tone?: 'gold' | 'rose'
  className?: string
}

export default function GoldDivider({ label, tone = 'gold', className = '' }: GoldDividerProps) {
  const color = tone === 'gold' ? '#C9A84C' : '#D8A8A8'

  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 0, scaleX: 0.6 }}
      whileInView={{ opacity: 1, scaleX: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className={`flex items-center justify-center gap-3 w-full ${className}`}
      style={{ color }}
    >
      <span
        aria-hidden
        className="flex-1 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${color}66 50%, transparent)` }}
      />
      <span className="flex items-center gap-2 shrink-0">
        <svg width="36" height="14" viewBox="0 0 36 14" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round">
          <path d="M0 7 L 8 7" opacity="0.7" />
          <path d="M 8 7 L 18 1 L 28 7 L 18 13 Z" opacity="0.95" />
          <circle cx="18" cy="7" r="1.6" fill="currentColor" stroke="none" />
          <path d="M 28 7 L 36 7" opacity="0.7" />
        </svg>
        {label && (
          <span className="tracking-luxe" style={{ color }}>
            {label}
          </span>
        )}
        <svg width="36" height="14" viewBox="0 0 36 14" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round">
          <path d="M0 7 L 8 7" opacity="0.7" />
          <path d="M 8 7 L 18 1 L 28 7 L 18 13 Z" opacity="0.95" />
          <circle cx="18" cy="7" r="1.6" fill="currentColor" stroke="none" />
          <path d="M 28 7 L 36 7" opacity="0.7" />
        </svg>
      </span>
      <span
        aria-hidden
        className="flex-1 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${color}66 50%, transparent)` }}
      />
    </motion.div>
  )
}
