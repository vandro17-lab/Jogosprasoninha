export interface Homenagem {
  id: string
  nome: string
  parentesco: string | null
  mensagem: string | null
  fotos: string[]
  audio: string | null
}
