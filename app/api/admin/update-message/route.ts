import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { getServiceClient } from '@/lib/supabase'

function makeToken(password: string) {
  return createHash('sha256').update(`admin:${password}:sonia-painel`).digest('hex')
}

export async function PATCH(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? ''
  const token = auth.replace('Bearer ', '')
  const validPassword = process.env.ADMIN_PASSWORD ?? ''

  if (!validPassword || token !== makeToken(validPassword)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { participantId, mensagem } = await req.json()
  if (!participantId) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

  const supabase = getServiceClient()
  if (!supabase) return NextResponse.json({ error: 'Banco não configurado' }, { status: 500 })

  const { data: existing } = await supabase
    .from('memories')
    .select('id')
    .eq('participant_id', participantId)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from('memories')
      .update({ memoria_bruta: mensagem })
      .eq('participant_id', participantId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } else {
    const { error } = await supabase
      .from('memories')
      .insert({ participant_id: participantId, memoria_bruta: mensagem })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
