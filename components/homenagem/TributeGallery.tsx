'use client'

import { useEffect, useRef } from 'react'
import { ReactLenis, type LenisRef } from 'lenis/react'
import { motion, useScroll, useSpring } from 'framer-motion'
import { Heart } from 'lucide-react'
import DecoBackground from '@/components/DecoBackground'
import GoldDivider from '@/components/GoldDivider'
import TributeCard from './TributeCard'
import type { Homenagem } from '@/lib/homenagem-types'

const easeLuxe = [0.22, 1, 0.36, 1] as const

function LoadingState() {
  return (
    <main className="relative min-h-[100dvh] flex flex-col items-center justify-center px-6">
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 30%, #FDFCFA 0%, #FBF0F0 55%, #F7EDD8 100%)' }} />
      <DecoBackground variant="sparkle" />
      <div className="relative z-10 flex flex-col items-center gap-5">
        <motion.span
          className="rounded-full"
          style={{ width: 46, height: 46, border: '3px solid rgba(201,168,76,0.25)', borderTopColor: '#C9A84C' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <p className="text-text-muted text-sm tracking-wide">Reunindo as homenagens…</p>
      </div>
    </main>
  )
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: easeLuxe }}
      className="glass-card-ornate p-9 text-center max-w-md"
    >
      <div className="relative" style={{ zIndex: 2 }}>
        <Heart size={28} color="#C9A84C" className="mx-auto mb-4" />
        <p className="font-playfair text-xl text-text-dark mb-2">Com muito carinho</p>
        <p className="text-text-muted text-sm leading-relaxed">
          As homenagens estão sendo preparadas com todo amor.
          <br />
          Em breve, tudo estará aqui esperando por você. 🤍
        </p>
      </div>
    </motion.div>
  )
}

export default function TributeGallery({ homenagens }: { homenagens: Homenagem[] | null }) {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 })
  const lenisRef = useRef<LenisRef>(null)

  // sempre começa do topo, mesmo que a abertura tenha ficado rolada
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  useEffect(() => {
    if (homenagens === null) return
    const raf = requestAnimationFrame(() => {
      window.scrollTo(0, 0)
      lenisRef.current?.lenis?.scrollTo(0, { immediate: true })
    })
    return () => cancelAnimationFrame(raf)
  }, [homenagens])

  if (homenagens === null) return <LoadingState />

  const count = homenagens.length

  return (
    <ReactLenis root options={{ lerp: 0.09 }} ref={lenisRef}>
      <motion.div
        aria-hidden
        className="fixed top-0 left-0 right-0 z-50 origin-left"
        style={{ height: 3, scaleX, background: 'linear-gradient(90deg, #E8D5A3, #C9A84C, #A07830)' }}
      />

      <main className="relative min-h-[100dvh] px-6 py-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 0%, #FDFCFA 0%, #FBF0F0 55%, #F7EDD8 100%)' }} />
        <DecoBackground variant="ornate" />

        <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center">
          {/* header */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: easeLuxe }}
            className="flex flex-col items-center text-center gap-3 mb-14"
          >
            <span className="tracking-luxe text-gold-dark flex items-center gap-2">
              <span aria-hidden className="inline-block w-6 h-px" style={{ background: 'linear-gradient(90deg, transparent, #C9A84C)' }} />
              Feito com amor para você
              <span aria-hidden className="inline-block w-6 h-px" style={{ background: 'linear-gradient(90deg, #C9A84C, transparent)' }} />
            </span>
            <h1 className="heading-display text-[1.9rem] sm:text-4xl text-text-dark leading-tight">
              As homenagens preparadas <br className="hidden sm:block" /> para você, <span className="text-gradient-gold">Sônia</span>
            </h1>
            {count > 0 && (
              <p className="text-text-muted text-sm">
                {count === 1 ? '1 pessoa deixou' : `${count} pessoas deixaram`} uma lembrança especial para você
              </p>
            )}
            <div className="w-full mt-3">
              <GoldDivider />
            </div>
          </motion.div>

          {count === 0 ? (
            <EmptyState />
          ) : (
            <div className="w-full flex flex-col gap-12">
              {homenagens.map((h, i) => (
                <TributeCard key={h.id} h={h} index={i} />
              ))}
            </div>
          )}

          {/* closing */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.9, ease: easeLuxe }}
            className="flex flex-col items-center text-center gap-3 mt-20"
          >
            <GoldDivider />
            <motion.div
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Heart size={22} color="#C9A84C" fill="#E8D5A3" />
            </motion.div>
            <p className="font-playfair text-lg text-text-dark">Feito com muito amor para você</p>
            <p className="text-text-muted text-sm">
              Com carinho, Evandro, Rodrigo, Rafael, Raquel e Dudu 🤍
            </p>
          </motion.div>
        </div>
      </main>
    </ReactLenis>
  )
}
