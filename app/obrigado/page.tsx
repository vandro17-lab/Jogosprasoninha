'use client'

import { useEffect } from 'react'
import { clearSession } from '@/lib/session-store'

export default function ObrigadoPage() {
  useEffect(() => {
    setTimeout(() => clearSession(), 2000)
  }, [])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, #F0E8D8 0%, #FAF7F2 70%)' }}
      />

      <div className="relative z-10 max-w-sm w-full flex flex-col items-center gap-8 animate-fade-in text-center">
        <div className="animate-heartbeat text-6xl">🤍</div>

        <h1 className="font-playfair text-3xl text-text-dark">Prontinho 😊</h1>

        <div
          className="w-full rounded-3xl p-6"
          style={{ background: '#FFFDF9', border: '1px solid #E8D5A3' }}
        >
          <p className="text-text-dark leading-relaxed text-base">
            Sua lembrança foi guardada com carinho e fará parte dessa surpresa especial para a Sônia.
          </p>
          <p className="text-text-muted text-sm mt-4">
            Muito obrigado por participar 🤍
          </p>
        </div>

        <div className="flex gap-2 text-gold text-2xl">
          <span>✨</span>
          <span>🌸</span>
          <span>✨</span>
        </div>

        <p className="text-text-muted text-xs">
          Você pode fechar essa página agora
        </p>
      </div>
    </main>
  )
}
