'use client'

export default function AudioWaves({ active }: { active: boolean }) {
  const bars = [0.3, 0.6, 1, 0.8, 0.5, 0.9, 0.4, 0.7, 1, 0.6, 0.3, 0.8]

  return (
    <div className="flex items-center justify-center gap-[3px] h-10">
      {bars.map((height, i) => (
        <div
          key={i}
          className="w-1 rounded-full transition-all duration-300"
          style={{
            backgroundColor: active ? '#C9A84C' : '#E8D5A3',
            height: active ? `${height * 36}px` : '6px',
            animation: active
              ? `wave ${0.8 + i * 0.1}s ease-in-out infinite alternate`
              : 'none',
            animationDelay: `${i * 0.07}s`,
          }}
        />
      ))}
    </div>
  )
}
