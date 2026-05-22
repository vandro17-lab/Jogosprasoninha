import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const baseUrl = new URL(request.url).origin
  const soniaUrl = `${baseUrl}/sonia.jpg`

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
        {/* Full-bleed photo (right side) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={soniaUrl}
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

        {/* Cinematic warm gradient overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(90deg, #1a0e04 32%, rgba(26,14,4,0.88) 50%, rgba(26,14,4,0.42) 68%, rgba(26,14,4,0.10) 82%, transparent 100%)',
            display: 'flex',
          }}
        />

        {/* Subtle vignette top/bottom */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.18) 0%, transparent 20%, transparent 78%, rgba(0,0,0,0.32) 100%)',
            display: 'flex',
          }}
        />

        {/* Text block */}
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
            gap: 0,
          }}
        >
          {/* Eyebrow label */}
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

          {/* Main title */}
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

          {/* Divider */}
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

          {/* Subtitle */}
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
