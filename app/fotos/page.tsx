'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Camera, Images } from 'lucide-react'
import PolaroidPhoto from '@/components/PolaroidPhoto'
import ProgressDots from '@/components/ProgressDots'
import DecoBackground from '@/components/DecoBackground'
import { getSession } from '@/lib/session-store'

interface PhotoPreview {
  file: File
  url: string
  uploaded: boolean
}

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: 'easeOut' as const } },
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.10 } },
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
        // silently continue — photo shown locally even if upload fails
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
          <ProgressDots total={5} current={3} />
          <h1 className="font-playfair text-xl text-text-dark mt-4">Fotos com a Sônia 😊</h1>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card p-5 text-center">
          <p className="text-text-dark text-sm leading-relaxed">
            Você também pode enviar fotos com a Sônia 😊
          </p>
          <p className="text-text-muted text-xs mt-2 leading-relaxed">
            Pode até ser uma foto antiga em papel. Basta tirar uma foto dela com a câmera do celular.
          </p>
        </motion.div>

        {/* Polaroid previews */}
        {photos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-4 justify-center py-2"
          >
            {photos.map((photo, i) => (
              <PolaroidPhoto
                key={photo.url}
                src={photo.url}
                alt={`Foto ${i + 1}`}
                rotate={rotations[i % rotations.length]}
                onRemove={() => removePhoto(i)}
              />
            ))}
          </motion.div>
        )}

        {uploading && (
          <p className="text-text-muted text-xs text-center animate-fade-in">
            Enviando fotos… 🤍
          </p>
        )}

        {/* Hidden file inputs */}
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

        {/* Upload buttons */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
          <motion.button
            onClick={() => cameraInputRef.current?.click()}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="py-4 rounded-2xl font-medium text-text-dark text-sm flex flex-col items-center gap-2 glass-card"
          >
            <Camera size={22} color="#C9A84C" strokeWidth={1.5} />
            <span>Abrir câmera</span>
          </motion.button>
          <motion.button
            onClick={() => fileInputRef.current?.click()}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="py-4 rounded-2xl font-medium text-text-dark text-sm flex flex-col items-center gap-2 glass-card"
          >
            <Images size={22} color="#C9A84C" strokeWidth={1.5} />
            <span>Escolher fotos</span>
          </motion.button>
        </motion.div>

        <motion.button
          variants={itemVariants}
          onClick={() => router.push('/audio-final')}
          disabled={uploading}
          whileHover={uploading ? {} : { scale: 1.02 }}
          whileTap={uploading ? {} : { scale: 0.97 }}
          className="w-full py-4 rounded-2xl font-medium text-white text-base shadow-lg disabled:opacity-60 shimmer-btn"
        >
          {photos.length > 0 ? 'Continuar com as fotos' : 'Pular por agora'}
        </motion.button>
      </motion.div>
    </main>
  )
}
