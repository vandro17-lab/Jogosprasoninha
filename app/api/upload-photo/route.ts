import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient, isMockMode } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const file = form.get('file') as File | null
  const participantId = form.get('participantId') as string | null

  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  if (isMockMode) {
    return NextResponse.json({ url: 'mock-photo-url' })
  }

  const supabase = getServiceClient()
  if (!supabase) return NextResponse.json({ url: 'mock-photo-url' })

  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${participantId}/${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from('photos')
    .upload(path, file, { contentType: file.type })

  if (error) {
    console.error('upload-photo error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data } = supabase.storage.from('photos').getPublicUrl(path)

  // Salva referência no banco
  await supabase.from('photos').insert({
    participant_id: participantId,
    photo_url: data.publicUrl,
  })

  return NextResponse.json({ url: data.publicUrl })
}
