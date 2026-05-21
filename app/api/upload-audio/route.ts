import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient, isMockMode } from '@/lib/supabase'

function extFor(mime: string, fallback: string) {
  if (mime.includes('mp4') || mime.includes('m4a') || mime.includes('aac')) return 'm4a'
  if (mime.includes('ogg')) return 'ogg'
  if (mime.includes('mpeg') || mime.includes('mp3')) return 'mp3'
  if (mime.includes('wav')) return 'wav'
  if (mime.includes('webm')) return 'webm'
  return fallback || 'webm'
}

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const file = form.get('file') as File | null
  const participantId = form.get('participantId') as string | null
  const tipo = (form.get('tipo') as string | null) ?? 'final'
  const extHint = (form.get('ext') as string | null) ?? ''

  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  if (isMockMode) {
    return NextResponse.json({ url: 'mock-audio-url' })
  }

  const supabase = getServiceClient()
  if (!supabase) return NextResponse.json({ url: 'mock-audio-url' })

  const contentType = file.type || 'audio/webm'
  const ext = extHint || extFor(contentType, 'webm')
  const path = `${participantId}/${tipo}-${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from('audios')
    .upload(path, file, { contentType })

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
