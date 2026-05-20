'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Cake, Mic2, Camera, Music2, Lock } from 'lucide-react'
import Toast from '@/components/Toast'
import DecoBackground from '@/components/DecoBackground'
import FloralOrnament from '@/components/FloralOrnament'
import SectionTitle from '@/components/SectionTitle'
import GoldDivider from '@/components/GoldDivider'

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}

export default function Home() {
  const router = useRouter()
  const [imgError, setImgError] = useState(false)
  const [showToast, setShowToast] = useState(false)

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-14 relative overflow-hidden">
      {/* Background gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 30% 20%, #FDFCFA 0%, #FBF0F0 50%, #F7EDD8 100%)' }}
      />
      <DecoBackground variant="ornate" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-sm w-full flex flex-col items-center gap-8"
      >

        {/* Eyebrow badge */}
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium animate-breathe"
          style={{
            background: 'linear-gradient(135deg, rgba(201,168,76,0.14) 0%, rgba(232,213,163,0.30) 100%)',
            border: '1px solid rgba(201,168,76,0.35)',
            color: '#A07830',
            boxShadow: '0 1px 0 rgba(255,255,255,0.5) inset, 0 6px 16px -8px rgba(201,168,76,0.35)',
          }}
        >
          <Cake size={16} color="#C9A84C" />
          <span className="tracking-luxe" style={{ fontSize: '0.7rem', letterSpacing: '0.18em' }}>59 anos da Sônia</span>
          <Cake size={16} color="#C9A84C" />
        </motion.div>

        {/* Photo with ornate frame */}
        <motion.div variants={itemVariants} className="relative">
          {/* Outer ornamental frame (SVG) */}
          <div
            aria-hidden
            className="absolute pointer-events-none"
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 248,
              height: 248,
              color: '#C9A84C',
            }}
          >
            <Image
              src="/ornaments/frame-deco.svg"
              alt=""
              width={248}
              height={248}
              style={{ filter: 'drop-shadow(0 4px 16px rgba(201,168,76,0.25))' }}
            />
          </div>
          {/* Soft halo */}
          <div
            className="absolute -inset-3 rounded-full opacity-40 animate-glow-pulse"
            style={{ background: 'radial-gradient(circle, rgba(232,213,163,0.5), transparent 70%)' }}
          />
          <div
            className="relative w-44 h-44 rounded-full overflow-hidden flex items-center justify-center"
            style={{
              boxShadow: '0 1px 0 rgba(255,255,255,0.8) inset, 0 10px 32px rgba(201,168,76,0.32), 0 20px 48px -10px rgba(61,50,40,0.20)',
              background: '#F0E8D8',
              border: '4px solid #FFFDF9',
            }}
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
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-3.5 py-1.5 rounded-full text-xs font-medium text-white whitespace-nowrap"
            style={{
              background: 'linear-gradient(135deg, #D9B95C 0%, #C9A84C 50%, #8E6A24 100%)',
              boxShadow: '0 1px 0 rgba(255,255,255,0.45) inset, 0 6px 16px rgba(201,168,76,0.45)',
              letterSpacing: '0.02em',
            }}
          >
            🥳 Feliz Aniversário!
          </div>
        </motion.div>

        {/* Title */}
        <motion.div variants={itemVariants}>
          <SectionTitle
            eyebrow="Memórias da Sônia"
            title="Uma surpresa feita com carinho"
            subtitle="para a Sônia 🌸"
          />
        </motion.div>

        {/* Main card with floral corners */}
        <motion.div
          variants={itemVariants}
          className="relative w-full"
        >
          <FloralOrnament position="tl" size={50} tone="gold" opacity={0.55} />
          <FloralOrnament position="tr" size={50} tone="gold" opacity={0.55} />
          <FloralOrnament position="bl" size={50} tone="gold" opacity={0.55} />
          <FloralOrnament position="br" size={50} tone="gold" opacity={0.55} />

          <div className="glass-card-ornate card-interactive w-full p-7 relative">
            <div className="relative" style={{ zIndex: 2 }}>
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

              <div className="mt-5 pt-5">
                <GoldDivider label="Como funciona" />
              </div>

              <div className="mt-5">
                <p className="text-text-muted text-sm font-medium mb-3">Nos próximos passos, você poderá:</p>
                <ul className="flex flex-col gap-2.5">
                  <li className="flex items-start gap-3 text-sm text-text-dark">
                    <span
                      className="shrink-0 mt-0.5 inline-flex items-center justify-center rounded-full"
                      style={{ width: 26, height: 26, background: 'linear-gradient(135deg, rgba(232,213,163,0.45), rgba(201,168,76,0.25))', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.55)' }}
                    >
                      <Mic2 size={13} color="#A07830" />
                    </span>
                    <span>compartilhar uma lembrança da Sônia</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-text-dark">
                    <span
                      className="shrink-0 mt-0.5 inline-flex items-center justify-center rounded-full"
                      style={{ width: 26, height: 26, background: 'linear-gradient(135deg, rgba(232,213,163,0.45), rgba(201,168,76,0.25))', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.55)' }}
                    >
                      <Camera size={13} color="#A07830" />
                    </span>
                    <span>enviar fotos antigas ou recentes</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-text-dark">
                    <span
                      className="shrink-0 mt-0.5 inline-flex items-center justify-center rounded-full"
                      style={{ width: 26, height: 26, background: 'linear-gradient(135deg, rgba(232,213,163,0.45), rgba(201,168,76,0.25))', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.55)' }}
                    >
                      <Music2 size={13} color="#A07830" />
                    </span>
                    <span>gravar um áudio para ela ouvir no aniversário</span>
                  </li>
                </ul>
              </div>

              <div className="mt-5 pt-4" style={{ borderTop: '1px solid rgba(232,213,163,0.45)' }}>
                <p className="text-text-dark text-sm leading-relaxed">
                  Pode falar do seu jeito, sem preocupação 😊<br />
                  Nós vamos organizar tudo com carinho para você.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.button
          variants={itemVariants}
          onClick={() => setShowToast(true)}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 380, damping: 22 }}
          className="w-full py-4 rounded-2xl text-center text-lg shimmer-btn focus-ring"
        >
          Participar dessa surpresa 🤍
        </motion.button>

        {showToast && (
          <Toast
            message="Ela vai amar ler a sua mensagem! 🌸"
            onDone={() => router.push('/identificacao')}
          />
        )}

        <motion.p variants={itemVariants} className="text-text-muted text-xs text-center">
          Suas lembranças serão guardadas com muito carinho ✨
        </motion.p>

        {/* Surprise warning */}
        <motion.div
          variants={itemVariants}
          className="w-full rounded-2xl px-5 py-3.5 flex items-center gap-3"
          style={{
            background: 'linear-gradient(135deg, rgba(255,248,231,0.85) 0%, rgba(247,237,216,0.65) 100%)',
            border: '1px dashed rgba(201,168,76,0.55)',
            boxShadow: '0 1px 0 rgba(255,255,255,0.6) inset, 0 4px 12px -4px rgba(201,168,76,0.12)',
          }}
        >
          <Lock size={18} color="#C9A84C" className="shrink-0" />
          <p className="text-xs text-text-muted leading-relaxed">
            <strong className="text-text-dark">É surpresa!</strong> Se puder, não comente nada com a Sônia antes do aniversário 😊
          </p>
        </motion.div>
      </motion.div>
    </main>
  )
}
