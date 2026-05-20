'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { UserRound } from 'lucide-react'
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
          <ProgressDots total={5} current={2} />
          <h1 className="font-playfair text-xl text-text-dark mt-4">Sua homenagem ficou assim ✨</h1>
        </motion.div>

        {/* Card da mensagem */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4 pb-4" style={{ borderBottom: '1px solid rgba(232,213,163,0.6)' }}>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #F0E8D8 0%, #E8D5A3 100%)' }}
            >
              <UserRound size={20} color="#C9A84C" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-medium text-text-dark text-sm">{session.nome}</p>
              <p className="text-text-muted text-xs capitalize">{session.parentesco} da Sônia</p>
            </div>
          </div>

          {editing ? (
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={8}
              className="w-full text-text-dark text-sm leading-relaxed outline-none resize-none"
              style={{
                fontFamily: 'inherit',
                background: 'transparent',
                border: '1px solid rgba(232,213,163,0.8)',
                borderRadius: '0.75rem',
                padding: '0.75rem',
              }}
            />
          ) : (
            <p className="text-text-dark text-sm leading-relaxed whitespace-pre-line">
              {session.memoriaFinal}
            </p>
          )}

          <button
            onClick={() => setEditing(!editing)}
            className="mt-4 text-text-muted text-xs underline"
          >
            {editing ? 'Ver preview' : 'Editar mensagem'}
          </button>
        </motion.div>

        {/* Botões */}
        <motion.div variants={itemVariants} className="flex flex-col gap-3">
          <motion.button
            onClick={handleConfirm}
            disabled={confirmed}
            whileHover={confirmed ? {} : { scale: 1.02 }}
            whileTap={confirmed ? {} : { scale: 0.97 }}
            className="w-full py-4 rounded-2xl font-medium text-white text-base shadow-lg disabled:opacity-60 shimmer-btn"
            style={{ opacity: confirmed ? 0.7 : 1 }}
          >
            {confirmed ? '✓ Confirmado!' : 'Confirmar mensagem 🤍'}
          </motion.button>

          <motion.button
            onClick={handleAddMore}
            disabled={confirmed}
            whileHover={confirmed ? {} : { scale: 1.02 }}
            whileTap={confirmed ? {} : { scale: 0.97 }}
            className="w-full py-3 rounded-2xl font-medium text-base transition-all duration-200"
            style={{
              background: 'rgba(240,232,216,0.7)',
              border: '1px solid rgba(232,213,163,0.8)',
              color: '#A07830',
              backdropFilter: 'blur(8px)',
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
