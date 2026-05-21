'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

const COLLAPSE_OVER = 320

export default function ExpandableMessage({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false)
  const long = text.length > COLLAPSE_OVER

  return (
    <div className="relative">
      <span
        aria-hidden
        className="font-playfair text-text-dark/15 select-none leading-none block"
        style={{ fontSize: '3.4rem', marginBottom: '-1.6rem' }}
      >
        &ldquo;
      </span>

      <div className="relative">
        <p
          className="font-playfair text-text-dark whitespace-pre-wrap"
          style={{
            fontSize: '17px',
            lineHeight: 1.85,
            ...(long && !expanded
              ? {
                  display: '-webkit-box',
                  WebkitLineClamp: 7,
                  WebkitBoxOrient: 'vertical' as const,
                  overflow: 'hidden',
                }
              : {}),
          }}
        >
          {text}
        </p>

        {long && !expanded && (
          <div
            aria-hidden
            className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
            style={{ background: 'linear-gradient(180deg, transparent, rgba(255,253,249,0.96))' }}
          />
        )}
      </div>

      {long && (
        <motion.button
          onClick={() => setExpanded((v) => !v)}
          whileTap={{ scale: 0.96 }}
          className="mt-3 text-sm font-medium text-gold-dark focus-ring rounded-md inline-flex items-center gap-1"
        >
          {expanded ? 'Ler menos' : 'Ler mais'}
          <span aria-hidden className="text-xs">{expanded ? '↑' : '↓'}</span>
        </motion.button>
      )}
    </div>
  )
}
