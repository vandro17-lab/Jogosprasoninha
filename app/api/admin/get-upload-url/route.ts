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

  const { participantId, fileName } = await req.json()
  if (!participantId || !fileName) return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })

  const supabase = getServiceClient()
  if (!supabase) return NextResponse.json({ error: 'Banco não configurado' }, { status: 500 })

  const ext = (fileName.split('.').pop() ?? 'mp4').toLowerCase()
  const path = `${participantId}/${Date.now()}.${ext}`

  const { data, error } = await supabase.storage
    .from('videos')
    .createSignedUploadUrl(path)

  if (error || !data) return NextResponse.json({ error: error?.message ?? 'Erro ao gerar URL' }, { status: 500 })

  const { data: pub } = supabase.storage.from('videos').getPublicUrl(path)

  return NextResponse.json({ signedUrl: data.signedUrl, publicUrl: pub.publicUrl })
}
