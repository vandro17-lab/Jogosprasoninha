'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Flower2, Sparkles } from 'lucide-react'
import { getSession, clearSession } from '@/lib/session-store'
import DecoBackground from '@/components/DecoBackground'
import FloralOrnament from '@/components/FloralOrnament'
import GoldDivider from '@/components/GoldDivider'

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14 } },
}

export default function ObrigadoPage() {
  const [nome, setNome] = useState('')

  useEffect(() => {
    const s = getSession()
    setNome(s.nome ?? '')
    setTimeout(() => clearSession(), 2000)
  }, [])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-14 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, #FBF0F0 0%, #F7EDD8 40%, #FDFCFA 80%)' }}
      />
      <DecoBackground variant="sparkle" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-sm w-full flex flex-col items-center gap-8 text-center"
      >
        {/* Animated heart with halo */}
        <motion.div variants={itemVariants} className="relative">
          <div
            aria-hidden
            className="absolute inset-0 -m-6 rounded-full animate-glow-pulse"
            style={{ background: 'radial-gradient(circle, rgba(232,200,200,0.55), transparent 70%)' }}
          />
          <motion.div
            animate={{
              scale: [1, 1.18, 1, 1.12, 1],
              transition: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' },
            }}
            style={{ position: 'relative', filter: 'drop-shadow(0 8px 20px rgba(232,200,200,0.55))' }}
          >
            <Heart size={78} color="#E8C8C8" fill="#E8C8C8" strokeWidth={1} />
          </motion.div>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="heading-display text-3xl text-gradient-gold"
        >
          {nome ? `Obrigado, ${nome}` : 'Obrigado'}
        </motion.h1>

        <motion.div variants={itemVariants} className="relative w-full">
          <FloralOrnament position="tl" size={48} tone="rose" opacity={0.6} />
          <FloralOrnament position="tr" size={48} tone="rose" opacity={0.6} />
          <FloralOrnament position="bl" size={48} tone="gold" opacity={0.55} />
          <FloralOrnament position="br" size={48} tone="gold" opacity={0.55} />

          <div className="glass-card-ornate w-full p-7 flex flex-col gap-3.5 relative">
            <div className="relative" style={{ zIndex: 2 }}>
              <p className="text-text-dark leading-relaxed text-base">
                Sua lembrança foi guardada com carinho e fará parte dessa surpresa tão especial para a Sônia 😊
              </p>
              <p className="text-text-dark leading-relaxed text-base mt-3">
                Cada mensagem e áudio ajudam a transformar esse aniversário em uma memória inesquecível.
              </p>

              <div className="mt-5">
                <GoldDivider tone="rose" />
              </div>

              <p className="text-text-dark leading-relaxed text-base mt-5">
                No dia <strong>4 de junho, às 20h</strong>, a Sônia receberá um link com essa homenagem cheia de amor, lembranças e pessoas importantes da vida dela 🤍
              </p>
              <p className="text-text-muted text-sm mt-3 italic">
                Até lá, por favor… mantenha segredo 😊✨
              </p>
            </div>
          </div>
        </motion.div>

        {/* Decorative icon row */}
        <motion.div
          variants={itemVariants}
          className="flex gap-5 items-center"
          style={{ color: '#E8C8C8' }}
        >
          {[Flower2, Sparkles, Heart, Sparkles, Flower2].map((Icon, i) => (
            <motion.span
              key={i}
              animate={{ y: [0, -6, 0], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2.8, repeat: Infinity, delay: i * 0.25, ease: 'easeInOut' }}
              style={{ filter: 'drop-shadow(0 2px 6px rgba(232,200,200,0.55))' }}
            >
              <Icon size={22} strokeWidth={1.4} />
            </motion.span>
          ))}
        </motion.div>

        <motion.p variants={itemVariants} className="text-text-muted text-xs">
          Você já pode fechar esta página 😊
        </motion.p>
      </motion.div>
    </main>
  )
}
