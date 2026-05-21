import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { getServiceClient } from '@/lib/supabase'

function makeToken(password: string) {
  return createHash('sha256').update(`admin:${password}:sonia-painel`).digest('hex')
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? ''
  const token = auth.replace('Bearer ', '')
  const validPassword = process.env.ADMIN_PASSWORD ?? ''

  if (!validPassword || token !== makeToken(validPassword)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const supabase = getServiceClient()
  if (!supabase) return NextResponse.json({ error: 'Banco não configurado' }, { status: 500 })

  const { data: participants } = await supabase
    .from('participants')
    .select('*')
    .order('created_at', { ascending: false })

  if (!participants?.length) return NextResponse.json({ participants: [] })

  const ids = participants.map((p) => p.id)

  const [{ data: memories }, { data: photos }, { data: audios }] = await Promise.all([
    supabase.from('memories').select('*').in('participant_id', ids),
    supabase.from('photos').select('*').in('participant_id', ids),
    supabase.from('audios').select('*').in('participant_id', ids),
  ])

  const result = participants.map((p) => ({
    ...p,
    mensagem: (memories ?? []).find((m) => m.participant_id === p.id)?.memoria_bruta ?? null,
    fotos: (photos ?? []).filter((ph) => ph.participant_id === p.id).map((ph) => ph.photo_url),
    audio: (audios ?? []).find((a) => a.participant_id === p.id && a.tipo === 'final')?.audio_url ?? null,
  }))

  return NextResponse.json({ participants: result })
}
