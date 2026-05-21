'use client'

import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import useEmblaCarousel from 'embla-carousel-react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

function FramedPhoto({ src, alt, onClick, className }: { src: string; alt: string; onClick: () => void; className?: string }) {
  return (
    <button onClick={onClick} className="group block w-full overflow-hidden rounded-2xl focus-ring" style={{ boxShadow: 'var(--shadow-card)' }}>
      <div className="relative w-full overflow-hidden rounded-2xl">
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className={`w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.05] ${className ?? 'max-h-[440px]'}`}
        />
        <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 60px rgba(61,50,40,0.16)' }} />
        <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.10), transparent 30%)' }} />
      </div>
    </button>
  )
}

function Lightbox({ photos, startIndex, name, onClose }: { photos: string[]; startIndex: number; name: string; onClose: () => void }) {
  const [emblaRef, embla] = useEmblaCarousel({ startIndex, loop: photos.length > 1 })
  const [sel, setSel] = useState(startIndex)
  const [zoom, setZoom] = useState(false)

  useEffect(() => {
    if (!embla) return
    const onSel = () => { setSel(embla.selectedScrollSnap()); setZoom(false) }
    embla.on('select', onSel)
    onSel()
    return () => { embla.off('select', onSel) }
  }, [embla])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft') embla?.scrollPrev()
      else if (e.key === 'ArrowRight') embla?.scrollNext()
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [embla, onClose])

  const multi = photos.length > 1

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[90] flex items-center justify-center"
      style={{ background: 'rgba(10,8,6,0.92)', backdropFilter: 'blur(14px)' }}
      onClick={onClose}
    >
      <button
        onClick={onClose}
        aria-label="Fechar"
        className="absolute top-5 right-5 z-20 flex items-center justify-center rounded-full"
        style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)' }}
      >
        <X size={22} color="#fff" />
      </button>

      <div className="absolute top-6 left-0 right-0 z-10 text-center pointer-events-none">
        <span className="text-white/55 text-xs tracking-[0.2em] uppercase">{name}</span>
        {multi && <p className="text-white/45 text-xs mt-1">{sel + 1} / {photos.length}</p>}
      </div>

      <div className="overflow-hidden w-full h-full" ref={emblaRef} onClick={(e) => e.stopPropagation()}>
        <div className="flex h-full">
          {photos.map((p, i) => (
            <div key={i} className="min-w-0 shrink-0 grow-0 basis-full h-full flex items-center justify-center p-6">
              <motion.img
                src={p}
                alt={`Foto de ${name}`}
                onClick={() => setZoom((z) => !z)}
                animate={{ scale: zoom && i === sel ? 1.9 : 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 26 }}
                className="max-w-full max-h-[82vh] object-contain rounded-xl cursor-zoom-in select-none"
                style={{ boxShadow: '0 30px 80px -20px rgba(0,0,0,0.7)' }}
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>

      {multi && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); embla?.scrollPrev() }}
            aria-label="Foto anterior"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center rounded-full"
            style={{ width: 46, height: 46, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)' }}
          >
            <ChevronLeft size={24} color="#fff" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); embla?.scrollNext() }}
            aria-label="Próxima foto"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center rounded-full"
            style={{ width: 46, height: 46, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)' }}
          >
            <ChevronRight size={24} color="#fff" />
          </button>
        </>
      )}
    </motion.div>,
    document.body
  )
}

export default function PhotoGallery({ photos, name }: { photos: string[]; name: string }) {
  const [lightbox, setLightbox] = useState<number | null>(null)
  const [emblaRef] = useEmblaCarousel({ align: 'center', loop: false })
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const open = useCallback((i: number) => setLightbox(i), [])
  const close = useCallback(() => setLightbox(null), [])

  if (photos.length === 0) return null

  return (
    <div>
      {photos.length === 1 ? (
        <FramedPhoto src={photos[0]} alt={`Foto de ${name}`} onClick={() => open(0)} />
      ) : (
        <div>
          <div className="overflow-hidden -mx-1" ref={emblaRef}>
            <div className="flex">
              {photos.map((p, i) => (
                <div key={i} className="min-w-0 shrink-0 grow-0 basis-[82%] px-1">
                  <FramedPhoto src={p} alt={`Foto de ${name}`} onClick={() => open(i)} className="h-60" />
                </div>
              ))}
            </div>
          </div>
          <p className="text-center text-text-muted/70 text-xs mt-2.5">arraste para ver mais · toque para ampliar</p>
        </div>
      )}

      <AnimatePresence>
        {mounted && lightbox !== null && (
          <Lightbox photos={photos} startIndex={lightbox} name={name} onClose={close} />
        )}
      </AnimatePresence>
    </div>
  )
}
