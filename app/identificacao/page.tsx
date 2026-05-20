'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { UserRound } from 'lucide-react'
import RelationSelector from '@/components/RelationSelector'
import ProgressDots from '@/components/ProgressDots'
import Toast from '@/components/Toast'
import DecoBackground from '@/components/DecoBackground'
import SectionTitle from '@/components/SectionTitle'
import { findFamilyMember } from '@/lib/family-members'
import { saveSession } from '@/lib/session-store'


function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits.length ? `(${digits}` : ''
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: 'easeOut' as const } },
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.10 } },
}

export default function IdentificacaoPage() {
  const router = useRouter()
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [parentesco, setParentesco] = useState('')
  const [showSelector, setShowSelector] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [toastMsg, setToastMsg] = useState('')

  useEffect(() => {
    if (nome.trim().length >= 2) {
      const found = findFamilyMember(nome)
      if (found) {
        setParentesco(found.parentesco)
        setShowSelector(false)
      } else {
        setShowSelector(true)
        if (!parentesco) setParentesco('')
      }
    } else {
      setShowSelector(false)
      setParentesco('')
    }
  }, [nome])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!nome.trim()) { setError('Por favor, diga seu nome 😊'); return }
    if (!parentesco) { setError('Nos diga sua relação com a Sônia 😊'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/save-participant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: nome.trim(), parentesco, telefone }),
      })
      const data = await res.json()
      saveSession({ participantId: data.id, nome: nome.trim(), parentesco, telefone, memories: [], memoriaFinal: '' })
      setToastMsg(`Que alegria ter você aqui, ${nome.trim()} 🤍\n\nSua lembrança vai fazer parte dessa homenagem tão especial para a Sônia ✨`)
    } catch {
      setError('Algo deu errado. Tente de novo 😊')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-14 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at top, #FBF0F0 0%, #FDFCFA 65%)' }}
      />
      <DecoBackground variant="ornate" />

      {toastMsg && (
        <Toast
          message={toastMsg}
          duration={3000}
          onDone={() => router.push('/memorias')}
        />
      )}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-sm w-full flex flex-col gap-7"
      >
        <motion.div variants={itemVariants} className="flex flex-col gap-4 items-center">
          <ProgressDots total={4} current={0} />
          <SectionTitle
            eyebrow="Apresentação"
            title="Que bom ter você aqui 😊"
            subtitle="como a Sônia te conhece?"
          />
        </motion.div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Campo nome */}
          <motion.div variants={itemVariants} className="glass-card-premium p-5">
            <label className="block text-gold-dark tracking-luxe mb-2.5" style={{ position: 'relative', zIndex: 2 }}>
              Seu nome
            </label>
            <div className="flex items-center gap-3" style={{ position: 'relative', zIndex: 2 }}>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Só seu primeiro nome"
                className="flex-1 bg-transparent text-text-dark text-lg placeholder-text-muted/50 outline-none focus-ring"
                autoFocus
                autoComplete="given-name"
              />
              <UserRound size={24} color="#C9A84C" strokeWidth={1.5} />
            </div>
          </motion.div>

          {/* Seletor de parentesco */}
          {showSelector && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="glass-card-premium p-5"
            >
              <label className="block text-gold-dark tracking-luxe mb-3" style={{ position: 'relative', zIndex: 2 }}>
                Sua relação com a Sônia
              </label>
              <div style={{ position: 'relative', zIndex: 2 }}>
                <RelationSelector value={parentesco} onChange={setParentesco} />
              </div>
            </motion.div>
          )}

          {/* Parentesco identificado automaticamente */}
          {!showSelector && parentesco && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="rounded-2xl px-5 py-3 flex items-center gap-2.5"
              style={{
                background: 'linear-gradient(135deg, rgba(247,237,216,0.85), rgba(232,213,163,0.40))',
                border: '1px solid rgba(232,213,163,0.65)',
                boxShadow: '0 1px 0 rgba(255,255,255,0.55) inset, 0 4px 12px -4px rgba(201,168,76,0.18)',
              }}
            >
              <span
                className="inline-flex items-center justify-center rounded-full text-white text-xs font-semibold"
                style={{ width: 22, height: 22, background: 'linear-gradient(135deg, #D9B95C, #A07830)' }}
              >
                ✓
              </span>
              <span className="text-text-dark text-sm capitalize">{parentesco} da Sônia</span>
            </motion.div>
          )}

          {/* Campo telefone */}
          <motion.div variants={itemVariants} className="glass-card-premium p-5">
            <label className="block text-gold-dark tracking-luxe mb-2.5" style={{ position: 'relative', zIndex: 2 }}>
              WhatsApp <span className="normal-case text-text-muted/60 tracking-normal" style={{ fontSize: '0.7rem' }}>(opcional)</span>
            </label>
            <input
              type="tel"
              value={telefone}
              onChange={(e) => setTelefone(formatPhone(e.target.value))}
              placeholder="(99) 99999-9999"
              className="w-full bg-transparent text-text-dark text-lg placeholder-text-muted/50 outline-none focus-ring"
              inputMode="numeric"
              style={{ position: 'relative', zIndex: 2 }}
            />
            <p className="text-text-muted text-xs mt-2" style={{ position: 'relative', zIndex: 2 }}>Caso precisemos falar com você 😊</p>
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
            type="submit"
            disabled={loading}
            whileHover={loading ? {} : { scale: 1.02, y: -1 }}
            whileTap={loading ? {} : { scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 380, damping: 22 }}
            className="w-full py-4 rounded-2xl text-white text-lg disabled:opacity-60 shimmer-btn focus-ring"
          >
            {loading ? 'Aguarde...' : 'Continuar ✨'}
          </motion.button>
        </form>
      </motion.div>
    </main>
  )
}
