import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { getServiceClient } from '@/lib/supabase'

function makeToken(password: string) {
  return createHash('sha256').update(`admin:${password}:sonia-painel`).digest('hex')
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? ''
  const token = auth.replace('Bearer ', '')
  const validPassword = process.env.ADMIN_PASSWORD ?? ''

  if (!validPassword || token !== makeToken(validPassword)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { participantId, videoUrl } = await req.json()
  if (!participantId || !videoUrl) return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })

  const supabase = getServiceClient()
  if (!supabase) return NextResponse.json({ error: 'Banco não configurado' }, { status: 500 })

  const { error } = await supabase.from('videos').insert({
    participant_id: participantId,
    video_url: videoUrl,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
