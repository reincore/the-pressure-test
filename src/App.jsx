import { useState, useEffect, useRef, useCallback } from 'react'
import { CheckCircle, AlertCircle, ChevronDown, ChevronUp, Trash2, Loader2, ExternalLink, Clock } from 'lucide-react'

// ─── Constants ────────────────────────────────────────────────────────────────

const LS_KEY_API = 'pressure_test_gemini_key'
const LS_KEY_HISTORY = 'pressure_test_history'
const MAX_HISTORY = 15

const POSTURES = {
  trusted: {
    label: 'Trusted Friend',
    description: 'Honest pre-mortem from someone who cares',
    systemPrompt: `You are a trusted, brilliant friend with no stake in the user's success. Give an honest pre-mortem. Rules: start with a one-sentence gut reaction (never sycophantic). Identify 2-3 real-world risks. Name blind spots. End with a verdict: Proceed / Refine / Reconsider. Tone: warm but direct.

Format your response using exactly these bold markdown headers on their own lines:

**First Reaction**
[your gut reaction here]

**What Could Go Wrong**
[2-3 real-world risks]

**What You're Not Seeing**
[blind spots]

**My Honest Verdict**
[Proceed / Refine / Reconsider — with brief reasoning]`,
  },
  socratic: {
    label: 'Socratic',
    description: 'Surface weak assumptions as labeled questions',
    systemPrompt: `You are a Socratic interlocutor. Never say the user is wrong directly. Identify the 3-5 weakest assumptions and surface them as labeled questions. Use these labels where appropriate: [Empirical Claim], [Hidden Assumption], [Scope Problem], [Motivated Reasoning], [Causal Claim], [Definitional Problem]. End with a Core Question — the single question that most undermines the position. Note what holds up.

Format your response using exactly these bold markdown headers on their own lines:

**Pressure Points**
[labeled questions, one per line]

**Core Question**
[the single most undermining question]

**What Actually Holds Up**
[what is genuinely strong in the argument]`,
  },
  devils: {
    label: "Devil's Advocate",
    description: 'The strongest possible case against your position',
    systemPrompt: `You are a serious intellectual opponent, not a contrarian. Steelman first (one sentence). Then construct the strongest possible case against. Identify the Fatal Assumption — the single assumption that, if wrong, collapses the argument. Note briefly where the user is right.

Format your response using exactly these bold markdown headers on their own lines:

**The Steelman**
[one sentence steelman of the position]

**The Case Against**
[the strongest possible counterargument]

**The Fatal Assumption**
[the single assumption that, if wrong, collapses everything]

**Where You're Actually Right**
[brief acknowledgment of genuine strengths]`,
  },
}

const EXAMPLES = [
  {
    label: 'Tech & Society',
    text: 'Social media has made democracy structurally impossible. Attention markets are fundamentally incompatible with deliberative reasoning — you cannot build a healthy public sphere on infrastructure optimized for outrage and engagement.',
  },
  {
    label: 'Startup Idea',
    text: "I'm going to build a subscription service for premium physical mail — hand-selected long-form reading delivered weekly to your door. One curated essay, printed and bound, from writers who matter. People are exhausted by screens and will pay for something tangible and slow.",
  },
  {
    label: 'Academic Reform',
    text: 'Universities should abolish letter grades entirely and replace them with portfolio-based competency assessments. Grades measure compliance and test-taking, not learning. A portfolio system would better prepare students for actual professional work and reduce anxiety-driven studying.',
  },
  {
    label: 'Career Change',
    text: "I'm leaving my stable senior engineering job to write a book about epistemic humility in the tech industry. I have the savings to sustain myself for 18 months, a clear outline, and a growing audience. The timing has never been better — the industry needs this conversation.",
  },
  {
    label: 'Urban Policy',
    text: 'Cities should ban private cars from all residential streets and redesign them as pedestrian-only zones within 10 years. The health, safety, and community benefits vastly outweigh the inconvenience. Every city that has tried this has seen quality of life improve dramatically.',
  },
]

// ─── API ──────────────────────────────────────────────────────────────────────

async function callGemini(apiKey, systemPrompt, userInput) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: userInput }] }],
        generationConfig: { temperature: 0.9 },
      }),
    }
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    if (res.status === 429) throw Object.assign(new Error('Quota exceeded'), { code: 'QUOTA' })
    if (res.status === 400) throw Object.assign(new Error(err?.error?.message || 'Bad request'), { code: 'BAD_REQUEST' })
    if (res.status === 403) throw Object.assign(new Error('Invalid API key'), { code: 'BAD_KEY' })
    throw Object.assign(new Error(err?.error?.message || 'Request failed'), { code: 'NETWORK' })
  }

  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw Object.assign(new Error('Empty response from API'), { code: 'EMPTY' })
  return text
}

// ─── Markdown renderer ────────────────────────────────────────────────────────

function renderMarkdown(text) {
  const lines = text.split('\n')
  const elements = []
  let key = 0

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) {
      elements.push(<div key={key++} className="md-spacer" />)
      continue
    }

    // Bold header lines: **...**
    const headerMatch = trimmed.match(/^\*\*(.+)\*\*$/)
    if (headerMatch) {
      elements.push(
        <h3 key={key++} className="md-header">
          {headerMatch[1]}
        </h3>
      )
      continue
    }

    // Inline bold within text
    const html = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    elements.push(
      <p key={key++} className="md-para" dangerouslySetInnerHTML={{ __html: html }} />
    )
  }

  return elements
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ApiKeyBar({ apiKey, onKeyChange }) {
  const [draft, setDraft] = useState(apiKey)

  const commit = () => onKeyChange(draft.trim())

  return (
    <div className="api-bar">
      <input
        type="password"
        className="api-input"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') { commit(); e.target.blur() } }}
        placeholder="Paste your Gemini API key to get started"
        spellCheck={false}
        autoComplete="off"
      />
      <a
        href="https://aistudio.google.com/app/apikey"
        target="_blank"
        rel="noopener noreferrer"
        className="api-link"
      >
        Get one free <ExternalLink size={10} />
      </a>
    </div>
  )
}

function PostureSelector({ posture, onChange }) {
  return (
    <div className="posture-selector">
      {Object.entries(POSTURES).map(([key, { label, description }]) => (
        <button
          key={key}
          className={`posture-btn ${posture === key ? 'posture-btn--active' : ''}`}
          onClick={() => onChange(key)}
        >
          <span className="posture-btn-label">{label}</span>
          <span className="posture-btn-desc">{description}</span>
        </button>
      ))}
    </div>
  )
}

function ExamplePicker({ onSelect }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="example-picker" ref={ref}>
      <button className="btn-ghost btn-sm" onClick={() => setOpen(o => !o)}>
        Try an example {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>
      {open && (
        <div className="example-dropdown">
          {EXAMPLES.map((ex, i) => (
            <button
              key={i}
              className="example-item"
              onClick={() => { onSelect(ex.text); setOpen(false) }}
            >
              <span className="example-label">{ex.label}</span>
              <span className="example-preview">{ex.text.slice(0, 60)}…</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ErrorCard({ error, onDismiss }) {
  const configs = {
    no_key: {
      icon: <Key size={16} />,
      title: 'API key required',
      message: 'Set your Gemini API key using the field at the top of the page.',
    },
    QUOTA: {
      icon: <AlertCircle size={16} />,
      title: 'Quota exceeded',
      message: 'You have exceeded your Gemini API quota. Wait a moment or check your usage at Google AI Studio.',
    },
    BAD_KEY: {
      icon: <AlertCircle size={16} />,
      title: 'Invalid API key',
      message: 'Your API key was rejected. Check that it is correct and has access to the Gemini API.',
    },
    NETWORK: {
      icon: <AlertCircle size={16} />,
      title: 'Network error',
      message: 'Could not reach the Gemini API. Check your connection and try again.',
    },
    EMPTY: {
      icon: <AlertCircle size={16} />,
      title: 'Empty response',
      message: 'The API returned no content. Try again.',
    },
    generic: {
      icon: <AlertCircle size={16} />,
      title: 'Something went wrong',
      message: error.message || 'An unexpected error occurred.',
    },
  }

  const cfg = configs[error.code] || configs.generic

  return (
    <div className="error-card">
      <div className="error-card-header">
        <span className="error-icon">{cfg.icon}</span>
        <span className="error-title">{cfg.title}</span>
        <button className="error-dismiss" onClick={onDismiss}>×</button>
      </div>
      <p className="error-message">{cfg.message}</p>
    </div>
  )
}

function ResultPanel({ result, posture }) {
  return (
    <div className="result-panel">
      <div className="result-posture-tag">{POSTURES[posture]?.label}</div>
      <div className="result-body">{renderMarkdown(result)}</div>
    </div>
  )
}

function HistoryPanel({ history, onReload, onClear }) {
  const [open, setOpen] = useState(false)

  if (history.length === 0) return null

  return (
    <div className="history-panel">
      <button className="history-toggle" onClick={() => setOpen(o => !o)}>
        <Clock size={13} />
        <span>Session history ({history.length})</span>
        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>
      {open && (
        <div className="history-list">
          {history.map(item => (
            <button
              key={item.id}
              className="history-item"
              onClick={() => onReload(item)}
            >
              <div className="history-item-meta">
                <span className="history-posture">{POSTURES[item.posture]?.label}</span>
                <span className="history-time">{new Date(item.timestamp).toLocaleString()}</span>
              </div>
              <div className="history-preview">{item.inputPreview}</div>
            </button>
          ))}
          <button className="btn-ghost btn-sm history-clear" onClick={onClear}>
            <Trash2 size={12} /> Clear history
          </button>
        </div>
      )}
    </div>
  )
}

function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast--${t.type}`} onClick={() => onRemove(t.id)}>
          {t.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
          {t.message}
        </div>
      ))}
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(LS_KEY_API) || '')
  const [posture, setPosture] = useState('trusted')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [resultPosture, setResultPosture] = useState('trusted')
  const [error, setError] = useState(null)
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEY_HISTORY) || '[]') } catch { return [] }
  })
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((type, message) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }, [])

  const removeToast = useCallback(id => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const handleKeyChange = useCallback(key => {
    setApiKey(key)
    if (key) localStorage.setItem(LS_KEY_API, key)
    else localStorage.removeItem(LS_KEY_API)
  }, [])

  const saveToHistory = useCallback((posture, inputText, result) => {
    const entry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      posture,
      inputPreview: inputText.slice(0, 120).trim(),
      inputFull: inputText,
      result,
    }
    setHistory(prev => {
      const next = [entry, ...prev].slice(0, MAX_HISTORY)
      localStorage.setItem(LS_KEY_HISTORY, JSON.stringify(next))
      return next
    })
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!apiKey) {
      setError({ code: 'no_key' })
      return
    }
    if (!input.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const text = await callGemini(apiKey, POSTURES[posture].systemPrompt, input.trim())
      setResult(text)
      setResultPosture(posture)
      saveToHistory(posture, input.trim(), text)
      addToast('success', 'Analysis complete')
    } catch (err) {
      setError({ code: err.code || 'generic', message: err.message })
    } finally {
      setLoading(false)
    }
  }, [apiKey, posture, input, saveToHistory, addToast])

  const handleReload = useCallback(item => {
    setPosture(item.posture)
    setInput(item.inputFull)
    setResult(item.result)
    setResultPosture(item.posture)
    setError(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleClearHistory = useCallback(() => {
    setHistory([])
    localStorage.removeItem(LS_KEY_HISTORY)
    addToast('success', 'History cleared')
  }, [addToast])

  const canSubmit = Boolean(input.trim()) && !loading

  return (
    <div className="app">
      <ApiKeyBar apiKey={apiKey} onKeyChange={handleKeyChange} />

      <header className="app-header">
        <h1 className="app-title">The Pressure Test</h1>
        <p className="app-subtitle">
          Paste your idea, argument, or opinion. Choose a posture. Receive honest critical feedback — no sycophancy.
        </p>
      </header>

      <main className="app-main">
        <section className="section">
          <label className="section-label">Epistemic posture</label>
          <PostureSelector posture={posture} onChange={setPosture} />
        </section>

        <section className="section">
          <div className="input-header">
            <label className="section-label" htmlFor="main-input">Your argument</label>
            <ExamplePicker onSelect={text => { setInput(text); setResult(null); setError(null) }} />
          </div>
          <textarea
            id="main-input"
            className="main-textarea"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Paste the idea, argument, or opinion you want tested…"
            rows={6}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit() }}
          />
          <div className="input-footer">
            <span className="input-hint">⌘↩ to submit</span>
            <button
              className="submit-btn"
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="spinner" />
                  Analyzing…
                </>
              ) : (
                'Run the pressure test'
              )}
            </button>
          </div>
        </section>

        {error && (
          <ErrorCard error={error} onDismiss={() => setError(null)} />
        )}

        {result && (
          <ResultPanel result={result} posture={resultPosture} />
        )}

        <HistoryPanel
          history={history}
          onReload={handleReload}
          onClear={handleClearHistory}
        />
      </main>

      <footer className="app-footer">
        <p>
          No data is sent to or stored by this application — requests go directly from your browser to the Gemini API.
          A companion tool: <a href="https://reincore.github.io/the-rabbit-hole/" target="_blank" rel="noopener noreferrer">The Rabbit Hole</a>.
        </p>
      </footer>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
