const KEY = 'sonia_debug'
const MAX = 60

export function addLog(msg: string): void {
  if (typeof window === 'undefined') return
  try {
    const ts = new Date().toLocaleTimeString('pt-BR')
    const entry = `[${ts}] ${msg}`
    const raw = localStorage.getItem(KEY)
    const logs: string[] = raw ? JSON.parse(raw) : []
    logs.unshift(entry)
    localStorage.setItem(KEY, JSON.stringify(logs.slice(0, MAX)))
  } catch {}
}

export function getLogs(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function clearLogs(): void {
  if (typeof window === 'undefined') return
  try { localStorage.removeItem(KEY) } catch {}
}
