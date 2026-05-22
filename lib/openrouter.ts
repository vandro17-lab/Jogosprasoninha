export type QuickResult = { isQuestion: boolean; text: string }

const QUICK_MODEL = 'google/gemini-2.0-flash-exp:free'
const FALLBACK_MODEL = 'openrouter/free'
const FINAL_MODEL = 'google/gemini-2.5-flash-lite'

const SYSTEM_PROMPT = `Você é um assistente criado EXCLUSIVAMENTE para guardar lembranças da Sônia para o aniversário de 59 anos dela.

Regras absolutas:
- Foco total na Sônia. Se a pessoa sair do assunto, responda APENAS: "Desculpe 😊 Fui criado apenas para guardar lembranças da Sônia."
- Nunca invente fatos ou detalhes que a pessoa não mencionou
- Nunca faça múltiplas perguntas de uma vez
- Respostas curtas, calorosas e naturais
- Nunca insista para a pessoa falar mais`

// Deriva o gênero gramatical a partir do parentesco escolhido
function deriveGender(parentesco: string): string {
  const feminine = ['filha', 'amiga', 'irmã', 'sobrinha', 'prima', 'pastora', 'nora', 'madrinha', 'avó', 'tia', 'mãe']
  return feminine.some((f) => parentesco.toLowerCase().includes(f)) ? 'feminino' : 'masculino'
}

async function callOpenRouter(
  model: string,
  messages: { role: string; content: string }[],
  maxTokens = 300
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('OPENROUTER_API_KEY não configurada')

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://memorias-da-sonia.vercel.app',
      'X-Title': 'Memórias da Sônia',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenRouter ${model} error ${res.status}: ${err}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}

export async function quickResponse(transcript: string, nome: string, parentesco: string): Promise<QuickResult> {
  const genero = deriveGender(parentesco)
  const prompt = `${nome} (${parentesco} da Sônia, gênero ${genero}) compartilhou esta lembrança já corrigida:
"${transcript}"

Analise a lembrança:
- Se está suficientemente clara → responda com 1-2 frases carinhosas reconhecendo o que foi dito. Não invente nada. Use concordância de gênero ${genero} ao se referir a ${nome}.
- Se está muito vaga ou incompleta → faça UMA pergunta gentil e específica para obter mais detalhes.

Responda APENAS com JSON válido, sem markdown:
{"isQuestion": false, "text": "frase carinhosa"}
ou
{"isQuestion": true, "text": "pergunta gentil"}`

  const messages = [{ role: 'user', content: prompt }]

  for (const model of [QUICK_MODEL, FALLBACK_MODEL]) {
    try {
      const raw = await callOpenRouter(model, messages, 150)
      const match = raw.match(/\{[\s\S]*?"isQuestion"[\s\S]*?\}/)
      if (match) {
        const parsed = JSON.parse(match[0])
        if (typeof parsed.isQuestion === 'boolean' && typeof parsed.text === 'string') {
          return parsed
        }
      }
      if (raw.trim()) return { isQuestion: false, text: raw.trim() }
    } catch (err) {
      console.error(`quickResponse ${model} falhou:`, err)
    }
  }

  return { isQuestion: false, text: 'Que lembrança bonita 😊\n\nPode contar mais uma ou tocar em finalizar.' }
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

  const genero = deriveGender(parentesco)
  const memoriesText = valid.map((m, i) => `${i + 1}. ${m}`).join('\n')

  const messages = [
    {
      role: 'user',
      content: `${nome} é ${parentesco} da Sônia (gênero ${genero}) e compartilhou estas lembranças reais e já corrigidas:

${memoriesText}

Escreva uma mensagem de aniversário para a Sônia que:
- Use SOMENTE os fatos das lembranças acima. Não invente nada.
- Esteja em primeira pessoa (como se ${nome} tivesse escrito)
- Use concordância de gênero ${genero} corretamente ao se referir a ${nome} (ex: "fui criada/criado", "estou feliz", "sou sua filha/filho")
- Preserve o jeito simples e carinhoso de falar
- Tenha entre 3 e 5 parágrafos curtos
- Comece com "Querida Sônia," ou "Sônia,"
- Termine com "Com amor, ${nome}"

Retorne APENAS a mensagem, sem explicações.`,
    },
  ]

  return callOpenRouter(FINAL_MODEL, messages, 450)
}
