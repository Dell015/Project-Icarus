import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiStartAudit, apiSubmitAnswer, apiReupload, apiGetTranscript } from '../api'
import WaxMeter from '../components/WaxMeter'

const PHASES = {
  IDLE:       'idle',
  LOADING:    'loading',
  QUESTIONING:'questioning',
  GATE:       'gate',
  COMPLETE:   'complete',
  MELTDOWN:   'meltdown',
}

const fade = (delay = 0) => ({
  initial:   { opacity: 0, y: 12 },
  animate:   { opacity: 1, y: 0 },
  exit:      { opacity: 0, y: -8 },
  transition:{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] },
})

export default function Audit() {
  const { token, logout } = useAuth()
  const navigate = useNavigate()
  const fileRef  = useRef(null)

  const [phase, setPhase]           = useState(PHASES.IDLE)
  const [session, setSession]       = useState(null)   // { session_id, filename, ... }
  const [question, setQuestion]     = useState('')
  const [hotspot, setHotspot]       = useState('')
  const [answer, setAnswer]         = useState('')
  const [feedback, setFeedback]     = useState(null)   // { result, reasoning, follow_up }
  const [wax, setWax]               = useState(0)
  const [feathers, setFeathers]     = useState(0)
  const [tokensUsed, setTokensUsed] = useState(null)
  const [provider, setProvider]     = useState('')
  const [transcript, setTranscript] = useState(null)
  const [error, setError]           = useState('')
  const [submitting, setSubmitting] = useState(false)

  // ── Upload & start ──────────────────────────────────────────────────
  async function handleUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setPhase(PHASES.LOADING)
    setFeedback(null)

    try {
      const data = await apiStartAudit(file, token)
      setSession(data)
      setQuestion(data.question)
      setHotspot(data.hotspot)
      setWax(data.wax)
      setFeathers(data.feathers)
      setTokensUsed(data.tokens_used)
      setProvider(data.provider)
      setPhase(PHASES.QUESTIONING)
    } catch (err) {
      setError(err.message)
      setPhase(PHASES.IDLE)
    }
  }

  // ── Submit answer ───────────────────────────────────────────────────
  async function handleAnswer() {
    if (!answer.trim() || submitting) return
    setSubmitting(true)
    setError('')

    try {
      const data = await apiSubmitAnswer(session.session_id, answer, token)
      setFeedback({ result: data.result, reasoning: data.reasoning, follow_up: data.follow_up })
      setWax(data.wax)
      setFeathers(data.feathers)
      setTokensUsed(data.tokens_used)
      setProvider(data.provider || provider)
      setAnswer('')

      if (data.status === 'meltdown') {
        setPhase(PHASES.MELTDOWN)
      } else if (data.status === 'gate_locked') {
        setPhase(PHASES.GATE)
      } else if (data.status === 'complete') {
        const tx = await apiGetTranscript(session.session_id, token)
        setTranscript(tx)
        setPhase(PHASES.COMPLETE)
      } else {
        // Next question after short delay
        setTimeout(() => {
          setQuestion(data.next_question)
          setHotspot(data.next_hotspot)
          setFeedback(null)
        }, 2200)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // ── Reupload after gate ─────────────────────────────────────────────
  async function handleReupload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setPhase(PHASES.LOADING)

    try {
      const data = await apiReupload(session.session_id, file, token)
      setQuestion(data.next_question)
      setHotspot(data.next_hotspot)
      setWax(data.wax)
      setFeathers(data.feathers)
      setTokensUsed(data.tokens_used)
      setFeedback(null)
      setPhase(PHASES.QUESTIONING)
    } catch (err) {
      setError(err.message)
      setPhase(PHASES.GATE)
    }
  }

  function reset() {
    setPhase(PHASES.IDLE)
    setSession(null)
    setQuestion('')
    setHotspot('')
    setAnswer('')
    setFeedback(null)
    setWax(0)
    setFeathers(0)
    setTokensUsed(null)
    setTranscript(null)
    setError('')
  }

  // ── RENDER ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-void flex flex-col">

      {/* Nav */}
      <nav className="flex justify-between items-center px-4 md:px-6 py-4 border-b border-smoke">
        <button onClick={() => navigate('/')} className="font-serif text-xl text-ember tracking-widest">
          ICARUS
        </button>
        <button onClick={() => { logout(); navigate('/auth') }}
          className="font-mono text-xs text-mist hover:text-bone transition-colors tracking-widest uppercase">
          Sign Out
        </button>
      </nav>

      <div className="flex-1 flex flex-col md:flex-row">

        {/* Sidebar — metrics */}
        <aside className="md:w-64 border-b md:border-b-0 md:border-r border-smoke p-4 space-y-4">
          <WaxMeter wax={wax} feathers={feathers} tokensUsed={tokensUsed} provider={provider} />

          {session && (
            <motion.div {...fade(0)} className="border border-smoke bg-ash p-4 space-y-2">
              <div className="font-mono text-xs text-mist tracking-widest uppercase mb-3">Session</div>
              <Row label="File"   value={session.filename} />
              <Row label="Domain" value={session.domain} />
              <Row label="Flight" value={session.flight || 1} />
            </motion.div>
          )}
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-8 flex flex-col max-w-2xl mx-auto w-full">
          <AnimatePresence mode="wait">

            {/* IDLE — upload */}
            {phase === PHASES.IDLE && (
              <motion.div key="idle" {...fade()} className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="text-5xl mb-6 animate-flicker">🪶</div>
                <h2 className="font-serif text-3xl text-bone mb-3">Upload your work.</h2>
                <p className="font-mono text-xs text-mist mb-8 max-w-sm leading-relaxed">
                  Code, thesis, pitch deck, or any document that represents your thinking.
                  Icarus will find what you need to defend.
                </p>
                <input ref={fileRef} type="file" onChange={handleUpload} className="hidden"
                  accept=".py,.js,.ts,.jsx,.tsx,.md,.txt,.pdf,.docx,.csv" />
                <button onClick={() => fileRef.current?.click()}
                  className="px-8 py-3 bg-ember text-void font-mono text-xs tracking-widest uppercase font-medium hover:bg-bone transition-all duration-300">
                  Choose File
                </button>
                <p className="font-mono text-xs text-mist mt-4">
                  .py · .js · .ts · .md · .txt · .pdf · .docx
                </p>
                {error && <ErrorBox>{error}</ErrorBox>}
              </motion.div>
            )}

            {/* LOADING */}
            {phase === PHASES.LOADING && (
              <motion.div key="loading" {...fade()} className="flex-1 flex flex-col items-center justify-center text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="text-4xl mb-6"
                >🪶</motion.div>
                <p className="font-mono text-xs text-mist tracking-widest uppercase">
                  Scanning your wings...
                </p>
              </motion.div>
            )}

            {/* QUESTIONING */}
            {phase === PHASES.QUESTIONING && (
              <motion.div key="questioning" {...fade()} className="flex-1 flex flex-col gap-6">
                <div>
                  <span className="font-mono text-xs text-mist tracking-widest uppercase">Hotspot</span>
                  <p className="font-serif text-sm text-ember mt-1 italic">{hotspot}</p>
                </div>

                <div className="border-l-2 border-ember pl-4">
                  <span className="font-mono text-xs text-mist tracking-widest uppercase block mb-2">Icarus asks</span>
                  <p className="font-serif text-xl text-bone leading-relaxed">{question}</p>
                </div>

                {/* Feedback from previous answer */}
                <AnimatePresence>
                  {feedback && (
                    <motion.div {...fade()} className={`border p-4 ${
                      feedback.result === 'golden_feather' ? 'border-yellow-500 bg-yellow-950/20' :
                      feedback.result === 'pass'           ? 'border-feather bg-feather/5' :
                                                            'border-wax bg-wax/5'
                    }`}>
                      <div className="font-mono text-xs tracking-widest uppercase mb-2" style={{
                        color: feedback.result === 'golden_feather' ? '#eab308' :
                               feedback.result === 'pass'           ? 'var(--feather)' : 'var(--wax)'
                      }}>
                        {feedback.result === 'golden_feather' ? '✨ Golden Feather Earned' :
                         feedback.result === 'pass'           ? '🪶 Feather Earned' : '🕯 Wax Added'}
                      </div>
                      <p className="font-mono text-xs text-mist leading-relaxed">{feedback.reasoning}</p>
                      {feedback.follow_up && (
                        <p className="font-mono text-xs text-ember mt-2 italic">↳ {feedback.follow_up}</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-auto">
                  <label className="font-mono text-xs text-mist tracking-widest uppercase block mb-2">
                    Your Answer
                  </label>
                  <textarea
                    value={answer}
                    onChange={e => setAnswer(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleAnswer() }}
                    rows={5}
                    className="w-full bg-ash border border-smoke text-bone font-mono text-sm px-4 py-3 focus:outline-none focus:border-ember transition-colors resize-none"
                    placeholder="Explain your reasoning. Be specific. Icarus does not accept vague answers."
                  />
                  <div className="flex justify-between items-center mt-1">
                    <span className="font-mono text-xs text-mist">⌘ + Enter to submit</span>
                    <span className="font-mono text-xs text-mist">{answer.length} chars</span>
                  </div>
                  <button
                    onClick={handleAnswer}
                    disabled={submitting || !answer.trim()}
                    className="w-full mt-3 py-3 bg-ember text-void font-mono text-xs tracking-widest uppercase font-medium hover:bg-bone transition-all duration-300 disabled:opacity-40"
                  >
                    {submitting ? 'Evaluating...' : 'Submit Answer'}
                  </button>
                  {error && <ErrorBox>{error}</ErrorBox>}
                </div>
              </motion.div>
            )}

            {/* GATE LOCKED */}
            {phase === PHASES.GATE && (
              <motion.div key="gate" {...fade()} className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="text-5xl mb-6">🔒</div>
                <h2 className="font-serif text-3xl text-wax mb-3 glow-wax">Gate Locked.</h2>
                <p className="font-mono text-xs text-mist max-w-sm leading-relaxed mb-8">
                  Two consecutive failed defenses. Icarus has identified a structural gap in your understanding.
                  Revise your work and re-upload to continue.
                </p>
                <div className="border border-wax bg-wax/5 px-6 py-4 mb-8 max-w-sm w-full text-left">
                  <div className="font-mono text-xs text-wax tracking-widest uppercase mb-2">What to do</div>
                  <p className="font-mono text-xs text-mist leading-relaxed">
                    Open your file. Address the understanding gap that the questions revealed.
                    Make real changes — not cosmetic ones. Icarus checks.
                  </p>
                </div>
                <input ref={fileRef} type="file" onChange={handleReupload} className="hidden"
                  accept=".py,.js,.ts,.jsx,.tsx,.md,.txt,.pdf,.docx,.csv" />
                <button onClick={() => fileRef.current?.click()}
                  className="px-8 py-3 border border-wax text-wax font-mono text-xs tracking-widest uppercase hover:bg-wax hover:text-void transition-all duration-300">
                  Re-Upload Revised File
                </button>
                {error && <ErrorBox>{error}</ErrorBox>}
              </motion.div>
            )}

            {/* MELTDOWN */}
            {phase === PHASES.MELTDOWN && (
              <motion.div key="meltdown" {...fade()} className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="text-5xl mb-6">☀️</div>
                <h2 className="font-serif text-3xl text-wax mb-3 glow-wax">Project Meltdown.</h2>
                <p className="font-mono text-xs text-mist max-w-sm leading-relaxed mb-8">
                  The wax reached its limit. This is not a punishment — it is a learning plan.
                  Study the areas that caused your wings to fail, then fly again.
                </p>
                <div className="flex gap-4">
                  <button onClick={reset}
                    className="px-6 py-3 bg-wax text-void font-mono text-xs tracking-widest uppercase hover:bg-bone transition-all duration-300">
                    Try Again
                  </button>
                </div>
              </motion.div>
            )}

            {/* COMPLETE — Transcript */}
            {phase === PHASES.COMPLETE && transcript && (
              <motion.div key="complete" {...fade()} className="flex-1 flex flex-col gap-6">
                <div className="text-center">
                  <div className="text-4xl mb-4">🪶</div>
                  <h2 className="font-serif text-3xl text-bone mb-2">Defense Transcript</h2>
                  <p className="font-mono text-xs text-mist tracking-widest">{transcript.filename}</p>
                </div>

                {/* Score */}
                <div className="border border-smoke bg-ash p-6 text-center">
                  <div className={`font-serif text-6xl mb-2 ${
                    transcript.score >= 70 ? 'text-feather' :
                    transcript.score >= 40 ? 'text-ember' : 'text-wax'
                  }`}>{transcript.score}</div>
                  <div className="font-mono text-xs text-mist tracking-widest uppercase mb-3">Mastery Score</div>
                  <div className={`inline-block font-mono text-xs tracking-widest uppercase px-4 py-1 border ${
                    transcript.verdict === 'CERTIFIED'      ? 'border-feather text-feather' :
                    transcript.verdict === 'NEEDS REVISION' ? 'border-ember text-ember' :
                                                              'border-wax text-wax'
                  }`}>{transcript.verdict}</div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <Stat label="Feathers"   value={transcript.feathers} color="text-feather" />
                  <Stat label="Wax"        value={transcript.wax}      color="text-wax" />
                  <Stat label="Questions"  value={transcript.total_questions} />
                </div>
                {transcript.golden_feathers > 0 && (
                  <div className="border border-yellow-500 bg-yellow-950/20 px-4 py-3 font-mono text-xs text-yellow-400 text-center tracking-widest">
                    ✨ {transcript.golden_feathers} Golden Feather{transcript.golden_feathers > 1 ? 's' : ''} Earned
                  </div>
                )}

                {/* Q&A History */}
                <div>
                  <div className="font-mono text-xs text-mist tracking-widest uppercase mb-4">Audit Log</div>
                  <div className="space-y-4">
                    {transcript.history.map((item, i) => (
                      <div key={i} className={`border-l-2 pl-4 ${
                        item.result === 'golden_feather' ? 'border-yellow-500' :
                        item.result === 'pass'           ? 'border-feather' : 'border-wax'
                      }`}>
                        <div className="font-mono text-xs text-mist mb-1">Q{i + 1}</div>
                        <p className="font-serif text-sm text-bone mb-2">{item.question}</p>
                        <p className="font-mono text-xs text-mist mb-1 italic">"{item.answer}"</p>
                        <p className="font-mono text-xs" style={{
                          color: item.result === 'golden_feather' ? '#eab308' :
                                 item.result === 'pass'           ? 'var(--feather)' : 'var(--wax)'
                        }}>{item.reasoning}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Token usage */}
                {transcript.tokens_used && (
                  <div className="border border-smoke p-4 font-mono text-xs text-mist space-y-1">
                    <div className="flex justify-between"><span>Total tokens used</span><span>{transcript.tokens_used.total?.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>Provider</span><span>{transcript.tokens_used.provider}</span></div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={reset}
                    className="flex-1 py-3 border border-smoke text-mist font-mono text-xs tracking-widest uppercase hover:border-ember hover:text-ember transition-all duration-300">
                    New Audit
                  </button>
                  <button onClick={() => window.print()}
                    className="flex-1 py-3 bg-ember text-void font-mono text-xs tracking-widest uppercase hover:bg-bone transition-all duration-300">
                    Print / Save PDF
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between items-center">
      <span className="font-mono text-xs text-mist uppercase tracking-widest">{label}</span>
      <span className="font-mono text-xs text-bone truncate max-w-[120px]">{value}</span>
    </div>
  )
}

function Stat({ label, value, color = 'text-bone' }) {
  return (
    <div className="border border-smoke bg-ash p-4 text-center">
      <div className={`font-serif text-3xl ${color} mb-1`}>{value}</div>
      <div className="font-mono text-xs text-mist tracking-widest uppercase">{label}</div>
    </div>
  )
}

function ErrorBox({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-3 border border-wax px-4 py-3 font-mono text-xs text-wax"
    >
      {children}
    </motion.div>
  )
}