'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import ProgressDots from '@/components/ProgressDots'
import DecoBackground from '@/components/DecoBackground'
import FloralOrnament from '@/components/FloralOrnament'
import SectionTitle from '@/components/SectionTitle'
import { getSession, saveSession } from '@/lib/session-store'

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.10 } },
}

export default function MemoriasPage() {
  const router = useRouter()
  const [mensagem, setMensagem] = useState('')
  const [nome, setNome] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const s = getSession()
    if (!s.nome) { router.replace('/identificacao'); return }
    setNome(s.nome)
  }, [])

  async function handleSubmit() {
    const trimmed = mensagem.trim()
    if (!trimmed) { setError('Escreva sua mensagem antes de continuar 😊'); return }

    setSaving(true)
    const cs = getSession()
    saveSession({ memories: [trimmed], memoriaFinal: trimmed })

    try {
      await fetch('/api/save-memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId: cs.participantId, memoriaBreita: trimmed }),
      })
    } catch {
      // Continua mesmo se o salvamento remoto falhar
    }

    router.push('/fotos')
  }

  return (
    <main className="min-h-screen flex flex-col px-6 py-12 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at top, #F7EDD8 0%, #FDFCFA 65%)' }}
      />
      <DecoBackground variant="ornate" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-sm w-full mx-auto flex flex-col gap-7"
      >
        <motion.div variants={itemVariants} className="flex flex-col items-center gap-4">
          <ProgressDots total={4} current={1} />
          <SectionTitle
            eyebrow={nome ? `Olá, ${nome}` : 'Sua mensagem'}
            title="Escreva para a Sônia 🤍"
            subtitle="um recado, uma lembrança, um desejo especial…"
          />
        </motion.div>

        <motion.div variants={itemVariants} className="relative">
          <FloralOrnament position="tl" size={44} tone="gold" opacity={0.5} />
          <FloralOrnament position="br" size={44} tone="gold" opacity={0.5} />

          <div className="glass-card-soft-rose p-7 relative" style={{ zIndex: 2 }}>
            <textarea
              value={mensagem}
              onChange={(e) => { setMensagem(e.target.value); setError('') }}
              placeholder="Escreva aqui sua mensagem, lembrança ou desejo de feliz aniversário para a Sônia"
              rows={7}
              autoFocus
              className="w-full text-text-dark text-sm leading-relaxed outline-none resize-none placeholder-text-muted/50 focus-ring"
              style={{ fontFamily: 'inherit', background: 'transparent' }}
            />
            <div
              className="flex items-center mt-3 pt-3"
              style={{ borderTop: '1px solid rgba(232,213,163,0.4)' }}
            >
              <p className="text-text-muted text-xs">
                {mensagem.trim().length > 0
                  ? `${mensagem.trim().length} caracteres`
                  : 'Fale do seu jeito 😊'}
              </p>
            </div>
          </div>
        </motion.div>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-400 text-sm text-center"
          >
            {error}
          </motion.p>
        )}

        <motion.button
          variants={itemVariants}
          onClick={handleSubmit}
          disabled={saving || !mensagem.trim()}
          whileHover={(saving || !mensagem.trim()) ? {} : { scale: 1.02, y: -1 }}
          whileTap={(saving || !mensagem.trim()) ? {} : { scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 380, damping: 22 }}
          className="w-full py-4 rounded-2xl font-medium text-white text-base disabled:opacity-40 shimmer-btn focus-ring"
        >
          {saving ? 'Salvando…' : 'Continuar ✨'}
        </motion.button>
      </motion.div>
    </main>
  )
}
