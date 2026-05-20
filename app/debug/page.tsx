'use client'

import { useState, useEffect } from 'react'
import { getLogs, clearLogs } from '@/lib/debug-store'

export default function DebugPage() {
  const [logs, setLogs] = useState<string[]>([])

  useEffect(() => { setLogs(getLogs()) }, [])

  return (
    <main className="min-h-screen p-4" style={{ background: '#0d0d0d' }}>
      <div className="max-w-sm mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-green-400 font-mono text-sm font-bold">Log de Erros</h1>
          <button
            onClick={() => { clearLogs(); setLogs([]) }}
            className="text-red-400 text-xs font-mono px-2 py-1 border border-red-800 rounded"
          >
            limpar
          </button>
        </div>
        <button
          onClick={() => setLogs(getLogs())}
          className="text-green-600 text-xs font-mono mb-3 block"
        >
          ↻ atualizar
        </button>
        <div className="font-mono text-xs text-green-300 leading-relaxed space-y-1">
          {logs.length === 0
            ? <p className="text-gray-600">nenhum log registrado</p>
            : logs.map((l, i) => (
              <div key={i} className="border-b border-gray-800 py-1 break-all">{l}</div>
            ))
          }
        </div>
      </div>
    </main>
  )
}
