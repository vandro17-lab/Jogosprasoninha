'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'

interface PolaroidPhotoProps {
  src: string
  alt?: string
  rotate?: number
  onRemove?: () => void
}

export default function PolaroidPhoto({ src, alt = 'foto', rotate = 0, onRemove }: PolaroidPhotoProps) {
  return (
    <motion.div
      className="relative inline-block bg-white p-2 pb-8"
      style={{
        rotate,
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
      }}
      whileHover={{
        scale: 1.08,
        rotate: 0,
        boxShadow: '0 8px 28px rgba(0,0,0,0.18)',
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className="w-36 h-36 overflow-hidden">
        <Image
          src={src}
          alt={alt}
          width={144}
          height={144}
          className="w-full h-full object-cover"
        />
      </div>
      {onRemove && (
        <motion.button
          onClick={onRemove}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-400 text-white rounded-full flex items-center justify-center shadow"
          aria-label="Remover foto"
        >
          <X size={12} />
        </motion.button>
      )}
    </motion.div>
  )
}
