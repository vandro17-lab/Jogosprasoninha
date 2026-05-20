import { NextRequest, NextResponse } from 'next/server'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const SYSTEM_PROMPT = `Você é um assistente de correção de transcrições de áudio em português brasileiro.

Regras estritas:
1. Corrija palavras foneticamente erradas pelo contexto (ex: "bolo de ubar" → "bolo de fubá", "tomar caf" → "tomar café", "ela vi" → "ela veio")
2. Corrija gramática básica e pontuação
3. Preserve exatamente o jeito de falar da pessoa — não reescreva, não melhore, não expanda
4. NÃO adicione fatos, NÃO continue frases, NÃO complete histórias
5. Se uma frase cortou no meio, limpe o que existe e deixe terminar onde terminou
6. Retorne SOMENTE o texto corrigido, sem aspas, sem explicações`

async function callCorrection(transcript: string, apiKey: string): Promise<string> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://memorias-da-sonia.vercel.app',
      'X-Title': 'Memórias da Sônia',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.0-flash-exp:free',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Corrija esta transcrição:\n${transcript}` },
      ],
      max_tokens: 300,
      temperature: 0.2,
    }),
  })

  if (!res.ok) throw new Error(`OpenRouter ${res.status}: ${await res.text()}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content?.trim() ?? transcript
}

export async function POST(req: NextRequest) {
  const { transcript } = await req.json()

  if (!transcript?.trim()) {
    return NextResponse.json({ corrected: transcript ?? '', hasChanges: false })
  }

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return NextResponse.json({ corrected: transcript, hasChanges: false })
  }

  let corrected = transcript
  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt > 0) await sleep(2000)
    try {
      corrected = await callCorrection(transcript, apiKey)
      // Remove aspas caso o modelo tenha adicionado
      corrected = corrected.replace(/^["'""]|["'""]$/g, '').trim()
      break
    } catch (err) {
      console.error(`Correction attempt ${attempt + 1} failed:`, err)
    }
  }

  const hasChanges = corrected.trim().toLowerCase() !== transcript.trim().toLowerCase()
  return NextResponse.json({ corrected, hasChanges })
}
