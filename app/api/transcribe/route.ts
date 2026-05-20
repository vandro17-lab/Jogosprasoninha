import { NextRequest, NextResponse } from 'next/server'

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

  if (!res.ok) {
    const err = await res.text()
    console.error('Groq transcribe error:', err)
    return NextResponse.json({ error: err }, { status: res.status })
  }

  const data = await res.json()
  return NextResponse.json({ transcript: data.text ?? '' })
}
