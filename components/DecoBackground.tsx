'use client'

import { motion } from 'framer-motion'
import { Flower2 } from 'lucide-react'

type Variant = 'default' | 'rose' | 'dark' | 'ornate' | 'sparkle'

interface DecoBackgroundProps {
  variant?: Variant
}

const floatVariants = (delay: number) => ({
  animate: {
    y: [0, -10, -5, 0],
    rotate: [0, 1.5, -0.8, 0],
    transition: { duration: 7 + delay, repeat: Infinity, ease: 'easeInOut' as const, delay },
  },
})

type Orb = {
  size: number
  colors: [string, string]
  opacity: number
  top?: string
  left?: string
  right?: string
  bottom?: string
}

const ORBS: Record<Variant, Orb[]> = {
  default: [
    { top: '-10%', left: '-12%', size: 360, colors: ['#F7EDD8', '#FBF0F0'], opacity: 0.55 },
    { top: '25%', right: '-14%', size: 300, colors: ['#E8D5A3', '#F7EDD8'], opacity: 0.40 },
    { bottom: '-8%', left: '15%', size: 280, colors: ['#FBF0F0', '#F7EDD8'], opacity: 0.35 },
  ],
  rose: [
    { top: '-8%', left: '-10%', size: 340, colors: ['#FBF0F0', '#F4E0E0'], opacity: 0.55 },
    { top: '30%', right: '-12%', size: 280, colors: ['#E8C8C8', '#FBF0F0'], opacity: 0.40 },
    { bottom: '-5%', left: '20%', size: 260, colors: ['#F7EDD8', '#F4E0E0'], opacity: 0.35 },
  ],
  dark: [
    { top: '-5%', left: '-8%', size: 300, colors: ['#F0E8D8', '#FAF7F2'], opacity: 0.30 },
    { bottom: '10%', right: '-10%', size: 260, colors: ['#E8D5A3', '#FAF7F2'], opacity: 0.20 },
  ],
  ornate: [
    { top: '-12%', left: '-15%', size: 420, colors: ['#F7EDD8', '#FBF0F0'], opacity: 0.60 },
    { top: '20%', right: '-18%', size: 360, colors: ['#E8D5A3', '#F4E0E0'], opacity: 0.45 },
    { bottom: '-12%', right: '-10%', size: 320, colors: ['#FBF0F0', '#F7EDD8'], opacity: 0.38 },
    { bottom: '10%', left: '-12%', size: 260, colors: ['#F4E0E0', '#F7EDD8'], opacity: 0.32 },
  ],
  sparkle: [
    { top: '-10%', left: '-15%', size: 380, colors: ['#FBF0F0', '#F4E0E0'], opacity: 0.55 },
    { top: '35%', right: '-15%', size: 320, colors: ['#E8C8C8', '#F7EDD8'], opacity: 0.42 },
    { bottom: '-8%', left: '20%', size: 300, colors: ['#F7EDD8', '#F4E0E0'], opacity: 0.40 },
  ],
}

function SparkleLayer({ count = 9, tone = '#C9A84C' }: { count?: number; tone?: string }) {
  const points = Array.from({ length: count }).map((_, i) => {
    const seed = i + 1
    return {
      top: `${(seed * 53) % 90 + 4}%`,
      left: `${(seed * 71) % 92 + 3}%`,
      size: 10 + ((seed * 37) % 9),
      delay: (seed * 0.31) % 3.2,
      duration: 2.6 + (seed * 0.19) % 1.8,
    }
  })
  return (
    <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
      {points.map((p, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ top: p.top, left: p.left, color: tone, width: p.size, height: p.size }}
          animate={{ opacity: [0, 0.85, 0], scale: [0.6, 1.1, 0.7], rotate: [0, 90] }}
          transition={{ duration: p.duration, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width={p.size} height={p.size}>
            <path d="M12 1 L13.4 9.2 L22 12 L13.4 14.8 L12 23 L10.6 14.8 L2 12 L10.6 9.2 Z" opacity="0.95"/>
          </svg>
        </motion.div>
      ))}
    </div>
  )
}

export default function DecoBackground({ variant = 'default' }: DecoBackgroundProps) {
  const orbs = ORBS[variant]
  const iconColor = variant === 'rose' || variant === 'sparkle' ? '#E8C8C8' : '#E8D5A3'
  const petalColor = variant === 'rose' || variant === 'sparkle' ? '#D8A8A8' : '#C9A84C'

  return (
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none overflow-hidden select-none"
      style={{ zIndex: 0 }}
    >
      {/* Gradient orbs */}
      {orbs.map((orb, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            top: orb.top,
            left: orb.left,
            right: orb.right,
            bottom: orb.bottom,
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle, ${orb.colors[0]} 0%, ${orb.colors[1]} 60%, transparent 100%)`,
            opacity: orb.opacity,
            filter: 'blur(44px)',
          }}
        />
      ))}

      {/* Floating Flower2 icons (reduced to 2) */}
      <motion.div
        className="absolute top-8 left-5"
        variants={floatVariants(0)}
        animate="animate"
      >
        <Flower2 size={26} color={iconColor} strokeWidth={1.2} style={{ opacity: 0.22 }} />
      </motion.div>

      <motion.div
        className="absolute bottom-20 right-5"
        variants={floatVariants(2.2)}
        animate="animate"
      >
        <Flower2 size={20} color={iconColor} strokeWidth={1.2} style={{ opacity: 0.16 }} />
      </motion.div>

      {/* Drifting petal clusters in opposite corners */}
      <div
        className="absolute -top-4 -right-6 animate-drift"
        style={{ color: petalColor, opacity: 0.32, width: 130, height: 130 }}
      >
        <svg viewBox="0 0 120 120" width="130" height="130" fill="none" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round">
          <g transform="translate(48 48)">
            <ellipse cx="0" cy="-10" rx="6" ry="10" opacity="0.7"/>
            <ellipse cx="9.5" cy="-3" rx="6" ry="10" transform="rotate(72 9.5 -3)" opacity="0.7"/>
            <ellipse cx="6" cy="8.5" rx="6" ry="10" transform="rotate(144 6 8.5)" opacity="0.7"/>
            <ellipse cx="-6" cy="8.5" rx="6" ry="10" transform="rotate(216 -6 8.5)" opacity="0.7"/>
            <ellipse cx="-9.5" cy="-3" rx="6" ry="10" transform="rotate(288 -9.5 -3)" opacity="0.7"/>
            <circle cx="0" cy="0" r="3" fill="currentColor" stroke="none" opacity="0.85"/>
          </g>
        </svg>
      </div>

      <div
        className="absolute -bottom-4 -left-6 animate-drift"
        style={{ color: petalColor, opacity: 0.28, width: 120, height: 120, animationDelay: '-6s' }}
      >
        <svg viewBox="0 0 120 120" width="120" height="120" fill="none" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round">
          <g transform="translate(72 72) rotate(180)">
            <ellipse cx="0" cy="-10" rx="6" ry="10" opacity="0.7"/>
            <ellipse cx="9.5" cy="-3" rx="6" ry="10" transform="rotate(72 9.5 -3)" opacity="0.7"/>
            <ellipse cx="6" cy="8.5" rx="6" ry="10" transform="rotate(144 6 8.5)" opacity="0.7"/>
            <ellipse cx="-6" cy="8.5" rx="6" ry="10" transform="rotate(216 -6 8.5)" opacity="0.7"/>
            <ellipse cx="-9.5" cy="-3" rx="6" ry="10" transform="rotate(288 -9.5 -3)" opacity="0.7"/>
            <circle cx="0" cy="0" r="3" fill="currentColor" stroke="none" opacity="0.85"/>
          </g>
        </svg>
      </div>

      {/* SVG ornament curves */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 390 844"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M 0 200 Q 195 160 390 200"
          stroke={iconColor}
          strokeWidth="0.5"
          opacity="0.25"
        />
        <path
          d="M 0 644 Q 195 684 390 644"
          stroke={iconColor}
          strokeWidth="0.5"
          opacity="0.20"
        />
      </svg>

      {/* Sparkle layer (only on ornate/sparkle variants) */}
      {(variant === 'sparkle' || variant === 'ornate') && (
        <SparkleLayer count={variant === 'sparkle' ? 11 : 6} tone={iconColor} />
      )}

      {/* Paper texture overlay */}
      <div className="absolute inset-0 texture-paper" />

      {/* Vignette */}
      <div className="absolute inset-0 vignette" />
    </div>
  )
}
