'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import IntroScene from '@/components/homenagem/IntroScene'
import TributeGallery from '@/components/homenagem/TributeGallery'
import type { Homenagem } from '@/lib/homenagem-types'

const easeLuxe = [0.22, 1, 0.36, 1] as const

export default function SuaHomenagemPage() {
  const [stage, setStage] = useState<'intro' | 'gallery'>('intro')
  const [homenagens, setHomenagens] = useState<Homenagem[] | null>(null)

  // pré-carrega as homenagens enquanto a abertura toca
  useEffect(() => {
    let active = true
    fetch('/api/homenagens')
      .then((r) => r.json())
      .then((d) => { if (active) setHomenagens(d.homenagens ?? []) })
      .catch(() => { if (active) setHomenagens([]) })
    return () => { active = false }
  }, [])

  function openGallery() {
    // garante que a galeria comece do topo (e não na posição rolada da abertura)
    window.scrollTo(0, 0)
    setStage('gallery')
  }

  return (
    <main className="relative bg-pearl">
      <AnimatePresence mode="wait">
        {stage === 'intro' ? (
          <motion.div
            key="intro"
            exit={{ opacity: 0, scale: 1.06, filter: 'blur(12px)' }}
            transition={{ duration: 0.9, ease: easeLuxe }}
          >
            <IntroScene onOpen={openGallery} />
          </motion.div>
        ) : (
          <motion.div
            key="gallery"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, ease: easeLuxe }}
          >
            <TributeGallery homenagens={homenagens} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* clarão dourado de transição ao abrir o presente */}
      {stage === 'gallery' && (
        <motion.div
          aria-hidden
          className="fixed inset-0 z-[80] pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.9, 0] }}
          transition={{ duration: 1.3, ease: 'easeOut', times: [0, 0.3, 1] }}
          style={{ background: 'radial-gradient(circle at 50% 45%, rgba(255,250,235,0.96), rgba(232,213,163,0.55) 38%, transparent 75%)' }}
        />
      )}
    </main>
  )
}
