const FREE_MODEL = 'google/gemini-2.0-flash-exp:free'
const QUALITY_MODEL = 'google/gemini-2.5-flash-lite'

const SYSTEM_PROMPT = `Você é um assistente criado EXCLUSIVAMENTE para guardar lembranças da Sônia para o aniversário dela.

Regras absolutas:
- Mantenha foco total na Sônia. Se a pessoa sair do assunto, responda APENAS: "Desculpe 😊 Fui criado apenas para guardar lembranças da Sônia."
- Nunca invente fatos ou detalhes que a pessoa não mencionou
- Nunca faça múltiplas perguntas de uma vez
- Nunca dê conselhos, filosofe ou aprofunde demais
- Suas respostas devem ser curtas, calorosas e naturais
- Nunca insista para a pessoa falar mais`

async function callOpenRouter(model: string, messages: { role: string; content: string }[]) {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY não configurada')
  }

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://memorias-da-sonia.vercel.app',
      'X-Title': 'Banco de Memórias da Sônia',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      max_tokens: 300,
      temperature: 0.7,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenRouter error: ${err}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}

export async function quickResponse(transcript: string): Promise<string> {
  const messages = [
    {
      role: 'user',
      content: `A pessoa acabou de falar esta lembrança sobre a Sônia:\n\n"${transcript}"\n\nResponda de forma curta, calorosa e natural (máximo 2 frases). Depois diga que ela pode contar mais uma lembrança ou finalizar.`,
    },
  ]

  try {
    return await callOpenRouter(FREE_MODEL, messages)
  } catch {
    return 'Que lembrança bonita 😊\n\nSe quiser, pode contar mais uma lembrança. Ou pode tocar em finalizar quando estiver pronta.'
  }
}

export async function generateFinalMessage(
  memories: string[],
  nome: string,
  parentesco: string
): Promise<string> {
  const memoriesText = memories.map((m, i) => `${i + 1}. ${m}`).join('\n')

  const messages = [
    {
      role: 'user',
      content: `${nome} (${parentesco} da Sônia) compartilhou estas lembranças:\n\n${memoriesText}\n\nCrie uma mensagem para a Sônia que:
- Esteja em primeira pessoa (como se ${nome} tivesse escrito)
- Seja natural e preserve o jeito dela falar
- Seja calorosa e emotiva sem exagerar
- Não invente fatos que não foram mencionados
- Tenha entre 3 e 5 parágrafos curtos
- Comece com "Sônia," ou "Querida Sônia,"

Retorne APENAS a mensagem, sem introduções ou explicações.`,
    },
  ]

  return await callOpenRouter(QUALITY_MODEL, messages)
}
