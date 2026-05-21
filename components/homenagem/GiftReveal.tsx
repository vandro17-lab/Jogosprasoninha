'use client'

import { motion } from 'framer-motion'

const easeLuxe = [0.22, 1, 0.36, 1] as const

function GiftIcon({ size = 132 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" aria-hidden>
      <defs>
        <linearGradient id="giftBox" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFDF9" />
          <stop offset="55%" stopColor="#F7EDD8" />
          <stop offset="100%" stopColor="#EBDDB8" />
        </linearGradient>
        <linearGradient id="giftLid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F4E8CF" />
        </linearGradient>
        <linearGradient id="giftRibbon" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F0DBA0" />
          <stop offset="50%" stopColor="#C9A84C" />
          <stop offset="100%" stopColor="#9C7228" />
        </linearGradient>
        <radialGradient id="giftSheen" cx="35%" cy="25%" r="80%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
          <stop offset="40%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        <filter id="giftShadow" x="-40%" y="-20%" width="180%" height="160%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#A07830" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* ground shadow */}
      <ellipse cx="60" cy="110" rx="34" ry="6" fill="#A07830" opacity="0.18" />

      <g filter="url(#giftShadow)">
        {/* box body */}
        <rect x="24" y="54" width="72" height="50" rx="7" fill="url(#giftBox)" stroke="#D9C48A" strokeWidth="1" />
        {/* horizontal ribbon */}
        <rect x="24" y="70" width="72" height="13" fill="url(#giftRibbon)" opacity="0.95" />
        {/* lid */}
        <rect x="17" y="42" width="86" height="18" rx="6" fill="url(#giftLid)" stroke="#D9C48A" strokeWidth="1" />
        {/* vertical ribbon */}
        <rect x="53" y="42" width="14" height="62" fill="url(#giftRibbon)" opacity="0.95" />
        {/* bow */}
        <g>
          <path d="M60 42 C 50 30, 30 30, 36 40 C 40 47, 54 44, 60 42 Z" fill="url(#giftRibbon)" stroke="#9C7228" strokeWidth="0.6" />
          <path d="M60 42 C 70 30, 90 30, 84 40 C 80 47, 66 44, 60 42 Z" fill="url(#giftRibbon)" stroke="#9C7228" strokeWidth="0.6" />
          <circle cx="60" cy="42" r="5.5" fill="url(#giftRibbon)" stroke="#9C7228" strokeWidth="0.6" />
          <circle cx="58.5" cy="40.5" r="1.6" fill="#FFF7E2" opacity="0.9" />
        </g>
        {/* top sheen */}
        <rect x="17" y="42" width="86" height="18" rx="6" fill="url(#giftSheen)" />
      </g>
    </svg>
  )
}

const SPARKLES = [
  { x: '6%', y: '18%', s: 11, d: 0.2 },
  { x: '88%', y: '24%', s: 14, d: 0.9 },
  { x: '14%', y: '70%', s: 9, d: 1.4 },
  { x: '82%', y: '66%', s: 12, d: 0.5 },
]

export default function GiftReveal({ onOpen }: { onOpen: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26, scale: 0.82 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1, ease: easeLuxe }}
      className="flex flex-col items-center gap-5"
    >
      <motion.button
        onClick={onOpen}
        aria-label="Abrir o presente e ver as homenagens"
        className="relative focus-ring rounded-full"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.93 }}
        transition={{ type: 'spring', stiffness: 300, damping: 18 }}
      >
        {/* pulsing glow */}
        <motion.span
          aria-hidden
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: 200,
            height: 200,
            background: 'radial-gradient(circle, rgba(232,213,163,0.55), rgba(201,168,76,0.18) 45%, transparent 70%)',
          }}
          animate={{ opacity: [0.45, 0.85, 0.45], scale: [0.92, 1.08, 0.92] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* expanding invitation ring */}
        <motion.span
          aria-hidden
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ width: 150, height: 150, border: '1.5px solid rgba(201,168,76,0.45)' }}
          animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
        />

        {/* sway wrapper */}
        <motion.span
          className="relative block"
          style={{ transformOrigin: '50% 18%' }}
          animate={{ rotate: [-3.5, 3.5, -3.5], y: [0, -4, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <GiftIcon />
        </motion.span>

        {/* sparkles */}
        {SPARKLES.map((sp, i) => (
          <motion.span
            key={i}
            aria-hidden
            className="absolute"
            style={{ left: sp.x, top: sp.y, color: '#E8D5A3', width: sp.s, height: sp.s }}
            animate={{ opacity: [0, 0.95, 0], scale: [0.5, 1.1, 0.6], rotate: [0, 90] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: sp.d }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width={sp.s} height={sp.s}>
              <path d="M12 1 L13.4 9.2 L22 12 L13.4 14.8 L12 23 L10.6 14.8 L2 12 L10.6 9.2 Z" />
            </svg>
          </motion.span>
        ))}
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: easeLuxe, delay: 0.5 }}
        className="flex flex-col items-center gap-1.5 text-center px-6"
      >
        <p className="font-playfair text-lg sm:text-xl text-text-dark">
          Sua surpresa está pronta.
        </p>
        <p className="text-sm text-text-muted leading-relaxed max-w-xs">
          <span className="text-gradient-gold font-medium">Clique no presente</span> e descubra as
          homenagens preparadas para você. 🤍
        </p>
      </motion.div>
    </motion.div>
  )
}
