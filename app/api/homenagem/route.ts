import { NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

export async function GET() {
  const supabase = getServiceClient()

  if (!supabase) {
    return NextResponse.json({ participants: [] })
  }

  const { data: participants } = await supabase
    .from('participants')
    .select('*')
    .eq('approved', true)
    .order('created_at', { ascending: true })

  if (!participants?.length) return NextResponse.json({ participants: [] })

  const ids = participants.map((p) => p.id)

  const [{ data: memories }, { data: photos }, { data: audios }, { data: videos }] = await Promise.all([
    supabase.from('memories').select('*').in('participant_id', ids),
    supabase.from('photos').select('*').in('participant_id', ids),
    supabase.from('audios').select('*').in('participant_id', ids),
    supabase.from('videos').select('*').in('participant_id', ids),
  ])

  const result = participants.map((p) => ({
    id: p.id,
    nome: p.nome,
    parentesco: p.parentesco,
    telefone: p.telefone ?? null,
    is_first: p.is_first ?? false,
    is_last: p.is_last ?? false,
    mensagem: (memories ?? []).find((m) => m.participant_id === p.id)?.memoria_bruta ?? null,
    fotos: (photos ?? []).filter((ph) => ph.participant_id === p.id).map((ph) => ph.photo_url),
    audio: (audios ?? []).find((a) => a.participant_id === p.id && a.tipo === 'final')?.audio_url ?? null,
    videos: (videos ?? []).filter((v) => v.participant_id === p.id).map((v) => v.video_url),
  }))

  // Ordering: is_first first, then by created_at (already sorted), then is_last last
  const sorted = [...result].sort((a, b) => {
    if (a.is_first && !b.is_first) return -1
    if (!a.is_first && b.is_first) return 1
    if (a.is_last && !b.is_last) return 1
    if (!a.is_last && b.is_last) return -1
    return 0
  })

  return NextResponse.json({ participants: sorted })
}
