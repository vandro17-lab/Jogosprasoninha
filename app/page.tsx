'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

export default function Home() {
  const [imgError, setImgError] = useState(false)
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Fundo suave */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at top, #F0E8D8 0%, #FAF7F2 60%)',
        }}
      />

      <div className="relative z-10 max-w-sm w-full flex flex-col items-center gap-8 animate-fade-in">
        {/* Foto da Sônia */}
        <div className="relative">
          <div
            className="w-40 h-40 rounded-full overflow-hidden shadow-xl border-4 border-white flex items-center justify-center"
            style={{ boxShadow: '0 8px 32px rgba(201,168,76,0.25)', background: '#F0E8D8' }}
          >
            {!imgError ? (
              <Image
                src="/sonia.jpg"
                alt="Foto da Sônia"
                width={160}
                height={160}
                className="w-full h-full object-cover"
                priority
                onError={() => setImgError(true)}
              />
            ) : (
              <span className="font-playfair text-5xl text-gold">S</span>
            )}
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gold rounded-full flex items-center justify-center shadow">
            <span className="text-white text-sm">🤍</span>
          </div>
        </div>

        {/* Título */}
        <div className="text-center">
          <p className="font-playfair text-xl text-text-dark leading-relaxed mb-1">
            Uma surpresa especial
          </p>
          <p className="text-text-muted text-sm">para a Sônia</p>
        </div>

        {/* Texto principal */}
        <div
          className="w-full rounded-2xl p-6 text-center"
          style={{ background: 'rgba(255,253,249,0.85)', backdropFilter: 'blur(8px)', border: '1px solid #E8D5A3' }}
        >
          <p className="text-text-dark leading-relaxed text-base">
            Estamos preparando uma surpresa muito especial para a Sônia 😊
          </p>
          <p className="text-text-dark leading-relaxed text-base mt-3">
            Queremos guardar lembranças, histórias e momentos importantes de pessoas que fizeram parte da vida dela.
          </p>
          <p className="text-text-muted text-sm mt-4">
            Vai ser rapidinho.
          </p>
          <p className="text-text-dark leading-relaxed text-base mt-2">
            Você só precisa falar do seu jeito. Depois o sistema organiza tudo para você.
          </p>
        </div>

        {/* Botão */}
        <Link
          href="/identificacao"
          className="w-full py-4 rounded-2xl text-center font-medium text-white text-lg transition-all duration-200 active:scale-98 shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #C9A84C 0%, #A07830 100%)',
            boxShadow: '0 4px 20px rgba(201,168,76,0.35)',
          }}
        >
          Começar
        </Link>

        <p className="text-text-muted text-xs text-center">
          Suas lembranças ficarão guardadas com muito carinho 🤍
        </p>
      </div>
    </main>
  )
}
