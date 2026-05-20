'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import RelationSelector from '@/components/RelationSelector'
import ProgressDots from '@/components/ProgressDots'
import Toast from '@/components/Toast'
import { findFamilyMember } from '@/lib/family-members'
import { saveSession } from '@/lib/session-store'


function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits.length ? `(${digits}` : ''
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
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
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      {toastMsg && (
        <Toast
          message={toastMsg}
          duration={3000}
          onDone={() => router.push('/memorias')}
        />
      )}
      <div className="max-w-sm w-full flex flex-col gap-6 animate-fade-in">
        <div className="text-center">
          <ProgressDots total={5} current={0} />
          <h1 className="font-playfair text-2xl text-text-dark mt-4">Que bom ter você aqui 😊</h1>
          <p className="text-text-muted text-sm mt-1">Antes de começarmos… como a Sônia te conhece?</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Campo nome */}
          <div
            className="rounded-2xl p-5"
            style={{ background: '#FFFDF9', border: '1px solid #E8D5A3' }}
          >
            <label className="block text-text-muted text-xs font-medium mb-2 uppercase tracking-wide">
              Seu nome
            </label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Só seu primeiro nome"
                className="flex-1 bg-transparent text-text-dark text-lg placeholder-text-muted/50 outline-none"
                autoFocus
                autoComplete="given-name"
              />
              <span className="text-2xl">🙂</span>
            </div>
          </div>

          {/* Seletor de parentesco */}
          {showSelector && (
            <div
              className="rounded-2xl p-5 animate-fade-in"
              style={{ background: '#FFFDF9', border: '1px solid #E8D5A3' }}
            >
              <label className="block text-text-muted text-xs font-medium mb-3 uppercase tracking-wide">
                Qual sua relação com a Sônia?
              </label>
              <RelationSelector value={parentesco} onChange={setParentesco} />
            </div>
          )}

          {/* Parentesco identificado automaticamente */}
          {!showSelector && parentesco && (
            <div
              className="rounded-2xl px-5 py-3 flex items-center gap-2 animate-fade-in"
              style={{ background: '#F0E8D8' }}
            >
              <span className="text-gold text-lg">✓</span>
              <span className="text-text-dark text-sm capitalize">{parentesco} da Sônia</span>
            </div>
          )}

          {/* Campo telefone */}
          <div
            className="rounded-2xl p-5"
            style={{ background: '#FFFDF9', border: '1px solid #E8D5A3' }}
          >
            <label className="block text-text-muted text-xs font-medium mb-2 uppercase tracking-wide">
              WhatsApp <span className="normal-case text-text-muted/60">(opcional)</span>
            </label>
            <input
              type="tel"
              value={telefone}
              onChange={(e) => setTelefone(formatPhone(e.target.value))}
              placeholder="(99) 99999-9999"
              className="w-full bg-transparent text-text-dark text-lg placeholder-text-muted/50 outline-none"
              inputMode="numeric"
            />
            <p className="text-text-muted text-xs mt-2">Caso precisemos falar com você 😊</p>
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center animate-fade-in">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl font-medium text-white text-lg transition-all duration-200 active:scale-98 shadow-lg disabled:opacity-60"
            style={{
              background: 'linear-gradient(135deg, #C9A84C 0%, #A07830 100%)',
              boxShadow: '0 4px 20px rgba(201,168,76,0.35)',
            }}
          >
            {loading ? 'Aguarde...' : 'Continuar ✨'}
          </button>
        </form>
      </div>
    </main>
  )
}
