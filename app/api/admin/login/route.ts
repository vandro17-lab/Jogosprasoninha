import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'

function makeToken(password: string) {
  return createHash('sha256').update(`admin:${password}:sonia-painel`).digest('hex')
}

export async function POST(req: NextRequest) {
  const { username, password } = await req.json()

  const validPassword = process.env.ADMIN_PASSWORD ?? ''

  if (!validPassword) {
    return NextResponse.json({ error: 'Painel não configurado' }, { status: 500 })
  }

  if (username !== 'admin' || password !== validPassword) {
    return NextResponse.json({ error: 'Usuário ou senha incorretos' }, { status: 401 })
  }

  return NextResponse.json({ token: makeToken(validPassword) })
}
