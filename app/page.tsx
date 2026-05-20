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

        {/* Badge de aniversário */}
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
          style={{ background: 'linear-gradient(135deg, #C9A84C22 0%, #E8D5A344 100%)', border: '1px solid #C9A84C55', color: '#A07830' }}
        >
          <span>🎂</span>
          <span>59 anos da Sônia ✨</span>
          <span>🎂</span>
        </div>

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
          <p className="font-playfair text-2xl text-text-dark leading-snug">
            Uma surpresa feita com carinho
          </p>
          <p className="text-text-muted text-sm mt-1">para a Sônia 🌸</p>
        </div>

        {/* Texto principal */}
        <div
          className="w-full rounded-2xl p-6"
          style={{ background: 'rgba(255,253,249,0.85)', backdropFilter: 'blur(8px)', border: '1px solid #E8D5A3' }}
        >
          <p className="text-text-dark leading-relaxed text-base">
            Oi 😊
          </p>
          <p className="text-text-dark leading-relaxed text-base mt-3">
            Estamos preparando algo muito especial para celebrar a vida da <strong>Soninha</strong>.
          </p>
          <p className="text-text-dark leading-relaxed text-base mt-3">
            Este ano talvez não consigamos reunir todo mundo em uma festa… Mas não queríamos deixar essa data passar sem carinho 🤍
          </p>
          <p className="text-text-dark leading-relaxed text-base mt-3">
            Então tivemos uma ideia: criar um <strong>mural de lembranças</strong> com fotos, mensagens e áudios das pessoas que fazem parte da vida dela.
          </p>
          <p className="text-text-dark leading-relaxed text-base mt-3">
            Um espaço para guardar momentos, histórias e pequenos pedaços de amor que marcaram sua história ✨
          </p>
          <p className="text-text-dark leading-relaxed text-base mt-3">
            E seria muito especial ter você com a gente nisso.
          </p>

          <div className="mt-4 pt-4" style={{ borderTop: '1px solid #E8D5A3' }}>
            <p className="text-text-muted text-sm font-medium mb-2">Nos próximos passos, você poderá:</p>
            <ul className="flex flex-col gap-2">
              <li className="flex items-start gap-2 text-sm text-text-dark">
                <span className="text-gold mt-0.5">🎙️</span>
                <span>compartilhar uma lembrança da Sônia</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-text-dark">
                <span className="text-gold mt-0.5">📷</span>
                <span>enviar fotos antigas ou recentes</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-text-dark">
                <span className="text-gold mt-0.5">🎵</span>
                <span>gravar um áudio para ela ouvir no aniversário</span>
              </li>
            </ul>
          </div>

          <div className="mt-4 pt-4" style={{ borderTop: '1px solid #E8D5A3' }}>
            <p className="text-text-dark text-sm">
              Pode falar do seu jeito, sem preocupação 😊<br />
              Nós vamos organizar tudo com carinho para você.
            </p>
          </div>
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
          Participar dessa surpresa 🤍
        </Link>

        <p className="text-text-muted text-xs text-center">
          Suas lembranças serão guardadas com muito carinho ✨
        </p>

        <div
          className="w-full rounded-2xl px-5 py-3 flex items-center gap-3"
          style={{ background: '#FFF8E7', border: '1px dashed #C9A84C' }}
        >
          <span className="text-xl shrink-0">🤫</span>
          <p className="text-xs text-text-muted leading-relaxed">
            <strong className="text-text-dark">É surpresa!</strong> Se puder, não comente nada com a Sônia antes do aniversário 😊
          </p>
        </div>
      </div>
    </main>
  )
}
