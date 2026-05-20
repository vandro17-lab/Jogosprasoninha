'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ProgressDots from '@/components/ProgressDots'
import { getSession, saveSession } from '@/lib/session-store'

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
    <main className="min-h-screen flex flex-col px-6 py-10">
      <div className="max-w-sm w-full mx-auto flex flex-col gap-6 animate-fade-in">
        <div className="text-center">
          <ProgressDots total={5} current={2} />
          <h1 className="font-playfair text-xl text-text-dark mt-4">Organizei sua mensagem assim 😊</h1>
        </div>

        {/* Card da mensagem */}
        <div
          className="rounded-3xl p-6"
          style={{ background: '#FFFDF9', border: '1px solid #E8D5A3', boxShadow: '0 4px 24px rgba(201,168,76,0.1)' }}
        >
          <div className="flex items-center gap-3 mb-4 pb-4" style={{ borderBottom: '1px solid #F0E8D8' }}>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-playfair text-gold font-bold text-lg"
              style={{ background: '#F0E8D8' }}
            >
              {session.nome.charAt(0)}
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
              className="w-full bg-transparent text-text-dark text-sm leading-relaxed outline-none resize-none"
              style={{ fontFamily: 'inherit' }}
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
        </div>

        {/* Botões */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleConfirm}
            disabled={confirmed}
            className="w-full py-4 rounded-2xl font-medium text-white text-base transition-all duration-200 active:scale-98 shadow-lg disabled:opacity-60"
            style={{
              background: confirmed ? '#A07830' : 'linear-gradient(135deg, #C9A84C 0%, #A07830 100%)',
              boxShadow: '0 4px 20px rgba(201,168,76,0.35)',
            }}
          >
            {confirmed ? '✓ Confirmado!' : 'Confirmar mensagem'}
          </button>

          <button
            onClick={handleAddMore}
            disabled={confirmed}
            className="w-full py-3 rounded-2xl font-medium text-gold-dark text-base transition-all duration-200 active:scale-98"
            style={{ background: '#F0E8D8', border: '1px solid #E8D5A3' }}
          >
            Adicionar mais uma lembrança
          </button>
        </div>

        <p className="text-text-muted text-xs text-center">
          Você pode editar a mensagem antes de confirmar 😊
        </p>
      </div>
    </main>
  )
}
