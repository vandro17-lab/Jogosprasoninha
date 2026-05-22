import { ImageResponse } from 'next/og'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function GET() {
  const imgData = readFileSync(join(process.cwd(), 'public', 'sonia.jpg'))
  const base64 = Buffer.from(imgData).toString('base64')
  // File is PNG despite the .jpg extension
  const imgSrc = `data:image/png;base64,${base64}`

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          position: 'relative',
          backgroundColor: '#1a0e04',
          overflow: 'hidden',
        }}
      >
        {/* Full-bleed photo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt=""
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            width: '66%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 12%',
          }}
        />

        {/* Warm gradient overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(90deg, #1a0e04 32%, rgba(26,14,4,0.88) 50%, rgba(26,14,4,0.42) 68%, rgba(26,14,4,0.10) 82%, transparent 100%)',
            display: 'flex',
          }}
        />

        {/* Vignette */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.18) 0%, transparent 20%, transparent 78%, rgba(0,0,0,0.32) 100%)',
            display: 'flex',
          }}
        />

        {/* Text */}
        <div
          style={{
            position: 'absolute',
            left: 72,
            top: 0,
            bottom: 0,
            width: 560,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: 20,
              color: '#C9A84C',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              marginBottom: 24,
              fontFamily: 'Georgia, serif',
            }}
          >
            59 anos • 2026
          </div>

          <div
            style={{
              fontSize: 68,
              fontWeight: 700,
              color: '#FDFAF5',
              lineHeight: 1.18,
              letterSpacing: '-0.01em',
              fontFamily: 'Georgia, serif',
            }}
          >
            Uma homenagem especial para Soninha ❤️
          </div>

          <div
            style={{
              width: 64,
              height: 2,
              backgroundColor: '#C9A84C',
              borderRadius: 2,
              marginTop: 28,
              marginBottom: 24,
            }}
          />

          <div
            style={{
              fontSize: 28,
              color: '#D4B896',
              lineHeight: 1.45,
              fontFamily: 'Georgia, serif',
            }}
          >
            Deixe sua mensagem, memória ou carinho.
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
