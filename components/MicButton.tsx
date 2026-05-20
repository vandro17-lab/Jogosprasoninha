'use client'

interface MicButtonProps {
  recording: boolean
  onClick: () => void
  disabled?: boolean
}

export default function MicButton({ recording, onClick, disabled }: MicButtonProps) {
  return (
    <div className="relative flex items-center justify-center">
      {recording && (
        <>
          <div className="absolute w-32 h-32 rounded-full bg-gold/20 animate-pulse-ring" />
          <div className="absolute w-24 h-24 rounded-full bg-gold/15 animate-pulse-ring" style={{ animationDelay: '0.4s' }} />
        </>
      )}
      <button
        onClick={onClick}
        disabled={disabled}
        className={`
          relative z-10 w-20 h-20 rounded-full flex items-center justify-center
          transition-all duration-300 shadow-lg active:scale-95
          ${recording
            ? 'bg-red-400 hover:bg-red-500 shadow-red-200'
            : 'bg-gold hover:bg-gold-dark shadow-gold/30'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        aria-label={recording ? 'Parar gravação' : 'Iniciar gravação'}
      >
        {recording ? (
          <div className="w-7 h-7 rounded bg-white" />
        ) : (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
          </svg>
        )}
      </button>
    </div>
  )
}
