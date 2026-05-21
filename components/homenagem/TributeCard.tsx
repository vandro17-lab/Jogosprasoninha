'use client'

import { motion } from 'framer-motion'
import FloralOrnament from '@/components/FloralOrnament'
import PhotoGallery from './PhotoGallery'
import ExpandableMessage from './ExpandableMessage'
import PremiumAudioPlayer from './PremiumAudioPlayer'
import type { Homenagem } from '@/lib/homenagem-types'

const easeLuxe = [0.22, 1, 0.36, 1] as const

function relationLabel(parentesco: string | null) {
  if (!parentesco) return 'para a Sônia'
  const p = parentesco.trim().toLowerCase()
  return `${p} da Sônia`
}

export default function TributeCard({ h, index }: { h: Homenagem; index: number }) {
  const initial = (h.nome?.[0] ?? '♥').toUpperCase()

  return (
    <motion.article
      initial={{ opacity: 0, y: 44 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.9, ease: easeLuxe, delay: (index % 3) * 0.05 }}
      className="relative w-full"
    >
      <FloralOrnament position="tl" size={46} tone={index % 2 === 0 ? 'gold' : 'rose'} opacity={0.45} />
      <FloralOrnament position="br" size={46} tone={index % 2 === 0 ? 'gold' : 'rose'} opacity={0.45} />

      <div className="glass-card-premium card-interactive p-6 sm:p-7 relative">
        <div className="relative flex flex-col gap-5" style={{ zIndex: 2 }}>
          {/* header */}
          <div className="flex items-center gap-3.5">
            <div
              className="shrink-0 flex items-center justify-center rounded-full text-white font-playfair"
              style={{
                width: 50,
                height: 50,
                fontSize: '1.35rem',
                background: 'linear-gradient(135deg, #E8D5A3 0%, #C9A84C 55%, #9C7228 100%)',
                boxShadow: '0 1px 0 rgba(255,255,255,0.45) inset, 0 6px 16px rgba(201,168,76,0.4)',
              }}
            >
              {initial}
            </div>
            <div className="min-w-0">
              <h3 className="font-playfair text-xl text-text-dark leading-tight truncate">{h.nome}</h3>
              <p className="tracking-luxe text-gold-dark" style={{ fontSize: '0.62rem' }}>{relationLabel(h.parentesco)}</p>
            </div>
          </div>

          {h.fotos.length > 0 && <PhotoGallery photos={h.fotos} name={h.nome} />}

          {h.mensagem && <ExpandableMessage text={h.mensagem} />}

          {h.audio && (
            <div className="flex flex-col gap-2">
              <span className="tracking-luxe text-gold-dark" style={{ fontSize: '0.6rem' }}>Um recado de voz</span>
              <PremiumAudioPlayer src={h.audio} />
            </div>
          )}
        </div>
      </div>
    </motion.article>
  )
}
