import { NextRequest, NextResponse } from 'next/server'
import { quickResponse, generateFinalMessage } from '@/lib/openrouter'
import { getServiceClient, isMockMode } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const body = await req.json()

  // Resposta rápida durante coleta de memória
  if (body.action === 'quick') {
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({
        response: 'Que lembrança bonita 😊\n\nPode contar mais uma ou tocar em finalizar quando quiser.',
      })
    }
    const response = await quickResponse(body.transcript)
    return NextResponse.json({ response })
  }

  // Geração da mensagem final
  if (body.action === 'final') {
    if (!process.env.OPENROUTER_API_KEY) {
      const mock = `Querida Sônia,\n\nTenho tantas lembranças bonitas de você. Você sempre foi uma pessoa especial na minha vida e carrego no coração cada momento que vivemos juntas.\n\nObrigada por tudo. Com muito carinho,\n${body.nome}`
      return NextResponse.json({ mensagemFinal: mock })
    }

    const mensagemFinal = await generateFinalMessage(body.memories, body.nome, body.parentesco)

    // Salva a mensagem final no banco
    if (!isMockMode && body.participantId && !body.participantId.startsWith('mock-')) {
      const supabase = getServiceClient()
      if (supabase) {
        await supabase.from('memories').insert({
          participant_id: body.participantId,
          memoria_bruta: body.memories.join('\n\n---\n\n'),
          memoria_final: mensagemFinal,
        })
      }
    }

    return NextResponse.json({ mensagemFinal })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
