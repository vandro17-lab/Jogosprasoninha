'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PolaroidPhoto from '@/components/PolaroidPhoto'
import ProgressDots from '@/components/ProgressDots'
import { getSession } from '@/lib/session-store'

interface PhotoPreview {
  file: File
  url: string
  uploaded: boolean
}

export default function FotosPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const [photos, setPhotos] = useState<PhotoPreview[]>([])
  const [uploading, setUploading] = useState(false)
  const [participantId, setParticipantId] = useState<string | null>(null)

  useEffect(() => {
    const s = getSession()
    if (!s.nome) { router.replace('/identificacao'); return }
    setParticipantId(s.participantId)
  }, [])

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return

    const newPhotos = Array.from(files).map((file) => ({
      file,
      url: URL.createObjectURL(file),
      uploaded: false,
    }))
    setPhotos((prev) => [...prev, ...newPhotos])

    setUploading(true)
    for (const photo of newPhotos) {
      try {
        const form = new FormData()
        form.append('file', photo.file)
        form.append('participantId', participantId ?? 'unknown')
        await fetch('/api/upload-photo', { method: 'POST', body: form })
        photo.uploaded = true
      } catch {
        // silently continue — photo is shown locally even if upload fails
      }
    }
    setUploading(false)
  }

  function removePhoto(index: number) {
    setPhotos((prev) => {
      const updated = [...prev]
      URL.revokeObjectURL(updated[index].url)
      updated.splice(index, 1)
      return updated
    })
  }

  const rotations = [-3, 2, -1, 3, -2, 1]

  return (
    <main className="min-h-screen flex flex-col px-6 py-10">
      <div className="max-w-sm w-full mx-auto flex flex-col gap-6 animate-fade-in">
        <div className="text-center">
          <ProgressDots total={5} current={3} />
          <h1 className="font-playfair text-xl text-text-dark mt-4">Fotos com a Sônia 😊</h1>
        </div>

        {/* Texto */}
        <div
          className="rounded-2xl p-5 text-center"
          style={{ background: '#FFFDF9', border: '1px solid #E8D5A3' }}
        >
          <p className="text-text-dark text-sm leading-relaxed">
            Você também pode enviar fotos com a Sônia 😊
          </p>
          <p className="text-text-muted text-xs mt-2 leading-relaxed">
            Pode até ser uma foto antiga em papel. Basta tirar uma foto dela com a câmera do celular.
          </p>
        </div>

        {/* Preview polaroid */}
        {photos.length > 0 && (
          <div className="flex flex-wrap gap-4 justify-center py-2 animate-fade-in">
            {photos.map((photo, i) => (
              <PolaroidPhoto
                key={photo.url}
                src={photo.url}
                alt={`Foto ${i + 1}`}
                rotate={rotations[i % rotations.length]}
                onRemove={() => removePhoto(i)}
              />
            ))}
          </div>
        )}

        {uploading && (
          <p className="text-text-muted text-xs text-center animate-fade-in">
            Enviando fotos… 🤍
          </p>
        )}

        {/* Inputs ocultos */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {/* Botões de upload */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="py-4 rounded-2xl font-medium text-text-dark text-sm transition-all duration-200 active:scale-98 flex flex-col items-center gap-1"
            style={{ background: '#FFFDF9', border: '1px solid #E8D5A3' }}
          >
            <span className="text-2xl">📷</span>
            <span>Abrir câmera</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="py-4 rounded-2xl font-medium text-text-dark text-sm transition-all duration-200 active:scale-98 flex flex-col items-center gap-1"
            style={{ background: '#FFFDF9', border: '1px solid #E8D5A3' }}
          >
            <span className="text-2xl">🖼️</span>
            <span>Escolher fotos</span>
          </button>
        </div>

        {/* Continuar */}
        <button
          onClick={() => router.push('/audio-final')}
          disabled={uploading}
          className="w-full py-4 rounded-2xl font-medium text-white text-base transition-all duration-200 active:scale-98 shadow-lg disabled:opacity-60"
          style={{
            background: 'linear-gradient(135deg, #C9A84C 0%, #A07830 100%)',
            boxShadow: '0 4px 20px rgba(201,168,76,0.35)',
          }}
        >
          {photos.length > 0 ? 'Continuar com as fotos' : 'Pular por agora'}
        </button>
      </div>
    </main>
  )
}
