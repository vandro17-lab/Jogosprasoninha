'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import ProgressDots from '@/components/ProgressDots'
import DecoBackground from '@/components/DecoBackground'
import { getSession, saveSession } from '@/lib/session-store'

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: 'easeOut' as const } },
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
    <main className="min-h-screen flex flex-col px-6 py-10 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at top, #F7EDD8 0%, #FDFCFA 65%)' }}
      />
      <DecoBackground variant="default" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-sm w-full mx-auto flex flex-col gap-6"
      >
        <motion.div variants={itemVariants} className="text-center">
          <ProgressDots total={4} current={1} />
          <h1 className="font-playfair text-xl text-text-dark mt-4">
            {nome ? `Escreva para a Sônia, ${nome} 🤍` : 'Escreva para a Sônia 🤍'}
          </h1>
          <p className="text-text-muted text-sm mt-1 leading-relaxed">
            Um recado, uma lembrança, um desejo especial…
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card p-6">
          <textarea
            value={mensagem}
            onChange={(e) => { setMensagem(e.target.value); setError('') }}
            placeholder="Escreva aqui sua mensagem, lembrança ou desejo de feliz aniversário para a Sônia"
            rows={7}
            autoFocus
            className="w-full text-text-dark text-sm leading-relaxed outline-none resize-none placeholder-text-muted/50"
            style={{ fontFamily: 'inherit', background: 'transparent' }}
          />
          <div
            className="flex justify-between items-center mt-2 pt-2"
            style={{ borderTop: '1px solid rgba(232,213,163,0.4)' }}
          >
            <p className="text-text-muted text-xs">
              {mensagem.trim().length > 0
                ? `${mensagem.trim().length} caracteres`
                : 'Fale do seu jeito 😊'}
            </p>
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
          whileHover={(saving || !mensagem.trim()) ? {} : { scale: 1.02 }}
          whileTap={(saving || !mensagem.trim()) ? {} : { scale: 0.97 }}
          className="w-full py-4 rounded-2xl font-medium text-white text-base shadow-lg disabled:opacity-40 shimmer-btn"
        >
          {saving ? 'Salvando…' : 'Continuar ✨'}
        </motion.button>
      </motion.div>
    </main>
  )
}
