'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { UserRound, Sparkles } from 'lucide-react'
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

export default function RevisaoPage() {
  const router = useRouter()
  const [session, setSession] = useState({ nome: '', parentesco: '', memoriaFinal: '' })
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState('')
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    const s = getSession()
    if (!s.nome || !s.memoriaFinal) { router.replace('/memorias'); return }
    setSession({ nome: s.nome, parentesco: s.parentesco, memoriaFinal: s.memoriaFinal })
    setEditText(s.memoriaFinal)
  }, [])

  function handleConfirm() {
    if (editing) {
      saveSession({ memoriaFinal: editText })
      setSession((prev) => ({ ...prev, memoriaFinal: editText }))
      setEditing(false)
    }
    setConfirmed(true)
    setTimeout(() => router.push('/fotos'), 600)
  }

  function handleAddMore() {
    router.push('/memorias')
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
          <ProgressDots total={5} current={2} />
          <SectionTitle
            eyebrow="Sua homenagem"
            title="Ficou assim ✨"
          />
        </motion.div>

        {/* Mensagem card */}
        <motion.div variants={itemVariants} className="relative">
          <FloralOrnament position="tl" size={46} tone="gold" opacity={0.55} />
          <FloralOrnament position="br" size={46} tone="gold" opacity={0.55} />

          <div className="glass-card-ornate p-7 relative">
            <div className="relative" style={{ zIndex: 2 }}>
              <div className="flex items-center gap-3 mb-5 pb-5" style={{ borderBottom: '1px solid rgba(232,213,163,0.45)' }}>
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #F0E8D8 0%, #E8D5A3 100%)',
                    boxShadow: '0 1px 0 rgba(255,255,255,0.7) inset, 0 4px 10px -4px rgba(201,168,76,0.30)',
                    border: '1px solid rgba(232,213,163,0.55)',
                  }}
                >
                  <UserRound size={22} color="#A07830" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <p className="font-playfair text-text-dark text-base leading-tight">{session.nome}</p>
                  <p className="text-text-muted text-xs capitalize mt-0.5 tracking-wide">{session.parentesco} da Sônia</p>
                </div>
                <Sparkles size={16} color="#C9A84C" strokeWidth={1.5} />
              </div>

              {editing ? (
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={9}
                  className="w-full text-text-dark text-sm leading-relaxed outline-none resize-none focus-ring"
                  style={{
                    fontFamily: 'inherit',
                    background: 'rgba(255,253,249,0.65)',
                    border: '1px solid rgba(232,213,163,0.7)',
                    borderRadius: '0.85rem',
                    padding: '0.85rem 1rem',
                    boxShadow: 'inset 0 1px 2px rgba(61,50,40,0.04)',
                  }}
                />
              ) : (
                <p
                  className="text-text-dark leading-relaxed whitespace-pre-line"
                  style={{ fontSize: '0.95rem', lineHeight: 1.7 }}
                >
                  {session.memoriaFinal}
                </p>
              )}

              <button
                onClick={() => setEditing(!editing)}
                className="mt-5 text-text-muted text-xs underline decoration-dotted underline-offset-4 hover:text-gold-dark transition-colors focus-ring"
              >
                {editing ? 'Ver preview' : 'Editar mensagem'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Buttons */}
        <motion.div variants={itemVariants} className="flex flex-col gap-3">
          <motion.button
            onClick={handleConfirm}
            disabled={confirmed}
            whileHover={confirmed ? {} : { scale: 1.02, y: -1 }}
            whileTap={confirmed ? {} : { scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 380, damping: 22 }}
            className="w-full py-4 rounded-2xl font-medium text-white text-base disabled:opacity-60 shimmer-btn focus-ring"
            style={{ opacity: confirmed ? 0.7 : 1 }}
          >
            {confirmed ? '✓ Confirmado!' : 'Confirmar mensagem 🤍'}
          </motion.button>

          <motion.button
            onClick={handleAddMore}
            disabled={confirmed}
            whileHover={confirmed ? {} : { scale: 1.02, y: -1 }}
            whileTap={confirmed ? {} : { scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 380, damping: 22 }}
            className="w-full py-3 rounded-2xl font-medium text-base focus-ring"
            style={{
              background: 'linear-gradient(180deg, rgba(247,237,216,0.92) 0%, rgba(232,213,163,0.55) 100%)',
              border: '1px solid rgba(201,168,76,0.45)',
              color: '#8E6A24',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 1px 0 rgba(255,255,255,0.6) inset, 0 1px 2px rgba(61,50,40,0.04), 0 8px 22px -8px rgba(201,168,76,0.30)',
              transition: 'box-shadow 0.3s var(--ease-luxe), transform 0.2s var(--ease-luxe)',
            }}
          >
            Adicionar outra lembrança
          </motion.button>
        </motion.div>

        <motion.p variants={itemVariants} className="text-text-muted text-xs text-center">
          Você pode ajustar sua mensagem antes de confirmar 😊
        </motion.p>
      </motion.div>
    </main>
  )
}
