'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Camera, Images } from 'lucide-react'
import PolaroidPhoto from '@/components/PolaroidPhoto'
import ProgressDots from '@/components/ProgressDots'
import DecoBackground from '@/components/DecoBackground'
import SectionTitle from '@/components/SectionTitle'
import { getSession } from '@/lib/session-store'

interface PhotoPreview {
  file: File
  url: string
  uploaded: boolean
}

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
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
          <ProgressDots total={5} current={3} />
          <SectionTitle
            eyebrow="Fotos"
            title="Momentos com a Sônia"
            subtitle="que merecem ser lembrados"
          />
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card-premium p-5 text-center relative">
          <div className="relative" style={{ zIndex: 2 }}>
            <p className="text-text-dark text-sm leading-relaxed">
              Você também pode enviar fotos com a Sônia 😊
            </p>
            <p className="text-text-muted text-xs mt-2 leading-relaxed">
              Pode até ser uma foto antiga em papel. Basta tirar uma foto dela com a câmera do celular.
            </p>
          </div>
        </motion.div>

        {/* Polaroid previews */}
        {photos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-wrap gap-5 justify-center py-3"
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
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 380, damping: 22 }}
            className="py-5 rounded-2xl font-medium text-text-dark text-sm flex flex-col items-center gap-2 glass-card-premium card-interactive focus-ring relative"
          >
            <span className="relative" style={{ zIndex: 2 }}>
              <span
                className="inline-flex items-center justify-center rounded-full mb-1"
                style={{
                  width: 42, height: 42,
                  background: 'linear-gradient(135deg, rgba(232,213,163,0.55) 0%, rgba(201,168,76,0.30) 100%)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.65), 0 4px 10px -4px rgba(201,168,76,0.30)',
                }}
              >
                <Camera size={22} color="#A07830" strokeWidth={1.5} />
              </span>
            </span>
            <span className="relative" style={{ zIndex: 2 }}>Abrir câmera</span>
          </motion.button>
          <motion.button
            onClick={() => fileInputRef.current?.click()}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 380, damping: 22 }}
            className="py-5 rounded-2xl font-medium text-text-dark text-sm flex flex-col items-center gap-2 glass-card-premium card-interactive focus-ring relative"
          >
            <span className="relative" style={{ zIndex: 2 }}>
              <span
                className="inline-flex items-center justify-center rounded-full mb-1"
                style={{
                  width: 42, height: 42,
                  background: 'linear-gradient(135deg, rgba(232,213,163,0.55) 0%, rgba(201,168,76,0.30) 100%)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.65), 0 4px 10px -4px rgba(201,168,76,0.30)',
                }}
              >
                <Images size={22} color="#A07830" strokeWidth={1.5} />
              </span>
            </span>
            <span className="relative" style={{ zIndex: 2 }}>Escolher fotos</span>
          </motion.button>
        </motion.div>

        <motion.button
          variants={itemVariants}
          onClick={() => router.push('/audio-final')}
          disabled={uploading}
          whileHover={uploading ? {} : { scale: 1.02, y: -1 }}
          whileTap={uploading ? {} : { scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 380, damping: 22 }}
          className="w-full py-4 rounded-2xl font-medium text-white text-base disabled:opacity-60 shimmer-btn focus-ring"
        >
          {photos.length > 0 ? 'Continuar com as fotos' : 'Pular por agora'}
        </motion.button>
      </motion.div>
    </main>
  )
}
