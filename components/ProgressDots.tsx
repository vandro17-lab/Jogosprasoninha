'use client'

interface ProgressDotsProps {
  total: number
  current: number
}

export default function ProgressDots({ total, current }: ProgressDotsProps) {
  return (
    <div className="flex items-center gap-2 justify-center">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`rounded-full transition-all duration-300 ${
            i < current
              ? 'w-2 h-2 bg-gold'
              : i === current
              ? 'w-3 h-3 bg-gold'
              : 'w-2 h-2 bg-gold-light'
          }`}
        />
      ))}
    </div>
  )
}
