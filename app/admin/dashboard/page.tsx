'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, Users, MessageSquare, Image, Mic, RefreshCw, Phone, Clock, ChevronDown, ChevronUp, X, Trash2 } from 'lucide-react'

interface Participant {
  id: string
  nome: string
  parentesco: string
  telefone: string | null
  created_at: string
  mensagem: string | null
  fotos: string[]
  audio: string | null
}

function timeAgo(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffH = Math.floor(diffMin / 60)
  const diffD = Math.floor(diffH / 24)
  if (diffMin < 1) return 'agora mesmo'
  if (diffMin < 60) return `há ${diffMin} min`
  if (diffH < 24) return `há ${diffH}h`
  if (diffD === 1) return 'ontem'
  return `há ${diffD} dias`
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.12)' }}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-xs text-gray-400">{label}</p>
      </div>
    </div>
  )
}

function ParticipantCard({ p, onDelete }: { p: Participant; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false)
  const [lightbox, setLightbox] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    const token = localStorage.getItem('admin_token') ?? ''
    try {
      await fetch('/api/admin/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ participantId: p.id }),
      })
      onDelete(p.id)
    } catch {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  const whatsappUrl = p.telefone
    ? `https://wa.me/55${p.telefone.replace(/\D/g, '')}`
    : null

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        {/* Header */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold text-lg shrink-0"
                style={{ background: 'linear-gradient(135deg, #C9A84C, #A07830)' }}
              >
                {p.nome[0].toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{p.nome}</p>
                <p className="text-xs text-gray-400 capitalize">{p.parentesco} da Sônia</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 mt-1">
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Clock size={12} />{timeAgo(p.created_at)}
              </span>
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                  title="Apagar"
                >
                  <Trash2 size={14} />
                </button>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-2 py-1 rounded-lg text-xs font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 transition-colors"
                  >
                    {deleting ? '…' : 'Apagar'}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-2 py-1 rounded-lg text-xs text-gray-400 hover:bg-gray-100 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Indicadores rápidos */}
          <div className="flex gap-2 mt-3 flex-wrap">
            {p.mensagem && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600">
                <MessageSquare size={10} /> mensagem
              </span>
            )}
            {p.fotos.length > 0 && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-purple-50 text-purple-600">
                <Image size={10} /> {p.fotos.length} foto{p.fotos.length > 1 ? 's' : ''}
              </span>
            )}
            {p.audio && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-50 text-green-600">
                <Mic size={10} /> áudio
              </span>
            )}
            {p.telefone && (
              <a
                href={whatsappUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-600"
              >
                <Phone size={10} /> {p.telefone}
              </a>
            )}
          </div>
        </div>

        {/* Expandir */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-4 py-2.5 flex items-center justify-between text-xs text-gray-400 border-t border-gray-50 hover:bg-gray-50 transition-colors"
        >
          <span>{expanded ? 'Recolher' : 'Ver detalhes'}</span>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 flex flex-col gap-4 border-t border-gray-50 pt-3">
                {/* Data completa */}
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock size={11} /> {formatDate(p.created_at)}
                </p>

                {/* Mensagem */}
                {p.mensagem ? (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Mensagem</p>
                    <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-3 whitespace-pre-wrap">
                      {p.mensagem}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-300 italic">Sem mensagem de texto</p>
                )}

                {/* Fotos */}
                {p.fotos.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Fotos</p>
                    <div className="flex gap-2 flex-wrap">
                      {p.fotos.map((url, i) => (
                        <button key={i} onClick={() => setLightbox(url)}>
                          <img
                            src={url}
                            alt={`Foto ${i + 1}`}
                            className="w-20 h-20 rounded-xl object-cover border border-gray-100 hover:opacity-90 transition-opacity"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Áudio */}
                {p.audio && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Áudio</p>
                    <audio controls src={p.audio} className="w-full rounded-xl" style={{ height: 40 }} />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <button
              className="absolute top-4 right-4 text-white"
              onClick={() => setLightbox(null)}
            >
              <X size={28} />
            </button>
            <img
              src={lightbox}
              alt="Foto ampliada"
              className="max-w-full max-h-[90vh] rounded-2xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default function AdminDashboard() {
  const router = useRouter()
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    const token = localStorage.getItem('admin_token')
    if (!token) { router.replace('/admin'); return }

    try {
      const res = await fetch('/api/admin/data', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.status === 401) { localStorage.removeItem('admin_token'); router.replace('/admin'); return }
      const data = await res.json()
      setParticipants(data.participants ?? [])
    } catch {
      setError('Erro ao carregar os dados.')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => { fetchData() }, [fetchData])

  function handleLogout() {
    localStorage.removeItem('admin_token')
    router.replace('/admin')
  }

  const totalFotos = participants.reduce((s, p) => s + p.fotos.length, 0)
  const totalAudios = participants.filter((p) => p.audio).length
  const totalMensagens = participants.filter((p) => p.mensagem).length

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-gray-800">Painel da Sônia</h1>
            <p className="text-xs text-gray-400">{participants.length} participante{participants.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              className="p-2 rounded-xl text-gray-400 hover:bg-gray-50 transition-colors"
              title="Atualizar"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-gray-400 hover:bg-gray-50 transition-colors"
              title="Sair"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 flex flex-col gap-4">
        {/* Stats */}
        {!loading && participants.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={<Users size={18} color="#C9A84C" />} label="participantes" value={participants.length} />
            <StatCard icon={<MessageSquare size={18} color="#C9A84C" />} label="mensagens" value={totalMensagens} />
            <StatCard icon={<Image size={18} color="#C9A84C" />} label="fotos" value={totalFotos} />
            <StatCard icon={<Mic size={18} color="#C9A84C" />} label="áudios" value={totalAudios} />
          </div>
        )}

        {/* Estados */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <RefreshCw size={24} color="#C9A84C" className="animate-spin" />
          </div>
        )}

        {!loading && error && (
          <p className="text-red-500 text-sm text-center py-8">{error}</p>
        )}

        {!loading && !error && participants.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">Nenhum participante ainda.</p>
            <p className="text-gray-300 text-xs mt-1">Compartilhe o link do app para começar a receber mensagens.</p>
          </div>
        )}

        {/* Lista */}
        {!loading && participants.map((p) => (
          <ParticipantCard
            key={p.id}
            p={p}
            onDelete={(id) => setParticipants((prev) => prev.filter((x) => x.id !== id))}
          />
        ))}
      </div>
    </main>
  )
}
