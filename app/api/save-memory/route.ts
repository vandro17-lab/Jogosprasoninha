import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient, isMockMode } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { participantId, memoriaBreita, memoriaFinal } = await req.json()

  if (isMockMode) {
    return NextResponse.json({ ok: true })
  }

  const supabase = getServiceClient()
  if (!supabase) return NextResponse.json({ ok: true })

  const { error } = await supabase.from('memories').insert({
    participant_id: participantId,
    memoria_bruta: memoriaBreita,
    memoria_final: memoriaFinal ?? null,
  })

  if (error) console.error('save-memory error:', error)

  return NextResponse.json({ ok: true })
}
