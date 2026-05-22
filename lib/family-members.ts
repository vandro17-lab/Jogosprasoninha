export interface FamilyMember {
  parentesco: string
  contexto?: string
}

// Edite este arquivo para adicionar ou corrigir os familiares pré-cadastrados
// A chave é o primeiro nome em minúsculas (sem acentos também funciona)
export const FAMILY_MEMBERS: Record<string, FamilyMember> = {
  'rafael': { parentesco: 'filho', contexto: 'filho da Sônia' },
  'rodrigo': { parentesco: 'filho', contexto: 'filho da Sônia' },
  'geni': { parentesco: 'irmã', contexto: 'irmã da Sônia' },
  'patricia': { parentesco: 'amiga', contexto: 'amiga da Sônia' },
  'patrícia': { parentesco: 'amiga', contexto: 'amiga da Sônia' },
  'claudia': { parentesco: 'amiga', contexto: 'amiga da Sônia' },
  'cláudia': { parentesco: 'amiga', contexto: 'amiga da Sônia' },
  'raquel': { parentesco: 'nora', contexto: 'nora da Sônia' },
}

export function findFamilyMember(nome: string): FamilyMember | null {
  const normalized = nome.trim().toLowerCase()
  return FAMILY_MEMBERS[normalized] ?? null
}
