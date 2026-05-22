'use client'

import { useEffect } from 'react'

export default function DisablePWA() {
  useEffect(() => {
    const block = (e: Event) => e.preventDefault()
    window.addEventListener('beforeinstallprompt', block)
    return () => window.removeEventListener('beforeinstallprompt', block)
  }, [])

  return null
}
