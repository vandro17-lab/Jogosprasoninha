import { NextResponse } from 'next/server'
import { getServiceClient, supabase, isMockMode } from '@/lib/supabase'
import type { Homenagem } from '@/lib/homenagem-types'

export const dynamic = 'force-dynamic'

// Mensagens de demonstração — só aparecem quando o Supabase não está
// configurado (modo mock / preview local). Em produção, com o banco ligado,
// estas são ignoradas e apenas as homenagens aprovadas no painel aparecem.
const MOCK: Homenagem[] = [
  {
    id: 'mock-1',
    nome: 'Geni',
    parentesco: 'irmã',
    mensagem:
      'Soninha, minha irmã querida. Lembra quando éramos meninas e corríamos pelo quintal da casa da vovó? Você sempre foi a mais corajosa, a que cuidava de todo mundo. Hoje eu te olho e vejo a mesma menina de olhos brilhantes, só que agora cheia de histórias lindas pra contar. Te amo mais do que as palavras conseguem dizer. Feliz aniversário, minha eterna companheira. 🤍',
    fotos: ['/sonia.jpg'],
    audio: null,
  },
  {
    id: 'mock-2',
    nome: 'Patrícia',
    parentesco: 'amiga',
    mensagem:
      'Sônia, sua amizade é um dos presentes mais bonitos da minha vida. Obrigada por tanto carinho ao longo de todos esses anos. Que esse novo ano seja leve, doce e cheio de momentos felizes. ✨',
    fotos: [],
    audio: null,
  },
  {
    id: 'mock-3',
    nome: 'Rafael',
    parentesco: 'filho',
    mensagem:
      'Mãe, você é o nosso porto seguro. Tudo o que sou hoje tem a sua mão, o seu colo e o seu amor. Feliz aniversário. Te amo infinitamente.',
    fotos: ['/sonia.jpg', '/sonia.jpg'],
    audio: null,
  },
]

export async function GET() {
  if (isMockMode) {
    return NextResponse.json({ homenagens: MOCK })
  }

  const client = getServiceClient() ?? supabase
  if (!client) return NextResponse.json({ homenagens: [] })

  const { data: participants } = await client
    .from('participants')
    .select('id, nome, parentesco, created_at, approved')
    .eq('approved', true)
    .order('created_at', { ascending: true })

  if (!participants?.length) return NextResponse.json({ homenagens: [] })

  const ids = participants.map((p) => p.id)

  const [{ data: memories }, { data: photos }, { data: audios }] = await Promise.all([
    client.from('memories').select('participant_id, memoria_bruta, memoria_final').in('participant_id', ids),
    client.from('photos').select('participant_id, photo_url').in('participant_id', ids),
    client.from('audios').select('participant_id, audio_url, tipo').in('participant_id', ids),
  ])

  const homenagens: Homenagem[] = participants.map((p) => {
    const mem = (memories ?? []).find((m) => m.participant_id === p.id)
    const aud =
      (audios ?? []).find((a) => a.participant_id === p.id && a.tipo === 'final') ??
      (audios ?? []).find((a) => a.participant_id === p.id)
    return {
      id: p.id,
      nome: p.nome,
      parentesco: p.parentesco ?? null,
      mensagem: mem?.memoria_final ?? mem?.memoria_bruta ?? null,
      fotos: (photos ?? []).filter((ph) => ph.participant_id === p.id).map((ph) => ph.photo_url),
      audio: aud?.audio_url ?? null,
    }
  })

  return NextResponse.json({ homenagens })
}
