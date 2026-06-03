'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LogOut, Users, MessageSquare, Image, Mic, RefreshCw, Phone, Clock,
  ChevronDown, ChevronUp, X, Trash2, CheckCircle2, Circle,
  Pencil, Upload, Check, Video,
} from 'lucide-react'

interface Participant {
  id: string
  nome: string
  parentesco: string
  telefone: string | null
  created_at: string
  approved: boolean
  mensagem: string | null
  fotos: string[]
  audio: string | null
  videos: string[]
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

function StatCard({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: number; highlight?: boolean }) {
  return (
    <div
      className="bg-white rounded-2xl p-4 border shadow-sm flex items-center gap-3"
      style={{ borderColor: highlight ? 'rgba(34,197,94,0.3)' : 'rgb(243,244,246)' }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: highlight ? 'rgba(34,197,94,0.1)' : 'rgba(201,168,76,0.12)' }}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-xs text-gray-400">{label}</p>
      </div>
    </div>
  )
}

function ParticipantCard({
  p,
  onDelete,
  onApprove,
  onUpdate,
}: {
  p: Participant
  onDelete: (id: string) => void
  onApprove: (id: string, approved: boolean) => void
  onUpdate: (id: string, updates: Partial<Pick<Participant, 'mensagem' | 'fotos' | 'audio' | 'videos' | 'parentesco'>>) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [lightbox, setLightbox] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [approving, setApproving] = useState(false)

  const [editingParentesco, setEditingParentesco] = useState(false)
  const [editParentesco, setEditParentesco] = useState(p.parentesco)
  const [savingParentesco, setSavingParentesco] = useState(false)

  const [editingMsg, setEditingMsg] = useState(false)
  const [editText, setEditText] = useState(p.mensagem ?? '')
  const [savingMsg, setSavingMsg] = useState(false)

  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [uploadingAudio, setUploadingAudio] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [videoProgress, setVideoProgress] = useState<number | null>(null)
  const [videoError, setVideoError] = useState<string | null>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const token = () => localStorage.getItem('admin_token') ?? ''

  async function handleDelete() {
    setDeleting(true)
    try {
      await fetch('/api/admin/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ participantId: p.id }),
      })
      onDelete(p.id)
    } catch {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  async function handleApprove() {
    setApproving(true)
    const newApproved = !p.approved
    try {
      await fetch('/api/admin/approve', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ participantId: p.id, approved: newApproved }),
      })
      onApprove(p.id, newApproved)
    } catch {
      // silently revert
    } finally {
      setApproving(false)
    }
  }

  async function handleSaveParentesco() {
    setSavingParentesco(true)
    try {
      await fetch('/api/admin/update-participant', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ participantId: p.id, parentesco: editParentesco }),
      })
      onUpdate(p.id, { parentesco: editParentesco })
      setEditingParentesco(false)
    } finally {
      setSavingParentesco(false)
    }
  }

  async function handleSaveMessage() {
    setSavingMsg(true)
    try {
      await fetch('/api/admin/update-message', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ participantId: p.id, mensagem: editText }),
      })
      onUpdate(p.id, { mensagem: editText })
      setEditingMsg(false)
    } finally {
      setSavingMsg(false)
    }
  }

  async function handleUploadPhotos(files: FileList) {
    if (!files.length) return
    setUploadingPhotos(true)
    const newUrls: string[] = []
    for (const file of Array.from(files)) {
      const form = new FormData()
      form.append('file', file)
      form.append('participantId', p.id)
      const res = await fetch('/api/admin/upload-photo', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token()}` },
        body: form,
      })
      const data = await res.json()
      if (data.url) newUrls.push(data.url)
    }
    onUpdate(p.id, { fotos: [...p.fotos, ...newUrls] })
    setUploadingPhotos(false)
    if (photoInputRef.current) photoInputRef.current.value = ''
  }

  async function handleUploadAudio(file: File) {
    setUploadingAudio(true)
    const form = new FormData()
    form.append('file', file)
    form.append('participantId', p.id)
    const res = await fetch('/api/admin/upload-audio', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token()}` },
      body: form,
    })
    const data = await res.json()
    if (data.url) onUpdate(p.id, { audio: data.url })
    setUploadingAudio(false)
    if (audioInputRef.current) audioInputRef.current.value = ''
  }

  async function handleUploadVideo(file: File) {
    setUploadingVideo(true)
    setVideoProgress(0)
    setVideoError(null)
    try {
      // 1. Pede URL assinada ao servidor (sem passar o arquivo)
      const urlRes = await fetch('/api/admin/get-upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ participantId: p.id, fileName: file.name }),
      })
      const { signedUrl, publicUrl, error: urlErr } = await urlRes.json()
      if (urlErr || !signedUrl) throw new Error(urlErr ?? 'Erro ao gerar URL')

      // 2. Upload direto para o Supabase com progresso (sem passar pelo Vercel)
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setVideoProgress(Math.round((e.loaded / e.total) * 100))
        }
        xhr.onload = () => {
          if (xhr.status < 400) {
            resolve()
          } else {
            reject(new Error(`Falha no upload (${xhr.status}): ${xhr.responseText}`))
          }
        }
        xhr.onerror = () => reject(new Error('Erro de rede'))
        xhr.open('PUT', signedUrl)
        xhr.setRequestHeader('cache-control', 'max-age=3600')
        xhr.setRequestHeader('content-type', file.type || 'video/mp4')
        xhr.send(file)
      })

      // 3. Salva a URL no banco
      await fetch('/api/admin/save-video-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ participantId: p.id, videoUrl: publicUrl }),
      })

      onUpdate(p.id, { videos: [...p.videos, publicUrl] })
    } catch (err) {
      setVideoError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setUploadingVideo(false)
      setVideoProgress(null)
      if (videoInputRef.current) videoInputRef.current.value = ''
    }
  }

  async function handleDeleteVideo(videoUrl: string) {
    await fetch('/api/admin/delete-video', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ participantId: p.id, videoUrl }),
    })
    onUpdate(p.id, { videos: p.videos.filter((v) => v !== videoUrl) })
  }

  const whatsappUrl = p.telefone
    ? `https://wa.me/55${p.telefone.replace(/\D/g, '')}`
    : null

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl overflow-hidden shadow-sm transition-all duration-300"
        style={{
          border: p.approved
            ? '1.5px solid rgba(34,197,94,0.45)'
            : '1px solid rgb(243,244,246)',
        }}
      >
        {p.approved && (
          <div
            className="px-4 py-1.5 flex items-center gap-1.5 text-xs font-medium text-green-700"
            style={{ background: 'rgba(34,197,94,0.08)', borderBottom: '1px solid rgba(34,197,94,0.15)' }}
          >
            <CheckCircle2 size={12} />
            Aprovado — aparecerá na página da Sônia
          </div>
        )}

        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold text-lg shrink-0"
                style={{ background: p.approved ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'linear-gradient(135deg, #C9A84C, #A07830)' }}
              >
                {p.nome[0].toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{p.nome}</p>
                {editingParentesco ? (
                  <div className="flex items-center gap-1 mt-0.5">
                    <input
                      autoFocus
                      value={editParentesco}
                      onChange={(e) => setEditParentesco(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSaveParentesco(); if (e.key === 'Escape') { setEditParentesco(p.parentesco); setEditingParentesco(false) } }}
                      className="text-xs border border-blue-300 rounded-lg px-2 py-0.5 w-28 focus:outline-none focus:border-blue-400"
                    />
                    <button onClick={handleSaveParentesco} disabled={savingParentesco} className="text-blue-500 hover:text-blue-700 disabled:opacity-40">
                      <Check size={13} />
                    </button>
                    <button onClick={() => { setEditParentesco(p.parentesco); setEditingParentesco(false) }} className="text-gray-300 hover:text-gray-500">
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setEditParentesco(p.parentesco); setEditingParentesco(true) }}
                    className="flex items-center gap-1 text-xs text-gray-400 capitalize hover:text-blue-500 transition-colors group"
                  >
                    {p.parentesco} da Sônia
                    <Pencil size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
              <span className="text-xs text-gray-300 flex items-center gap-1 mr-1">
                <Clock size={11} />{timeAgo(p.created_at)}
              </span>

              <button
                onClick={handleApprove}
                disabled={approving}
                title={p.approved ? 'Remover aprovação' : 'Aprovar'}
                className="p-1.5 rounded-lg transition-colors disabled:opacity-40"
                style={{
                  color: p.approved ? '#16a34a' : '#d1d5db',
                  background: p.approved ? 'rgba(34,197,94,0.08)' : 'transparent',
                }}
              >
                {p.approved ? <CheckCircle2 size={16} /> : <Circle size={16} />}
              </button>

              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                  title="Apagar"
                >
                  <Trash2 size={15} />
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
                    Não
                  </button>
                </div>
              )}
            </div>
          </div>

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
            {p.videos.length > 0 && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-orange-50 text-orange-600">
                <Video size={10} /> {p.videos.length} vídeo{p.videos.length > 1 ? 's' : ''}
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
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock size={11} /> {formatDate(p.created_at)}
                </p>

                {/* Mensagem */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Mensagem</p>
                    {!editingMsg && (
                      <button
                        onClick={() => { setEditText(p.mensagem ?? ''); setEditingMsg(true) }}
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-500 transition-colors px-1.5 py-0.5 rounded-lg hover:bg-blue-50"
                      >
                        <Pencil size={11} />
                        {p.mensagem ? 'Editar' : 'Adicionar'}
                      </button>
                    )}
                  </div>

                  {editingMsg ? (
                    <div className="flex flex-col gap-2">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={4}
                        className="w-full text-sm text-gray-700 bg-gray-50 rounded-xl p-3 border border-blue-200 focus:outline-none focus:border-blue-400 resize-none"
                        placeholder="Escreva a mensagem aqui…"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveMessage}
                          disabled={savingMsg}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-50 transition-colors"
                        >
                          <Check size={12} />
                          {savingMsg ? 'Salvando…' : 'Salvar'}
                        </button>
                        <button
                          onClick={() => { setEditText(p.mensagem ?? ''); setEditingMsg(false) }}
                          className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:bg-gray-100 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : p.mensagem ? (
                    <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-3 whitespace-pre-wrap">{p.mensagem}</p>
                  ) : (
                    <p className="text-xs text-gray-300 italic">Sem mensagem de texto</p>
                  )}
                </div>

                {/* Fotos */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fotos</p>
                    <button
                      onClick={() => photoInputRef.current?.click()}
                      disabled={uploadingPhotos}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-purple-500 transition-colors px-1.5 py-0.5 rounded-lg hover:bg-purple-50 disabled:opacity-40"
                    >
                      <Upload size={11} />
                      {uploadingPhotos ? 'Enviando…' : 'Subir fotos'}
                    </button>
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => e.target.files && handleUploadPhotos(e.target.files)}
                    />
                  </div>

                  {p.fotos.length > 0 ? (
                    <div className="flex gap-2 flex-wrap">
                      {p.fotos.map((url, i) => (
                        <button key={i} onClick={() => setLightbox(url)}>
                          <img src={url} alt={`Foto ${i + 1}`} className="w-20 h-20 rounded-xl object-cover border border-gray-100 hover:opacity-90 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-300 italic">Sem fotos</p>
                  )}
                </div>

                {/* Áudio */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Áudio</p>
                    <button
                      onClick={() => audioInputRef.current?.click()}
                      disabled={uploadingAudio}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-green-500 transition-colors px-1.5 py-0.5 rounded-lg hover:bg-green-50 disabled:opacity-40"
                    >
                      <Upload size={11} />
                      {uploadingAudio ? 'Enviando…' : p.audio ? 'Substituir áudio' : 'Subir áudio'}
                    </button>
                    <input
                      ref={audioInputRef}
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleUploadAudio(e.target.files[0])}
                    />
                  </div>

                  {p.audio ? (
                    <audio controls src={p.audio} className="w-full rounded-xl" style={{ height: 40 }} />
                  ) : (
                    <p className="text-xs text-gray-300 italic">Sem áudio</p>
                  )}
                </div>

                {/* Vídeos */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Vídeos</p>
                    <button
                      onClick={() => videoInputRef.current?.click()}
                      disabled={uploadingVideo}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-orange-500 transition-colors px-1.5 py-0.5 rounded-lg hover:bg-orange-50 disabled:opacity-40"
                    >
                      <Upload size={11} />
                      {uploadingVideo
                        ? videoProgress !== null ? `${videoProgress}%` : 'Preparando…'
                        : 'Subir vídeo'}
                    </button>
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleUploadVideo(e.target.files[0])}
                    />
                  </div>

                  {uploadingVideo && videoProgress !== null && (
                    <div className="mb-2">
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-400 rounded-full transition-all duration-200"
                          style={{ width: `${videoProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{videoProgress}% enviado</p>
                    </div>
                  )}

                  {videoError && (
                    <p className="text-xs text-red-400 mb-2">{videoError}</p>
                  )}

                  {p.videos.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {p.videos.map((url, i) => (
                        <div key={i} className="relative group">
                          <div
                            className="relative w-full overflow-hidden rounded-xl"
                            style={{ height: 220 }}
                          >
                            <video
                              controls
                              src={url}
                              className="w-full h-full"
                              style={{ objectFit: 'cover', display: 'block' }}
                            />
                          </div>
                          <button
                            onClick={() => handleDeleteVideo(url)}
                            title="Excluir vídeo"
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-300 italic">Sem vídeos</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <button className="absolute top-4 right-4 text-white" onClick={() => setLightbox(null)}>
              <X size={28} />
            </button>
            <img src={lightbox} alt="Foto ampliada" className="max-w-full max-h-[90vh] rounded-2xl object-contain" onClick={(e) => e.stopPropagation()} />
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
      const res = await fetch('/api/admin/data', { headers: { Authorization: `Bearer ${token}` } })
      if (res.status === 401) { localStorage.removeItem('admin_token'); router.replace('/admin'); return }
      const data = await res.json()
      setParticipants((data.participants ?? []).map((p: Participant) => ({ ...p, videos: p.videos ?? [] })))
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
  const totalAprovados = participants.filter((p) => p.approved).length

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-gray-800">Painel da Sônia</h1>
            <p className="text-xs text-gray-400">{participants.length} participante{participants.length !== 1 ? 's' : ''} · {totalAprovados} aprovado{totalAprovados !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchData} className="p-2 rounded-xl text-gray-400 hover:bg-gray-50 transition-colors" title="Atualizar">
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button onClick={handleLogout} className="p-2 rounded-xl text-gray-400 hover:bg-gray-50 transition-colors" title="Sair">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 flex flex-col gap-4">
        {!loading && participants.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={<Users size={18} color="#C9A84C" />} label="participantes" value={participants.length} />
            <StatCard icon={<CheckCircle2 size={18} color="#16a34a" />} label="aprovados" value={totalAprovados} highlight />
            <StatCard icon={<MessageSquare size={18} color="#C9A84C" />} label="mensagens" value={totalMensagens} />
            <StatCard icon={<Image size={18} color="#C9A84C" />} label="fotos" value={totalFotos} />
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-16">
            <RefreshCw size={24} color="#C9A84C" className="animate-spin" />
          </div>
        )}
        {!loading && error && <p className="text-red-500 text-sm text-center py-8">{error}</p>}
        {!loading && !error && participants.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">Nenhum participante ainda.</p>
            <p className="text-gray-300 text-xs mt-1">Compartilhe o link do app para começar a receber mensagens.</p>
          </div>
        )}

        {!loading && participants.map((p) => (
          <ParticipantCard
            key={p.id}
            p={p}
            onDelete={(id) => setParticipants((prev) => prev.filter((x) => x.id !== id))}
            onApprove={(id, approved) => setParticipants((prev) => prev.map((x) => x.id === id ? { ...x, approved } : x))}
            onUpdate={(id, updates) => setParticipants((prev) => prev.map((x) => x.id === id ? { ...x, ...updates } : x))}
          />
        ))}
      </div>
    </main>
  )
}
