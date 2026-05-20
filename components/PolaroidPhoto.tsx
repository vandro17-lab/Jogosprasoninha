'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'

interface PolaroidPhotoProps {
  src: string
  alt?: string
  rotate?: number
  onRemove?: () => void
  tape?: boolean
}

export default function PolaroidPhoto({
  src,
  alt = 'foto',
  rotate = 0,
  onRemove,
  tape = true,
}: PolaroidPhotoProps) {
  return (
    <motion.div
      className="relative inline-block p-2 pb-10"
      style={{
        rotate,
        background: 'linear-gradient(180deg, #FFFFFF 0%, #FBF8F0 100%)',
        boxShadow: [
          '0 1px 0 rgba(255,255,255,0.9) inset',
          '0 1px 2px rgba(61,50,40,0.06)',
          '0 6px 16px -4px rgba(61,50,40,0.12)',
          '0 18px 36px -10px rgba(61,50,40,0.18)',
        ].join(', '),
        borderRadius: 2,
      }}
      whileHover={{
        scale: 1.07,
        rotate: 0,
        boxShadow: [
          '0 1px 0 rgba(255,255,255,0.95) inset',
          '0 2px 4px rgba(61,50,40,0.08)',
          '0 12px 28px -6px rgba(61,50,40,0.18)',
          '0 28px 50px -12px rgba(61,50,40,0.25)',
        ].join(', '),
      }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
    >
      {/* Decorative tape (top-left and top-right) */}
      {tape && (
        <>
          <div
            aria-hidden
            className="absolute"
            style={{
              top: -8,
              left: 12,
              width: 36,
              height: 16,
              background: 'linear-gradient(180deg, rgba(232,213,163,0.65), rgba(201,168,76,0.45))',
              transform: 'rotate(-8deg)',
              boxShadow: '0 1px 2px rgba(61,50,40,0.10)',
              borderRadius: 1,
            }}
          />
          <div
            aria-hidden
            className="absolute"
            style={{
              top: -8,
              right: 12,
              width: 36,
              height: 16,
              background: 'linear-gradient(180deg, rgba(232,213,163,0.65), rgba(201,168,76,0.45))',
              transform: 'rotate(7deg)',
              boxShadow: '0 1px 2px rgba(61,50,40,0.10)',
              borderRadius: 1,
            }}
          />
        </>
      )}

      <div className="relative w-36 h-36 overflow-hidden">
        <Image
          src={src}
          alt={alt}
          width={144}
          height={144}
          className="w-full h-full object-cover"
        />
        {/* Subtle paper grain over the image for film feel */}
        <div className="absolute inset-0 texture-grain" />
        {/* Soft inner vignette */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{ boxShadow: 'inset 0 0 18px rgba(61,50,40,0.18)' }}
        />
      </div>

      {onRemove && (
        <motion.button
          onClick={onRemove}
          whileHover={{ scale: 1.18 }}
          whileTap={{ scale: 0.88 }}
          className="absolute -top-2.5 -right-2.5 w-7 h-7 text-white rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #D85A5A, #B23A3A)',
            boxShadow: '0 1px 0 rgba(255,255,255,0.35) inset, 0 4px 10px rgba(200,76,76,0.45)',
          }}
          aria-label="Remover foto"
        >
          <X size={13} strokeWidth={2.5} />
        </motion.button>
      )}
    </motion.div>
  )
}
