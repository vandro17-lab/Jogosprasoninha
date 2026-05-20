'use client'

import Image from 'next/image'

interface PolaroidPhotoProps {
  src: string
  alt?: string
  rotate?: number
  onRemove?: () => void
}

export default function PolaroidPhoto({ src, alt = 'foto', rotate = 0, onRemove }: PolaroidPhotoProps) {
  return (
    <div
      className="relative inline-block bg-white p-2 pb-8 shadow-md"
      style={{ transform: `rotate(${rotate}deg)` }}
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
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-400 text-white rounded-full text-xs flex items-center justify-center shadow hover:bg-red-500"
          aria-label="Remover foto"
        >
          ×
        </button>
      )}
    </div>
  )
}
