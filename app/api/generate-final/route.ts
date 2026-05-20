import { NextRequest, NextResponse } from 'next/server'
import { quickResponse, generateFinalMessage } from '@/lib/openrouter'
import { getServiceClient, isMockMode } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const body = await req.json()

  if (body.action === 'quick') {
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({
        isQuestion: false,
        response: 'Que lembrança bonita 😊\n\nPode contar mais uma ou tocar em finalizar.',
      })
    }
    try {
      const result = await quickResponse(body.transcript, body.nome ?? '')
      return NextResponse.json({ isQuestion: result.isQuestion, response: result.text })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('generate-final quick error:', msg)
      return NextResponse.json({
        isQuestion: false,
        response: 'Que lembrança bonita 😊',
        error: msg,
      })
    }
  }

  if (body.action === 'final') {
    if (!process.env.OPENROUTER_API_KEY) {
      const mock = `Querida Sônia,\n\nTenho tantas lembranças bonitas de você. Obrigada por tudo.\n\nCom amor, ${body.nome}`
      return NextResponse.json({ mensagemFinal: mock })
    }
    try {
      const mensagemFinal = await generateFinalMessage(body.memories, body.nome, body.parentesco)

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
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('generate-final final error:', msg)
      return NextResponse.json({ mensagemFinal: '', error: msg }, { status: 502 })
    }
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
