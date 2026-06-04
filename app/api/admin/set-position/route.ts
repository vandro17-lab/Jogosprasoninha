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

  const { participantId, position } = await req.json()
  if (!participantId || !['first', 'last', 'none'].includes(position)) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }

  const supabase = getServiceClient()
  if (!supabase) return NextResponse.json({ error: 'Banco não configurado' }, { status: 500 })

  if (position === 'first') {
    await supabase.from('participants').update({ is_first: false }).neq('id', participantId)
    const { error } = await supabase
      .from('participants')
      .update({ is_first: true, is_last: false })
      .eq('id', participantId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } else if (position === 'last') {
    await supabase.from('participants').update({ is_last: false }).neq('id', participantId)
    const { error } = await supabase
      .from('participants')
      .update({ is_last: true, is_first: false })
      .eq('id', participantId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } else {
    const { error } = await supabase
      .from('participants')
      .update({ is_first: false, is_last: false })
      .eq('id', participantId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
