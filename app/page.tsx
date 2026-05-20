'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Cake, Mic2, Camera, Music2, Lock } from 'lucide-react'
import Toast from '@/components/Toast'
import DecoBackground from '@/components/DecoBackground'

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
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
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Background gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(135deg, #FDFCFA 0%, #FBF0F0 45%, #F7EDD8 100%)' }}
      />
      <DecoBackground variant="default" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-sm w-full flex flex-col items-center gap-7"
      >

        {/* Badge de aniversário */}
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
          style={{ background: 'linear-gradient(135deg, #C9A84C22 0%, #E8D5A344 100%)', border: '1px solid #C9A84C55', color: '#A07830' }}
        >
          <Cake size={16} color="#C9A84C" />
          <span>59 anos da Sônia ✨</span>
          <Cake size={16} color="#C9A84C" />
        </motion.div>

        {/* Foto da Sônia */}
        <motion.div variants={itemVariants} className="relative">
          <div
            className="absolute -inset-2 rounded-full opacity-40"
            style={{ background: 'conic-gradient(from 0deg, #C9A84C, #E8D5A3, #C9A84C, #A07830, #C9A84C)' }}
          />
          <div
            className="absolute -inset-3 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #FBF0F0, transparent 70%)' }}
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
        </motion.div>

        {/* Título */}
        <motion.div variants={itemVariants} className="text-center mt-2">
          <p className="font-playfair text-2xl text-text-dark leading-snug">
            Uma surpresa feita com carinho
          </p>
          <p className="text-gold font-playfair text-lg mt-1">para a Sônia 🌸</p>
        </motion.div>

        {/* Card principal */}
        <motion.div variants={itemVariants} className="glass-card w-full p-6">
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

          <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(232,213,163,0.6)' }}>
            <p className="text-text-muted text-sm font-medium mb-2">Nos próximos passos, você poderá:</p>
            <ul className="flex flex-col gap-2">
              <li className="flex items-start gap-2 text-sm text-text-dark">
                <Mic2 size={15} color="#C9A84C" className="mt-0.5 shrink-0" />
                <span>compartilhar uma lembrança da Sônia</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-text-dark">
                <Camera size={15} color="#C9A84C" className="mt-0.5 shrink-0" />
                <span>enviar fotos antigas ou recentes</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-text-dark">
                <Music2 size={15} color="#C9A84C" className="mt-0.5 shrink-0" />
                <span>gravar um áudio para ela ouvir no aniversário</span>
              </li>
            </ul>
          </div>

          <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(232,213,163,0.6)' }}>
            <p className="text-text-dark text-sm">
              Pode falar do seu jeito, sem preocupação 😊<br />
              Nós vamos organizar tudo com carinho para você.
            </p>
          </div>
        </motion.div>

        {/* Botão CTA */}
        <motion.button
          variants={itemVariants}
          onClick={() => setShowToast(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="w-full py-4 rounded-2xl text-center text-lg shimmer-btn"
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

        {/* Aviso de surpresa */}
        <motion.div
          variants={itemVariants}
          className="w-full rounded-2xl px-5 py-3 flex items-center gap-3"
          style={{ background: 'rgba(255,248,231,0.8)', border: '1px dashed #C9A84C' }}
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
