'use client'

export interface SessionData {
  participantId: string | null
  nome: string
  parentesco: string
  telefone: string
  memories: string[]
  memoriaFinal: string
}

const KEY = 'sonia_session'

const defaultSession: SessionData = {
  participantId: null,
  nome: '',
  parentesco: '',
  telefone: '',
  memories: [],
  memoriaFinal: '',
}

export function getSession(): SessionData {
  if (typeof window === 'undefined') return { ...defaultSession }
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...defaultSession }
    return { ...defaultSession, ...JSON.parse(raw) }
  } catch {
    return { ...defaultSession }
  }
}

export function saveSession(data: Partial<SessionData>): void {
  if (typeof window === 'undefined') return
  const current = getSession()
  localStorage.setItem(KEY, JSON.stringify({ ...current, ...data }))
}

export function clearSession(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(KEY)
}
