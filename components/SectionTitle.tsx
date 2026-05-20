'use client'

import { motion } from 'framer-motion'

interface SectionTitleProps {
  eyebrow?: string
  title: string
  subtitle?: string
  align?: 'center' | 'left'
  className?: string
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

export default function SectionTitle({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  className = '',
}: SectionTitleProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={`flex flex-col gap-2 ${align === 'center' ? 'items-center text-center' : 'items-start text-left'} ${className}`}
    >
      {eyebrow && (
        <motion.span variants={itemVariants} className="tracking-luxe text-gold-dark flex items-center gap-2">
          <span aria-hidden className="inline-block w-6 h-px" style={{ background: 'linear-gradient(90deg, transparent, #C9A84C)' }} />
          {eyebrow}
          <span aria-hidden className="inline-block w-6 h-px" style={{ background: 'linear-gradient(90deg, #C9A84C, transparent)' }} />
        </motion.span>
      )}
      <motion.h1
        variants={itemVariants}
        className="heading-display text-2xl sm:text-[1.65rem] text-text-dark"
      >
        {title}
      </motion.h1>
      {subtitle && (
        <motion.p
          variants={itemVariants}
          className="font-playfair text-lg text-gradient-gold"
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  )
}
