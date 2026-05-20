'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Flower2, Sparkles } from 'lucide-react'
import { getSession, clearSession } from '@/lib/session-store'
import DecoBackground from '@/components/DecoBackground'

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}

export default function ObrigadoPage() {
  const [nome, setNome] = useState('')

  useEffect(() => {
    const s = getSession()
    setNome(s.nome ?? '')
    setTimeout(() => clearSession(), 2000)
  }, [])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, #FBF0F0 0%, #F7EDD8 40%, #FDFCFA 80%)' }}
      />
      <DecoBackground variant="rose" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-sm w-full flex flex-col items-center gap-8 text-center"
      >
        {/* Animated heart */}
        <motion.div
          variants={itemVariants}
          animate={{
            scale: [1, 1.18, 1, 1.12, 1],
            transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          <Heart size={72} color="#E8C8C8" fill="#E8C8C8" strokeWidth={1} />
        </motion.div>

        <motion.h1 variants={itemVariants} className="font-playfair text-3xl text-text-dark">
          {nome ? `Obrigado, ${nome} ✨` : 'Obrigado ✨'}
        </motion.h1>

        <motion.div
          variants={itemVariants}
          className="glass-card-rose w-full p-6 flex flex-col gap-3"
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
        </motion.div>

        {/* Decorative icon row */}
        <motion.div
          variants={itemVariants}
          className="flex gap-4 items-center"
          style={{ color: '#E8C8C8' }}
        >
          {[Flower2, Sparkles, Heart, Sparkles, Flower2].map((Icon, i) => (
            <motion.span
              key={i}
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.25, ease: 'easeInOut' }}
            >
              <Icon size={20} strokeWidth={1.4} />
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
