'use client'

import { motion } from 'framer-motion'
import { Flower2 } from 'lucide-react'

interface DecoBackgroundProps {
  variant?: 'default' | 'rose' | 'dark'
}

const floatVariants = (delay: number) => ({
  animate: {
    y: [0, -10, -5, 0],
    rotate: [0, 1.5, -0.8, 0],
    transition: { duration: 7 + delay, repeat: Infinity, ease: 'easeInOut' as const, delay },
  },
})

export default function DecoBackground({ variant = 'default' }: DecoBackgroundProps) {
  const orbs =
    variant === 'rose'
      ? [
          { top: '-8%', left: '-10%', size: 340, colors: ['#FBF0F0', '#F4E0E0'], opacity: 0.55 },
          { top: '30%', right: '-12%', size: 280, colors: ['#E8C8C8', '#FBF0F0'], opacity: 0.40 },
          { bottom: '-5%', left: '20%', size: 260, colors: ['#F7EDD8', '#F4E0E0'], opacity: 0.35 },
        ]
      : variant === 'dark'
      ? [
          { top: '-5%', left: '-8%', size: 300, colors: ['#F0E8D8', '#FAF7F2'], opacity: 0.30 },
          { bottom: '10%', right: '-10%', size: 260, colors: ['#E8D5A3', '#FAF7F2'], opacity: 0.20 },
        ]
      : [
          { top: '-10%', left: '-12%', size: 360, colors: ['#F7EDD8', '#FBF0F0'], opacity: 0.55 },
          { top: '25%', right: '-14%', size: 300, colors: ['#E8D5A3', '#F7EDD8'], opacity: 0.40 },
          { bottom: '-8%', left: '15%', size: 280, colors: ['#FBF0F0', '#F7EDD8'], opacity: 0.35 },
        ]

  const iconColor = variant === 'rose' ? '#E8C8C8' : '#E8D5A3'

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
            left: (orb as { left?: string }).left,
            right: (orb as { right?: string }).right,
            bottom: (orb as { bottom?: string }).bottom,
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle, ${orb.colors[0]} 0%, ${orb.colors[1]} 60%, transparent 100%)`,
            opacity: orb.opacity,
            filter: 'blur(40px)',
          }}
        />
      ))}

      {/* Floating Flower2 icons */}
      <motion.div
        className="absolute top-8 left-5"
        variants={floatVariants(0)}
        animate="animate"
      >
        <Flower2 size={28} color={iconColor} strokeWidth={1.2} style={{ opacity: 0.22 }} />
      </motion.div>

      <motion.div
        className="absolute top-12 right-6"
        variants={floatVariants(1.5)}
        animate="animate"
      >
        <Flower2 size={20} color={iconColor} strokeWidth={1.2} style={{ opacity: 0.18 }} />
      </motion.div>

      <motion.div
        className="absolute bottom-20 left-4"
        variants={floatVariants(2.8)}
        animate="animate"
      >
        <Flower2 size={24} color={iconColor} strokeWidth={1.2} style={{ opacity: 0.16 }} />
      </motion.div>

      <motion.div
        className="absolute bottom-16 right-5"
        variants={floatVariants(0.8)}
        animate="animate"
      >
        <Flower2 size={18} color={iconColor} strokeWidth={1.2} style={{ opacity: 0.14 }} />
      </motion.div>

      {/* SVG ornament line */}
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
    </div>
  )
}
