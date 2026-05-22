const MODEL = 'gemini-2.0-flash'
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`

async function call(prompt: string, maxTokens = 400): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY não configurada')

  const res = await fetch(`${API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.8, maxOutputTokens: maxTokens },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini ${res.status}: ${err}`)
  }

  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}

export type QuickResult = { isQuestion: boolean; text: string }

export async function quickResponse(transcript: string, nome: string): Promise<QuickResult> {
  const prompt = `Você ajuda a coletar lembranças para a homenagem de aniversário da Sônia (59 anos).

${nome} compartilhou esta lembrança:
"${transcript}"

Regras:
- Se a lembrança está clara o suficiente, responda com 1-2 linhas carinhosas reconhecendo o que foi dito. Não invente nada.
- Se a lembrança está muito vaga ou incompleta para virar uma mensagem bonita, faça UMA pergunta gentil e específica para entender melhor.
- Nunca invente fatos ou detalhes.

Responda APENAS com JSON válido (sem markdown, sem texto extra):
{"isQuestion": false, "text": "frase carinhosa aqui"}
ou
{"isQuestion": true, "text": "pergunta gentil aqui"}`

  try {
    const raw = await call(prompt, 150)
    const match = raw.match(/\{[\s\S]*?"isQuestion"[\s\S]*?\}/)
    if (match) {
      const parsed = JSON.parse(match[0])
      if (typeof parsed.isQuestion === 'boolean' && typeof parsed.text === 'string') {
        return parsed
      }
    }
  } catch (err) {
    console.error('Gemini quickResponse error:', err)
  }
  return { isQuestion: false, text: 'Que lembrança bonita 😊' }
}

export async function generateFinalMessage(
  memories: string[],
  nome: string,
  parentesco: string
): Promise<string> {
  const valid = memories.filter((m) => !m.startsWith('[Áudio'))
  if (!valid.length) {
    return `Querida Sônia,\n\nFeliz aniversário com muito carinho!\n\nCom amor, ${nome}`
  }

  const prompt = `Escreva uma mensagem de aniversário para Sônia (59 anos), de ${nome} (${parentesco || 'familiar'}).

Lembranças reais compartilhadas por ${nome}:
${valid.map((m, i) => `${i + 1}. ${m}`).join('\n')}

Regras absolutas:
- Use SOMENTE os fatos das lembranças acima. Não invente nada.
- Se algum detalhe estiver ambíguo, prefira omitir a inventar.
- Primeira pessoa (${nome} escreve para Sônia)
- Tom carinhoso e pessoal, preserve o jeito simples de falar
- 4 a 8 linhas
- Comece com "Querida Sônia," ou "Sônia,"
- Termine com "Com amor, ${nome}"

Escreva apenas a mensagem. Sem títulos, sem explicações.`

  return call(prompt, 450)
}
