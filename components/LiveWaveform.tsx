'use client'

import { useEffect, useRef } from 'react'

function roundedBar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rad = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rad, y)
  ctx.arcTo(x + w, y, x + w, y + h, rad)
  ctx.arcTo(x + w, y + h, x, y + h, rad)
  ctx.arcTo(x, y + h, x, y, rad)
  ctx.arcTo(x, y, x + w, y, rad)
  ctx.closePath()
  ctx.fill()
}

export default function LiveWaveform({
  analyser,
  active,
  paused = false,
}: {
  analyser: AnalyserNode | null
  active: boolean
  paused?: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const levelsRef = useRef<number[]>([])
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    function resize() {
      const w = canvas!.clientWidth
      const h = canvas!.clientHeight
      canvas!.width = Math.max(1, Math.floor(w * dpr))
      canvas!.height = Math.max(1, Math.floor(h * dpr))
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const BAR_W = 3.5
    const GAP = 3.5
    const data = analyser ? new Uint8Array(analyser.fftSize) : null
    let frame = 0

    function draw() {
      rafRef.current = requestAnimationFrame(draw)
      frame++

      const w = canvas!.clientWidth
      const h = canvas!.clientHeight
      const barCount = Math.max(1, Math.floor(w / (BAR_W + GAP)))
      const levels = levelsRef.current

      // advance roughly every 2 frames for a calmer scroll
      if (frame % 2 === 0) {
        let level = 0.03
        if (analyser && data && active && !paused) {
          analyser.getByteTimeDomainData(data)
          let sum = 0
          for (let i = 0; i < data.length; i++) {
            const x = (data[i] - 128) / 128
            sum += x * x
          }
          level = Math.min(1, Math.sqrt(sum / data.length) * 2.6)
        } else if (paused) {
          level = (levels[levels.length - 1] ?? 0.06) * 0.96
        }
        levels.push(level)
        while (levels.length > barCount) levels.shift()
      }

      ctx!.clearRect(0, 0, w, h)
      const grad = ctx!.createLinearGradient(0, 0, 0, h)
      grad.addColorStop(0, '#F0DBA0')
      grad.addColorStop(0.55, '#C9A84C')
      grad.addColorStop(1, '#A07830')
      ctx!.fillStyle = grad
      ctx!.globalAlpha = paused ? 0.45 : 1

      const mid = h / 2
      const start = w - levels.length * (BAR_W + GAP)
      for (let i = 0; i < levels.length; i++) {
        const x = start + i * (BAR_W + GAP)
        const bh = Math.max(2.5, levels[i] * h * 0.92)
        roundedBar(ctx!, x, mid - bh / 2, BAR_W, bh, BAR_W / 2)
      }
      ctx!.globalAlpha = 1
    }
    draw()

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [analyser, active, paused])

  return <canvas ref={canvasRef} className="w-full" style={{ height: 76 }} aria-hidden />
}
