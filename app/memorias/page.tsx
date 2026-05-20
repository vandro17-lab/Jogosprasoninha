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

type Step = 'idle' | 'transcribing' | 'correcting' | 'thinking'

const STEP_MSG: Record<Step, string> = {
  idle: '',
  transcribing: 'Organizando sua lembrança…',
  correcting: 'Transformando suas palavras com carinho ✨',
  thinking: 'Sua mensagem está ficando linda 😊',
}

export default function MemoriasPage() {
  const router = useRouter()
  const [recording, setRecording] = useState(false)
  const [step, setStep] = useState<Step>('idle')
  const [aiResponse, setAiResponse] = useState<string | null>(null)
  const [isQuestion, setIsQuestion] = useState(false)
  const [shownTranscript, setShownTranscript] = useState('')
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
  const processing = step !== 'idle'

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
    setShownTranscript('')
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
      MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : ''
    mimeTypeRef.current = mimeType
    addLog(`Formato: ${mimeType || 'padrão'}`)

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
      addLog('Erro: sem chunks de áudio')
      setError('Não ouvi nada. Tente falar mais perto do microfone 😊')
      return
    }

    const totalKB = (chunks.reduce((s, c) => s + c.size, 0) / 1024).toFixed(1)
    addLog(`Áudio: ${chunks.length} chunks, ${totalKB}KB`)

    const mimeType = mimeTypeRef.current || 'audio/webm'
    const ext = mimeType.includes('mp4') ? 'mp4' : mimeType.includes('ogg') ? 'ogg' : 'webm'
    const blob = new Blob(chunks, { type: mimeType })

    setStep('transcribing')
    try {
      addLog('Chamando Groq Whisper...')
      const form = new FormData()
      form.append('audio', blob, `audio.${ext}`)
      const transcribeRes = await fetch('/api/transcribe', { method: 'POST', body: form })
      const transcribeData = await transcribeRes.json()
      addLog(`Groq: status=${transcribeRes.status} failed=${transcribeData.failed ?? false} text="${transcribeData.transcript?.slice(0, 60) ?? ''}" err="${transcribeData.error ?? ''}"`)

      if (transcribeData.failed || !transcribeData.transcript?.trim()) {
        addLog('Transcrição falhou — salvando áudio pendente...')
        const cs = getSession()
        const fbForm = new FormData()
        fbForm.append('file', blob, `audio.${ext}`)
        fbForm.append('participantId', cs.participantId ?? '')
        fbForm.append('tipo', 'memoria_pendente')
        const upRes = await fetch('/api/upload-audio', { method: 'POST', body: fbForm })
        addLog(`Upload fallback: status=${upRes.status}`)
        const placeholder = '[Áudio gravado — transcrição pendente]'
        const updated = [...(cs.memories ?? []), placeholder]
        saveSession({ memories: updated })
        setMemoriesCount(updated.length)
        setAudioSaved(true)
        setStep('idle')
        return
      }

      const rawTranscript = transcribeData.transcript.trim()

      setStep('correcting')
      addLog(`Corrigindo: "${rawTranscript.slice(0, 60)}"`)
      let corrected = rawTranscript
      try {
        const corrRes = await fetch('/api/correct-transcript', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcript: rawTranscript }),
        })
        const corrData = await corrRes.json()
        corrected = corrData.corrected ?? rawTranscript
        addLog(`Correção: hasChanges=${corrData.hasChanges} texto="${corrected.slice(0, 60)}"`)
      } catch (err) {
        addLog(`Correção falhou (usando original): ${err}`)
      }

      setShownTranscript(corrected)

      const cs = getSession()

      await fetch('/api/save-memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId: cs.participantId, memoriaBreita: corrected }),
      })

      setStep('thinking')
      addLog('Chamando OpenRouter (quick)...')
      const res = await fetch('/api/generate-final', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'quick', transcript: corrected, nome: cs.nome, parentesco: cs.parentesco }),
      })
      const data = await res.json()
      addLog(`IA quick: status=${res.status} isQuestion=${data.isQuestion} text="${data.response?.slice(0, 60) ?? data.error}"`)

      if (data.isQuestion) {
        setPendingTranscript(corrected)
        setIsQuestion(true)
        setAiResponse(data.response)
        setStep('idle')
        return
      }

      const updated = [...(cs.memories ?? []), corrected]
      saveSession({ memories: updated })
      setMemoriesCount(updated.length)
      setIsQuestion(false)
      setAiResponse(data.response ?? 'Que lembrança bonita 😊')
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      addLog(`Exceção: ${msg}`)
      setAiResponse('Que lembrança bonita 😊\n\nPode contar mais uma ou finalizar quando quiser.')
    } finally {
      setStep('idle')
    }
  }, [stopTimer])

  async function submitAnswer() {
    if (!answerText.trim() || !pendingTranscript) return
    setStep('thinking')
    const fullMemory = `${pendingTranscript}\n(Detalhe: ${answerText.trim()})`
    addLog(`Resposta à pergunta: "${answerText.slice(0, 60)}"`)
    const cs = getSession()

    await fetch('/api/save-memory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participantId: cs.participantId, memoriaBreita: fullMemory }),
    })

    const updated = [...(cs.memories ?? []), fullMemory]
    saveSession({ memories: updated })
    setMemoriesCount(updated.length)
    setPendingTranscript('')
    setAnswerText('')
    setIsQuestion(false)
    setAiResponse('Obrigada pelo detalhe! Ficou mais bonita ainda 🤍')
    setStep('idle')
  }

  const handleMicClick = useCallback(() => {
    if (recording) stopRecording()
    else startRecording()
  }, [recording, startRecording, stopRecording])

  async function handleFinalize() {
    const cs = getSession()
    if (!cs.memories?.length) { setError('Conta pelo menos uma lembrança antes de finalizar 😊'); return }
    setFinalizing(true)
    addLog('Chamando OpenRouter (final)...')
    try {
      const res = await fetch('/api/generate-final', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'final',
          participantId: cs.participantId,
          nome: cs.nome,
          parentesco: cs.parentesco,
          memories: cs.memories,
        }),
      })
      const data = await res.json()
      addLog(`OpenRouter final: status=${res.status} ok=${!!data.mensagemFinal}`)
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

        <div
          className="rounded-3xl p-8 flex flex-col items-center gap-6"
          style={{ background: '#FFFDF9', border: '1px solid #E8D5A3' }}
        >
          {/* Estado inicial */}
          {!recording && step === 'idle' && !aiResponse && !audioSaved && (
            <div className="text-center animate-fade-in">
              <p className="font-playfair text-xl text-text-dark">
                {memoriesCount === 0 ? `Perfeito${session.nome ? `, ${session.nome}` : ''} 😊` : 'Mais uma lembrança? 😊'}
              </p>
              <p className="text-text-muted text-sm mt-2 leading-relaxed whitespace-pre-line">
                {memoriesCount === 0
                  ? 'Agora toque no microfone e conte uma lembrança da Sônia.\n\nPode ser uma história simples… um momento engraçado… algo que marcou vocês ✨\n\nFale do seu jeito 🤍'
                  : 'Cada memória deixa essa surpresa ainda mais especial ✨'}
              </p>
            </div>
          )}

          {/* Gravando */}
          {recording && (
            <div className="text-center animate-fade-in">
              <p className="text-text-muted text-sm">🎙️ Estou te ouvindo…</p>
              <p className="font-playfair text-3xl text-gold mt-1">{formatTime(elapsed)}</p>
              {elapsed >= WARN_AT && (
                <p className="text-amber-500 text-xs mt-1">✨ Últimos 30 segundos</p>
              )}
            </div>
          )}

          {/* Processando */}
          {processing && (
            <p className="text-text-muted text-sm animate-fade-in">{STEP_MSG[step]}</p>
          )}

          {/* Fallback */}
          {audioSaved && !recording && step === 'idle' && (
            <div className="w-full text-center animate-fade-in">
              <div className="rounded-2xl p-4" style={{ background: '#F0E8D8' }}>
                <p className="text-text-dark text-sm leading-relaxed">
                  Sua gravação foi salva com carinho 🤍<br />
                  <span className="text-text-muted text-xs">Assim que possível ela será transcrita.</span>
                </p>
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

          {/* Texto corrigido + resposta da IA */}
          {aiResponse && !recording && step === 'idle' && (
            <div className="w-full animate-fade-in flex flex-col gap-3">
              {shownTranscript && (
                <div className="rounded-xl px-4 py-2" style={{ background: '#F7F3EC' }}>
                  <p className="text-text-muted text-xs mb-1">Entendi assim:</p>
                  <p className="text-text-dark text-sm italic">"{shownTranscript}"</p>
                </div>
              )}

              <div className="rounded-2xl p-4" style={{ background: '#F0E8D8' }}>
                <p className="text-text-dark text-sm leading-relaxed whitespace-pre-line text-center">
                  {aiResponse}
                </p>
              </div>

              {isQuestion && (
                <div className="flex flex-col gap-2 mt-1">
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
                      className="flex-1 py-3 rounded-xl text-sm font-medium text-gold-dark disabled:opacity-40"
                      style={{ background: '#E8D5A3' }}
                    >
                      Enviar resposta
                    </button>
                    <button
                      onClick={() => {
                        const cs = getSession()
                        const updated = [...(cs.memories ?? []), pendingTranscript]
                        saveSession({ memories: updated })
                        setMemoriesCount(updated.length)
                        setPendingTranscript('')
                        setIsQuestion(false)
                        setAiResponse('Tudo bem, guardamos como está 🤍')
                      }}
                      className="px-4 py-3 rounded-xl text-xs text-text-muted"
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

        <button
          onClick={handleFinalize}
          disabled={finalizing || recording || processing || memoriesCount === 0}
          className="w-full py-4 rounded-2xl font-medium text-gold-dark text-base transition-all duration-200 active:scale-98 disabled:opacity-40"
          style={{ background: '#F0E8D8', border: '1px solid #E8D5A3' }}
        >
          {finalizing ? 'Preparando sua mensagem…' : 'Finalizar lembranças ✓'}
        </button>

        {memoriesCount === 0 && (
          <p className="text-text-muted text-xs text-center">
            Grave pelo menos uma lembrança para continuar 😊
          </p>
        )}
      </div>
    </main>
  )
}
