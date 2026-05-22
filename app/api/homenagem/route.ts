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

  const [{ data: memories }, { data: photos }, { data: audios }] = await Promise.all([
    supabase.from('memories').select('*').in('participant_id', ids),
    supabase.from('photos').select('*').in('participant_id', ids),
    supabase.from('audios').select('*').in('participant_id', ids),
  ])

  const result = participants.map((p) => ({
    id: p.id,
    nome: p.nome,
    parentesco: p.parentesco,
    mensagem: (memories ?? []).find((m) => m.participant_id === p.id)?.memoria_bruta ?? null,
    fotos: (photos ?? []).filter((ph) => ph.participant_id === p.id).map((ph) => ph.photo_url),
    audio: (audios ?? []).find((a) => a.participant_id === p.id && a.tipo === 'final')?.audio_url ?? null,
  }))

  return NextResponse.json({ participants: result })
}
