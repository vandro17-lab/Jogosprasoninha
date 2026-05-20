'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

export default function Home() {
  const [imgError, setImgError] = useState(false)

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Fundo suave com confetes fixos */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at top, #F0E8D8 0%, #FAF7F2 65%)' }}
      />

      {/* Decorações de fundo */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none" aria-hidden>
        <span className="absolute top-8 left-6 text-3xl opacity-20" style={{ transform: 'rotate(-15deg)' }}>🌸</span>
        <span className="absolute top-16 right-8 text-2xl opacity-20" style={{ transform: 'rotate(12deg)' }}>✨</span>
        <span className="absolute top-32 left-12 text-xl opacity-15">🎀</span>
        <span className="absolute bottom-24 left-8 text-2xl opacity-20" style={{ transform: 'rotate(-8deg)' }}>🌸</span>
        <span className="absolute bottom-16 right-10 text-3xl opacity-20" style={{ transform: 'rotate(20deg)' }}>✨</span>
        <span className="absolute top-1/2 right-4 text-xl opacity-15">🎂</span>
      </div>

      <div className="relative z-10 max-w-sm w-full flex flex-col items-center gap-7 animate-fade-in">

        {/* Badge de aniversário */}
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
          style={{ background: 'linear-gradient(135deg, #C9A84C22 0%, #E8D5A344 100%)', border: '1px solid #C9A84C55', color: '#A07830' }}
        >
          <span>🎂</span>
          <span>59 anos da Sônia</span>
          <span>🎂</span>
        </div>

        {/* Foto da Sônia */}
        <div className="relative">
          {/* Anel dourado decorativo externo */}
          <div
            className="absolute -inset-2 rounded-full opacity-40"
            style={{ background: 'conic-gradient(from 0deg, #C9A84C, #E8D5A3, #C9A84C, #A07830, #C9A84C)' }}
          />
          <div
            className="relative w-44 h-44 rounded-full overflow-hidden shadow-xl border-4 border-white flex items-center justify-center"
            style={{ boxShadow: '0 8px 32px rgba(201,168,76,0.3)', background: '#F0E8D8' }}
          >
            {!imgError ? (
              <Image
                src="/sonia.jpg"
                alt="Foto da Sônia"
                width={176}
                height={176}
                className="w-full h-full object-cover object-top"
                priority
                onError={() => setImgError(true)}
              />
            ) : (
              <span className="font-playfair text-5xl text-gold">S</span>
            )}
          </div>
          <div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium text-white shadow-md whitespace-nowrap"
            style={{ background: 'linear-gradient(135deg, #C9A84C 0%, #A07830 100%)' }}
          >
            🥳 Feliz Aniversário!
          </div>
        </div>

        {/* Título */}
        <div className="text-center mt-2">
          <p className="font-playfair text-2xl text-text-dark leading-snug">
            Uma surpresa especial
          </p>
          <p className="text-gold font-playfair text-lg mt-1">para a Sônia 🌸</p>
        </div>

        {/* Texto principal */}
        <div
          className="w-full rounded-3xl p-6"
          style={{ background: 'rgba(255,253,249,0.9)', backdropFilter: 'blur(8px)', border: '1px solid #E8D5A3', boxShadow: '0 4px 24px rgba(201,168,76,0.08)' }}
        >
          <p className="text-text-dark leading-relaxed text-base">
            Oi 😊
          </p>
          <p className="text-text-dark leading-relaxed text-base mt-3">
            Estamos preparando uma surpresa muito especial para a <strong>Soninha</strong>.
          </p>
          <p className="text-text-dark leading-relaxed text-base mt-3">
            Infelizmente não conseguiremos fazer uma festa 😔<br />
            Mas não queríamos deixar essa data passar em branco.
          </p>
          <p className="text-text-dark leading-relaxed text-base mt-3">
            Então tivemos uma ideia muito especial: criar um <strong>mural virtual</strong> cheio de lembranças, fotos, mensagens e áudios de pessoas que fazem parte da história dela 🤍
          </p>
          <p className="text-text-dark leading-relaxed text-base mt-3">
            A ideia é guardar pequenos momentos, histórias e carinhos que marcaram a vida da Sônia.
          </p>
          <p className="text-text-dark leading-relaxed text-base mt-3">
            E gostaríamos muito que você fizesse parte disso.
          </p>

          <div className="mt-4 pt-4" style={{ borderTop: '1px solid #E8D5A3' }}>
            <p className="text-text-muted text-sm font-medium mb-2">Nos próximos passos, você poderá:</p>
            <ul className="flex flex-col gap-2">
              <li className="flex items-start gap-2 text-sm text-text-dark">
                <span className="text-gold mt-0.5">🎙️</span>
                <span>contar algumas lembranças sobre a Sônia</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-text-dark">
                <span className="text-gold mt-0.5">📷</span>
                <span>enviar fotos antigas ou atuais</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-text-dark">
                <span className="text-gold mt-0.5">🎵</span>
                <span>e até deixar um áudio para ela ouvir no aniversário 😊</span>
              </li>
            </ul>
          </div>

          <div className="mt-4 pt-4" style={{ borderTop: '1px solid #E8D5A3' }}>
            <p className="text-text-muted text-sm">Vai ser rapidinho.</p>
            <p className="text-text-dark text-sm mt-1">
              Pode falar do seu jeito mesmo.<br />
              Depois o sistema organiza tudo para você.
            </p>
          </div>
        </div>

        {/* Botão */}
        <Link
          href="/identificacao"
          className="w-full py-4 rounded-2xl text-center font-medium text-white text-lg transition-all duration-200 active:scale-98 shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #C9A84C 0%, #A07830 100%)',
            boxShadow: '0 4px 20px rgba(201,168,76,0.4)',
          }}
        >
          Participar da surpresa 🎉
        </Link>

        <p className="text-text-muted text-xs text-center">
          Suas lembranças ficarão guardadas com muito carinho 🤍
        </p>

        <div
          className="w-full rounded-2xl px-5 py-3 flex items-center gap-3"
          style={{ background: '#FFF8E7', border: '1px dashed #C9A84C' }}
        >
          <span className="text-xl shrink-0">🤫</span>
          <p className="text-xs text-text-muted leading-relaxed">
            <strong className="text-text-dark">É surpresa!</strong> Por favor, não comente nada com a Sônia antes do aniversário 🤍
          </p>
        </div>
      </div>
    </main>
  )
}
