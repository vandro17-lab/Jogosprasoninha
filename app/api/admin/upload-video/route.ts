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

  const form = await req.formData()
  const file = form.get('file') as File | null
  const participantId = form.get('participantId') as string | null

  if (!file || !participantId) return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })

  const supabase = getServiceClient()
  if (!supabase) return NextResponse.json({ error: 'Banco não configurado' }, { status: 500 })

  const ext = file.name.split('.').pop() ?? 'mp4'
  const path = `${participantId}/${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from('videos')
    .upload(path, file, { contentType: file.type })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data } = supabase.storage.from('videos').getPublicUrl(path)

  await supabase.from('videos').insert({
    participant_id: participantId,
    video_url: data.publicUrl,
  })

  return NextResponse.json({ url: data.publicUrl })
}
