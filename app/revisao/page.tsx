'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RevisaoPage() {
  const router = useRouter()
  useEffect(() => { router.replace('/fotos') }, [])
  return null
}
