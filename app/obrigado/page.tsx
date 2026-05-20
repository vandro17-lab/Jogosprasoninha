'use client'

import { useEffect, useState } from 'react'
import { getSession, clearSession } from '@/lib/session-store'

export default function ObrigadoPage() {
  const [nome, setNome] = useState('')

  useEffect(() => {
    const s = getSession()
    setNome(s.nome ?? '')
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

        <h1 className="font-playfair text-3xl text-text-dark">
          {nome ? `Obrigado, ${nome} ✨` : 'Obrigado ✨'}
        </h1>

        <div
          className="w-full rounded-3xl p-6 flex flex-col gap-3"
          style={{ background: '#FFFDF9', border: '1px solid #E8D5A3' }}
        >
          <p className="text-text-dark leading-relaxed text-base">
            Sua lembrança foi guardada com carinho e fará parte dessa surpresa tão especial para a Sônia 😊
          </p>
          <p className="text-text-dark leading-relaxed text-base">
            Cada mensagem e áudio ajudam a transformar esse aniversário em uma memória inesquecível.
          </p>
          <p className="text-text-dark leading-relaxed text-base">
            No dia 4 de junho, às 20h, a Sônia receberá um link com essa homenagem cheia de amor, lembranças e pessoas importantes da vida dela 🤍
          </p>
          <p className="text-text-muted text-sm mt-1">
            Até lá, por favor… mantenha segredo 😊✨
          </p>
        </div>

        <div className="flex gap-2 text-gold text-2xl">
          <span>🌸</span>
          <span>✨</span>
          <span>🤍</span>
          <span>✨</span>
          <span>🌸</span>
        </div>

        <p className="text-text-muted text-xs">
          Você já pode fechar esta página 😊
        </p>
      </div>
    </main>
  )
}
