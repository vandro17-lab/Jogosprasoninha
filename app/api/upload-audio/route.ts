import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient, isMockMode } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const file = form.get('file') as File | null
  const participantId = form.get('participantId') as string | null
  const tipo = (form.get('tipo') as string | null) ?? 'final'

  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  if (isMockMode) {
    return NextResponse.json({ url: 'mock-audio-url' })
  }

  const supabase = getServiceClient()
  if (!supabase) return NextResponse.json({ url: 'mock-audio-url' })

  const path = `${participantId}/${tipo}-${Date.now()}.webm`

  const { error } = await supabase.storage
    .from('audios')
    .upload(path, file, { contentType: 'audio/webm' })

  if (error) {
    console.error('upload-audio error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data } = supabase.storage.from('audios').getPublicUrl(path)

  await supabase.from('audios').insert({
    participant_id: participantId,
    audio_url: data.publicUrl,
    tipo,
  })

  return NextResponse.json({ url: data.publicUrl })
}
