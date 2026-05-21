import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { getServiceClient } from '@/lib/supabase'

function makeToken(password: string) {
  return createHash('sha256').update(`admin:${password}:sonia-painel`).digest('hex')
}

export async function DELETE(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? ''
  const token = auth.replace('Bearer ', '')
  const validPassword = process.env.ADMIN_PASSWORD ?? ''

  if (!validPassword || token !== makeToken(validPassword)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { participantId } = await req.json()
  if (!participantId) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

  const supabase = getServiceClient()
  if (!supabase) return NextResponse.json({ error: 'Banco não configurado' }, { status: 500 })

  // Busca arquivos para deletar do storage
  const [{ data: photos }, { data: audios }] = await Promise.all([
    supabase.from('photos').select('photo_url').eq('participant_id', participantId),
    supabase.from('audios').select('audio_url').eq('participant_id', participantId),
  ])

  // Remove arquivos do storage
  const photosPaths = (photos ?? []).map((p) => {
    const url = new URL(p.photo_url)
    return url.pathname.split('/photos/')[1]
  }).filter(Boolean)

  const audiosPaths = (audios ?? []).map((a) => {
    const url = new URL(a.audio_url)
    return url.pathname.split('/audios/')[1]
  }).filter(Boolean)

  if (photosPaths.length > 0) {
    await supabase.storage.from('photos').remove(photosPaths)
  }
  if (audiosPaths.length > 0) {
    await supabase.storage.from('audios').remove(audiosPaths)
  }

  // Remove registros do banco (ordem: filhos antes do pai)
  await supabase.from('photos').delete().eq('participant_id', participantId)
  await supabase.from('audios').delete().eq('participant_id', participantId)
  await supabase.from('memories').delete().eq('participant_id', participantId)
  await supabase.from('participants').delete().eq('id', participantId)

  return NextResponse.json({ ok: true })
}
