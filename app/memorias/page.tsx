'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import MicButton from '@/components/MicButton'
import AudioWaves from '@/components/AudioWaves'
import ProgressDots from '@/components/ProgressDots'
import { getSession, saveSession } from '@/lib/session-store'
import { addLog } from '@/lib/debug-store'

const MAX_DURATION = 120
const WARN_AT = 90

export default function MemoriasPage() {
  const router = useRouter()
  const [recording, setRecording] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [aiResponse, setAiResponse] = useState<string | null>(null)
  const [isQuestion, setIsQuestion] = useState(false)
  const [pendingTranscript, setPendingTranscript] = useState('')
  const [answerText, setAnswerText] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const [memoriesCount, setMemoriesCount] = useState(0)
  const [error, setError] = useState('')
  const [finalizing, setFinalizing] = useState(false)
  const [audioSaved, setAudioSaved] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const mimeTypeRef = useRef('audio/webm')

  const session = getSession()

  useEffect(() => {
    if (!session.nome) { router.replace('/identificacao'); return }
    setMemoriesCount(session.memories?.length ?? 0)
    addLog('Página memórias carregada')
  }, [])

  useEffect(() => {
    if (recording && elapsed >= MAX_DURATION) stopRecording()
  }, [elapsed, recording])

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }, [])

  const startRecording = useCallback(async () => {
    setError('')
    setAiResponse(null)
    setIsQuestion(false)
    setAudioSaved(false)
    setPendingTranscript('')
    setAnswerText('')
    chunksRef.current = []
    addLog('Iniciando gravação...')

    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      addLog('Microfone OK')
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      addLog(`Erro microfone: ${msg}`)
      setError('Não consegui acessar o microfone. Verifique as permissões 😊')
      return
    }
    streamRef.current = stream

    const mimeType =
      MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' :
      MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' :
      MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' :
      ''
    mimeTypeRef.current = mimeType
    addLog(`Formato: ${mimeType || 'padrão do navegador'}`)

    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {})
    mediaRecorderRef.current = recorder
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
    recorder.start(1000)

    setRecording(true)
    setElapsed(0)
    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000)
  }, [])

  const stopRecording = useCallback(async () => {
    stopTimer()
    setRecording(false)

    const recorder = mediaRecorderRef.current
    if (!recorder) return

    await new Promise<void>((resolve) => { recorder.onstop = () => resolve(); recorder.stop() })
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    mediaRecorderRef.current = null

    const chunks = chunksRef.current
    if (!chunks.length) {
      addLog('Erro: nenhum chunk de áudio capturado')
      setError('Não ouvi nada. Tente falar mais perto do microfone 😊')
      return
    }

    const totalKB = (chunks.reduce((s, c) => s + c.size, 0) / 1024).toFixed(1)
    addLog(`Áudio: ${chunks.length} chunks, ${totalKB}KB`)

    const mimeType = mimeTypeRef.current || 'audio/webm'
    const ext = mimeType.includes('mp4') ? 'mp4' : mimeType.includes('ogg') ? 'ogg' : 'webm'
    const blob = new Blob(chunks, { type: mimeType })

    setProcessing(true)
    try {
      // 1. Transcrever
      addLog('Chamando Groq Whisper...')
      const form = new FormData()
      form.append('audio', blob, `audio.${ext}`)
      const transcribeRes = await fetch('/api/transcribe', { method: 'POST', body: form })
      const transcribeData = await transcribeRes.json()

      addLog(`Groq: status=${transcribeRes.status} failed=${transcribeData.failed ?? false} text="${transcribeData.transcript?.slice(0, 50) ?? ''}" err="${transcribeData.error ?? ''}"`)

      if (transcribeData.failed || !transcribeData.transcript?.trim()) {
        // Fallback: salvar áudio
        addLog('Transcrição falhou — salvando áudio pendente...')
        const currentSession = getSession()
        const fbForm = new FormData()
        fbForm.append('file', blob, `audio.${ext}`)
        fbForm.append('participantId', currentSession.participantId ?? '')
        fbForm.append('tipo', 'memoria_pendente')
        const upRes = await fetch('/api/upload-audio', { method: 'POST', body: fbForm })
        addLog(`Upload fallback: status=${upRes.status}`)

        const placeholder = '[Áudio gravado — transcrição pendente]'
        const updatedMemories = [...(currentSession.memories ?? []), placeholder]
        saveSession({ memories: updatedMemories })
        setMemoriesCount(updatedMemories.length)
        setAudioSaved(true)
        setProcessing(false)
        return
      }

      const transcript = transcribeData.transcript
      addLog(`Transcrição: "${transcript.slice(0, 80)}"`)

      const currentSession = getSession()

      // 2. Salvar memória bruta
      await fetch('/api/save-memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId: currentSession.participantId, memoriaBreita: transcript }),
      })

      // 3. Resposta rápida do Gemini
      addLog('Chamando Gemini (quick)...')
      const res = await fetch('/api/generate-final', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'quick', transcript, nome: currentSession.nome }),
      })
      const data = await res.json()
      addLog(`Gemini quick: status=${res.status} isQuestion=${data.isQuestion} text="${data.response?.slice(0, 60) ?? data.error}"`)

      // Se o Gemini fez uma pergunta, segura a lembrança até ter a resposta
      if (data.isQuestion) {
        setPendingTranscript(transcript)
        setIsQuestion(true)
        setAiResponse(data.response)
        setProcessing(false)
        return
      }

      // 4. Salvar memória na sessão
      const updatedMemories = [...(currentSession.memories ?? []), transcript]
      saveSession({ memories: updatedMemories })
      setMemoriesCount(updatedMemories.length)
      setIsQuestion(false)
      setAiResponse(data.response ?? 'Que lembrança bonita 😊')
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      addLog(`Exceção: ${msg}`)
      setAiResponse('Que lembrança bonita 😊\n\nPode contar mais uma ou finalizar quando quiser.')
    } finally {
      setProcessing(false)
    }
  }, [stopTimer])

  async function submitAnswer() {
    if (!answerText.trim() || !pendingTranscript) return
    setProcessing(true)
    const fullMemory = `${pendingTranscript}\n(Detalhe: ${answerText.trim()})`
    addLog(`Resposta à pergunta: "${answerText.slice(0, 60)}"`)
    const currentSession = getSession()

    await fetch('/api/save-memory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participantId: currentSession.participantId, memoriaBreita: fullMemory }),
    })

    const updatedMemories = [...(currentSession.memories ?? []), fullMemory]
    saveSession({ memories: updatedMemories })
    setMemoriesCount(updatedMemories.length)
    setPendingTranscript('')
    setAnswerText('')
    setIsQuestion(false)
    setAiResponse('Obrigada pelo detalhe! Ficou mais bonita ainda 🤍')
    setProcessing(false)
  }

  const handleMicClick = useCallback(() => {
    if (recording) stopRecording()
    else startRecording()
  }, [recording, startRecording, stopRecording])

  async function handleFinalize() {
    const currentSession = getSession()
    if (!currentSession.memories?.length) {
      setError('Conta pelo menos uma lembrança antes de finalizar 😊')
      return
    }
    setFinalizing(true)
    addLog('Chamando Gemini (final)...')
    try {
      const res = await fetch('/api/generate-final', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'final',
          participantId: currentSession.participantId,
          nome: currentSession.nome,
          parentesco: currentSession.parentesco,
          memories: currentSession.memories,
        }),
      })
      const data = await res.json()
      addLog(`Gemini final: status=${res.status} ok=${!!data.mensagemFinal}`)
      if (data.error && !data.mensagemFinal) {
        setError(`Erro ao gerar mensagem: ${data.error}`)
        setFinalizing(false)
        return
      }
      saveSession({ memoriaFinal: data.mensagemFinal })
      router.push('/revisao')
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      addLog(`Erro final: ${msg}`)
      setError('Algo deu errado. Tente de novo 😊')
      setFinalizing(false)
    }
  }

  const remaining = MAX_DURATION - elapsed
  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  return (
    <main className="min-h-screen flex flex-col px-6 py-10">
      <div className="max-w-sm w-full mx-auto flex flex-col gap-6 animate-fade-in">
        <div className="text-center">
          <ProgressDots total={5} current={1} />
          {memoriesCount > 0 && (
            <p className="text-text-muted text-xs mt-3">
              {memoriesCount} {memoriesCount === 1 ? 'lembrança guardada' : 'lembranças guardadas'} 🤍
            </p>
          )}
        </div>

        {/* Card principal */}
        <div
          className="rounded-3xl p-8 flex flex-col items-center gap-6"
          style={{ background: '#FFFDF9', border: '1px solid #E8D5A3' }}
        >
          {/* Estado inicial */}
          {!recording && !processing && !aiResponse && !audioSaved && (
            <div className="text-center animate-fade-in">
              <p className="font-playfair text-xl text-text-dark">
                {memoriesCount === 0
                  ? `Perfeito${session.nome ? `, ${session.nome}` : ''} 😊`
                  : 'Mais uma? 😊'}
              </p>
              <p className="text-text-muted text-sm mt-2 leading-relaxed whitespace-pre-line">
                {memoriesCount === 0
                  ? 'Agora é só tocar no microfone e contar uma lembrança da Sônia.\n\nPode falar do seu jeito mesmo.'
                  : 'Toque no microfone para contar mais uma lembrança.'}
              </p>
            </div>
          )}

          {/* Gravando */}
          {recording && (
            <div className="text-center animate-fade-in">
              <p className="text-text-muted text-sm">Estou ouvindo…</p>
              <p className="font-playfair text-3xl text-gold mt-1">{formatTime(elapsed)}</p>
              {elapsed >= WARN_AT && (
                <p className="text-amber-500 text-xs mt-1">{remaining}s restantes</p>
              )}
            </div>
          )}

          {/* Processando */}
          {processing && (
            <p className="text-text-muted text-sm animate-fade-in">Transcrevendo sua lembrança…</p>
          )}

          {/* Fallback: áudio salvo */}
          {audioSaved && !recording && !processing && (
            <div className="w-full text-center animate-fade-in">
              <div className="rounded-2xl p-4" style={{ background: '#F0E8D8' }}>
                <p className="text-text-dark text-sm leading-relaxed">
                  Sua gravação foi salva com carinho 🤍<br />
                  <span className="text-text-muted text-xs">Assim que possível ela será transcrita.</span>
                </p>
                <p className="text-text-muted text-xs mt-2">Pode continuar ou gravar mais uma lembrança.</p>
              </div>
            </div>
          )}

          <AudioWaves active={recording} />

          {!processing && (
            <MicButton recording={recording} onClick={handleMicClick} disabled={processing || finalizing} />
          )}

          {processing && (
            <div className="w-12 h-12 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
          )}

          {/* Resposta ou pergunta do Gemini */}
          {aiResponse && !recording && !processing && (
            <div className="w-full animate-fade-in">
              <div className="rounded-2xl p-4" style={{ background: '#F0E8D8' }}>
                <p className="text-text-dark text-sm leading-relaxed whitespace-pre-line text-center">
                  {aiResponse}
                </p>
              </div>

              {/* Campo de resposta se for uma pergunta */}
              {isQuestion && (
                <div className="mt-3 flex flex-col gap-2">
                  <textarea
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    placeholder="Digite sua resposta aqui…"
                    rows={3}
                    className="w-full rounded-xl px-4 py-3 text-sm text-text-dark resize-none outline-none"
                    style={{ background: '#FFFDF9', border: '1px solid #E8D5A3' }}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={submitAnswer}
                      disabled={!answerText.trim() || processing}
                      className="flex-1 py-3 rounded-xl text-sm font-medium text-gold-dark transition-all disabled:opacity-40"
                      style={{ background: '#E8D5A3' }}
                    >
                      Enviar resposta
                    </button>
                    <button
                      onClick={() => {
                        // Pular a pergunta e salvar a memória mesmo assim
                        const currentSession = getSession()
                        const updatedMemories = [...(currentSession.memories ?? []), pendingTranscript]
                        saveSession({ memories: updatedMemories })
                        setMemoriesCount(updatedMemories.length)
                        setPendingTranscript('')
                        setIsQuestion(false)
                        setAiResponse('Tudo bem, guardamos como está 🤍')
                      }}
                      className="px-4 py-3 rounded-xl text-xs text-text-muted transition-all"
                      style={{ background: '#F0E8D8' }}
                    >
                      Pular
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {error && <p className="text-red-400 text-sm text-center animate-fade-in">{error}</p>}
        </div>

        {/* Finalizar */}
        <button
          onClick={handleFinalize}
          disabled={finalizing || recording || processing || memoriesCount === 0}
          className="w-full py-4 rounded-2xl font-medium text-gold-dark text-base transition-all duration-200 active:scale-98 disabled:opacity-40"
          style={{ background: '#F0E8D8', border: '1px solid #E8D5A3' }}
        >
          {finalizing ? 'Preparando sua mensagem…' : 'Finalizar ✓'}
        </button>

        {memoriesCount === 0 && (
          <p className="text-text-muted text-xs text-center">
            Grave pelo menos uma lembrança para finalizar
          </p>
        )}

        {/* Link para debug */}
        <a
          href="/debug"
          className="text-center text-text-muted/40 text-xs mt-1"
        >
          ver log de erros
        </a>
      </div>
    </main>
  )
}
