import { NextRequest, NextResponse } from 'next/server'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function callGroq(audio: File, apiKey: string): Promise<string> {
  const groqForm = new FormData()
  groqForm.append('file', audio)
  groqForm.append('model', 'whisper-large-v3-turbo')
  groqForm.append('language', 'pt')
  groqForm.append('response_format', 'json')

  const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: groqForm,
  })

  if (!res.ok) throw new Error(await res.text())
  const data = await res.json()
  return data.text ?? ''
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'GROQ_API_KEY não configurada' }, { status: 500 })
  }

  const formData = await req.formData()
  const audio = formData.get('audio') as File | null
  if (!audio || audio.size === 0) {
    return NextResponse.json({ error: 'Áudio vazio' }, { status: 400 })
  }

  // Tenta até 3 vezes com backoff: imediato, 2s, 4s
  const delays = [0, 2000, 4000]
  let lastError = ''

  for (let i = 0; i < delays.length; i++) {
    if (delays[i] > 0) await sleep(delays[i])
    try {
      const transcript = await callGroq(audio, apiKey)
      return NextResponse.json({ transcript })
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err)
      console.error(`Groq tentativa ${i + 1} falhou:`, lastError)
    }
  }

  // Todas as tentativas falharam — sinaliza para o cliente fazer fallback
  return NextResponse.json({ transcript: '', failed: true, error: lastError }, { status: 502 })
}
