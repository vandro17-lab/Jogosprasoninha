import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient, isMockMode } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { nome, parentesco, telefone } = await req.json()

  if (isMockMode) {
    return NextResponse.json({ id: `mock-${Date.now()}` })
  }

  const supabase = getServiceClient()
  if (!supabase) {
    return NextResponse.json({ id: `mock-${Date.now()}` })
  }

  const { data, error } = await supabase
    .from('participants')
    .insert({ nome, parentesco, telefone })
    .select('id')
    .single()

  if (error) {
    console.error('save-participant error:', error)
    return NextResponse.json({ id: `mock-${Date.now()}` })
  }

  return NextResponse.json({ id: data.id })
}
