import type { Metadata } from 'next'
import { Playfair_Display, Inter, Poppins } from 'next/font/google'
import './globals.css'
import DisablePWA from '@/components/DisablePWA'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-poppins',
  display: 'swap',
})

// VERCEL_PROJECT_PRODUCTION_URL = stable domain (same across deploys)
// VERCEL_URL                   = per-deploy URL (changes every push)
const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000')

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: 'Uma homenagem especial para Soninha ❤️',
  description: 'Deixe sua mensagem, memória ou carinho.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
  openGraph: {
    title: 'Uma homenagem especial para Soninha ❤️',
    description: 'Deixe sua mensagem, memória ou carinho.',
    type: 'website',
    locale: 'pt_BR',
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'Uma homenagem especial para Soninha',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Uma homenagem especial para Soninha ❤️',
    description: 'Deixe sua mensagem, memória ou carinho.',
    images: ['/api/og'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${playfair.variable} ${inter.variable} ${poppins.variable}`}>
      <head>
        {/* Explicitly remove any web app manifest to prevent install eligibility */}
        <meta name="mobile-web-app-capable" content="no" />
        <meta name="apple-mobile-web-app-capable" content="no" />
      </head>
      <body className="min-h-screen bg-pearl">
        <DisablePWA />
        {children}
      </body>
    </html>
  )
}
