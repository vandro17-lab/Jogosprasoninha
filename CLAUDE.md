# Memórias da Sônia — Instruções para o assistente

## Projeto
Aplicativo Next.js para coletar mensagens, fotos e áudios de familiares e amigos da Sônia como presente de aniversário.

Repositório: `vandro17-lab/Jogosprasoninha`
Branch principal: `main`

## Fluxo de deploy (IMPORTANTE)

O Vercel está configurado de forma que pushes para `main` sobem como **Preview**, não como Produção automática.

**O dono do projeto faz o deploy manualmente:**
1. As alterações são feitas e enviadas para o `main` do GitHub
2. O Vercel cria um deploy de Preview automaticamente
3. O dono acessa o painel do Vercel e promove manualmente o deploy para Produção

**Não tente corrigir isso nem mudar configurações do Vercel.** É assim que funciona e o dono sabe fazer a promoção.

## Fluxo das páginas

```
Home → Identificação → Mensagem (texto) → Fotos → Áudio final → Obrigado
```

- **Mensagem**: entrada de texto livre, sem gravação, sem IA, sem transcrição
- **Fotos**: opcional, botão "Pular" se não quiser enviar
- **Áudio final**: recado de voz opcional para a Sônia ouvir no aniversário
- **Revisão** (`/revisao`): redireciona para `/fotos` — etapa removida do fluxo

## Stack
- Next.js 15.5.18 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Framer Motion
- Lucide React
- Supabase (opcional — app funciona sem ele em modo mock)
