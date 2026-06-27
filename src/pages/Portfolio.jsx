import { useState, useRef, useEffect } from 'react'
import Layout from '../components/Layout.jsx'
import MockBrowser from '../components/MockBrowser.jsx'
import ApiViewer from '../components/ApiViewer.jsx'
import { testCases, frameworks, getCode, BASE_URL } from '../data/testCases.js'
import { apiTestCases, apiFrameworks, getApiCode, API_BASE } from '../data/apiTests.js'
import { projects } from '../data/profile.js'
import { ExternalIcon } from '../components/Icons.jsx'
import { trackEvent } from '../lib/analytics.js'

const categories = [
  { id: 'web', label: '🌐 Automation Website', short: '🌐 Website' },
  { id: 'api', label: '🔗 Automation API', short: '🔗 API' },
]

export default function Portfolio() {
  const [category, setCategory] = useState('web')
  const [framework, setFramework] = useState(frameworks[0].id)
  const [activeId, setActiveId] = useState(testCases[0].id)
  const [runningId, setRunningId] = useState(null)
  const [logs, setLogs] = useState([])
  const [demoState, setDemoState] = useState({ screen: 'login' })
  const [result, setResult] = useState(null) // 'pass' | null
  const [showDemo, setShowDemo] = useState(false)
  const [demoTitle, setDemoTitle] = useState('')
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 880px)').matches,
  )
  const timers = useRef([])
  const resultsRef = useRef(null)
  const infoRef = useRef(null)

  const isApi = category === 'api'
  const fwList = isApi ? apiFrameworks : frameworks
  const tcList = isApi ? apiTestCases : testCases
  const codeFor = isApi ? getApiCode : getCode
  const active = tcList.find((t) => t.id === activeId) || tcList[0]
  const frameworkLabel = (fwList.find((f) => f.id === framework) || fwList[0]).label
  const initialState = () => (isApi ? tcList[0].steps[0].state : { screen: 'login' })

  // track viewport so the popup only applies on mobile
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 880px)')
    const handler = (e) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // clear pending timers on unmount
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  // preview the active test's first step when idle
  useEffect(() => {
    if (!runningId) setDemoState(isApi ? active.steps[0].state : { screen: 'login' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, category])

  // lock background scroll only while the mobile popup is open
  const popupOpen = isMobile && showDemo
  useEffect(() => {
    document.body.style.overflow = popupOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [popupOpen])

  function clearTimers() {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  function switchCategory(catId) {
    if (catId === category || runningId) return
    trackEvent('select_category', { menu: (categories.find((c) => c.id === catId) || {}).label || catId })
    clearTimers()
    const nextFw = catId === 'api' ? apiFrameworks : frameworks
    const nextTc = catId === 'api' ? apiTestCases : testCases
    setCategory(catId)
    setFramework(nextFw[0].id)
    setActiveId(nextTc[0].id)
    setLogs([])
    setResult(null)
    setShowDemo(false)
  }

  function closeDemo() {
    trackEvent('close_demo', { menu: demoTitle || 'Live demo' })
    clearTimers()
    setShowDemo(false)
    setRunningId(null)
    if (isMobile) {
      setTimeout(() => {
        const target = infoRef.current || resultsRef.current
        target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 80)
    }
  }

  function runTest(tc) {
    // distinct identifier per code type (framework) + test case number
    trackEvent('run_scenario', { menu: `${tc.id} · ${frameworkLabel} (${category})` })
    clearTimers()
    setActiveId(tc.id)
    setRunningId(tc.id)
    setResult(null)
    setDemoTitle(`${tc.id} — ${tc.title}`)
    setLogs([{ text: `▶ Running ${tc.id} — ${tc.title} [${frameworkLabel}]`, type: 'head' }])
    setDemoState(initialState())
    setShowDemo(true)

    const stepDelay = 900
    tc.steps.forEach((step, i) => {
      const t = setTimeout(() => {
        setDemoState(step.state)
        setLogs((prev) => [...prev, { text: `  ✓ ${step.log}`, type: 'step' }])
        if (i === tc.steps.length - 1) {
          const finish = setTimeout(() => {
            setLogs((prev) => [
              ...prev,
              { text: `✔ PASSED — ${tc.expected}`, type: 'pass' },
              { text: `  1 passing (${((tc.steps.length * stepDelay) / 1000).toFixed(1)}s)`, type: 'dim' },
            ])
            setResult('pass')
            setRunningId(null)
          }, stepDelay)
          timers.current.push(finish)
        }
      }, stepDelay * (i + 1))
      timers.current.push(t)
    })
  }

  // Live viewer — inline on desktop, moves to the popup on mobile.
  const viewerEl = isApi
    ? <ApiViewer state={demoState} running={!!runningId} />
    : <MockBrowser state={demoState} running={!!runningId} />

  // Test runner console — inline on both desktop and mobile.
  const consoleEl = (
    <div className={`console ${result === 'pass' ? 'console--pass' : ''}`}>
      <div className="console__bar">
        <span>Test runner output</span>
        {result === 'pass' && <span className="console__badge">PASS</span>}
      </div>
      <pre className="console__body">
        {logs.length === 0
          ? 'Press ▶ Run on a test case to start the live demo...'
          : logs.map((l, i) => (
              <span key={i} className={`log log--${l.type}`}>{l.text}{'\n'}</span>
            ))}
      </pre>
    </div>
  )

  return (
    <Layout wide>
      <div className={`portfolio theme-${category}`}>
      <div className="page-head">
        <p className="eyebrow">My works</p>
        <h1 className="display"><span className="grad-text">Portfolio</span></h1>
        <p className="muted">Banking projects I&apos;ve contributed to as QA, plus live automation demos.</p>
      </div>

      {/* Featured projects */}
      <section className="proj-section">
        <div className="proj-section__head">
          <p className="eyebrow">Selected work</p>
          <h2 className="proj-section__title">Projects</h2>
        </div>
        <div className="proj-grid">
          {projects.map((p) => {
            const Tag = p.link ? 'a' : 'article'
            const linkProps = p.link ? { href: p.link, target: '_blank', rel: 'noreferrer' } : {}
            return (
              <Tag
                className="card proj-card"
                key={p.name}
                {...linkProps}
                onClick={() => trackEvent('open_project', { menu: p.name })}
              >
                <div className="proj-card__bar" />
                {p.link && <span className="proj-card__ext"><ExternalIcon /></span>}
                <h3 className="proj-card__name">{p.name}</h3>
                <span className="proj-card__role">{p.role}</span>
                <p className="proj-card__org">{p.org}</p>
                <p className="proj-card__desc">{p.desc}</p>
              </Tag>
            )
          })}
        </div>
      </section>

      {/* Live automation demo */}
      <div className="proj-section__head proj-section__head--sub">
        <p className="eyebrow">Hands-on</p>
        <h2 className="proj-section__title">Live Automation Demo</h2>
        <p className="muted small">Pick a category, choose a test case, and press Run to replay it step-by-step.</p>
      </div>

      <nav className="nav-links portfolio__toggle">
        {categories.map((c) => (
          <button
            key={c.id}
            className={`nav-link ${category === c.id ? 'is-active' : ''}`}
            onClick={() => switchCategory(c.id)}
            disabled={!!runningId}
          >
            <span className="nav-full">{c.label}</span>
            <span className="nav-short">{c.short}</span>
          </button>
        ))}
      </nav>

      <div className="portfolio__intro">
        <p>
          {isApi ? (
            <>
              Live API automation against the OrangeHRM REST API (<code>{API_BASE}</code>).
              Pick a framework, choose a test case, and press <strong>Run</strong> to watch the
              request/response replay with the matching source code.
            </>
          ) : (
            <>
              Live UI automation against the{' '}
              <a href={BASE_URL} target="_blank" rel="noreferrer" onClick={() => trackEvent('open_external', { menu: 'OrangeHRM demo site' })}>OrangeHRM demo site</a>.
              Pick a framework, choose a test case, and press <strong>Run</strong> to watch
              the scenario replay step-by-step with the matching source code.
            </>
          )}
        </p>
        <div className="framework-picker">
          <span className="framework-picker__label">Automation framework:</span>
          {fwList.map((f) => (
            <button
              key={f.id}
              className={`pill ${framework === f.id ? 'is-active' : ''}`}
              onClick={() => { trackEvent('select_framework', { menu: `${f.label} (${category})` }); setFramework(f.id) }}
              disabled={!!runningId}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="portfolio__grid">
        {/* Test case list */}
        <div className="tc-list">
          <h3 className="tc-list__title">Test cases ({tcList.length})</h3>
          {tcList.map((tc) => (
            <div
              key={tc.id}
              className={`tc-card ${activeId === tc.id ? 'is-active' : ''}`}
              onClick={() => { trackEvent('select_testcase', { menu: `${tc.id} · ${tc.title} (${category})` }); setActiveId(tc.id) }}
            >
              <div className="tc-card__head">
                <span className="tc-card__id">{tc.id}</span>
                <button
                  className="btn btn--run"
                  onClick={(e) => { e.stopPropagation(); runTest(tc) }}
                  disabled={!!runningId}
                >
                  {runningId === tc.id ? 'Running…' : '▶ Run'}
                </button>
              </div>
              <div className="tc-card__title">{tc.title}</div>
              <div className="tc-card__desc">{tc.description}</div>
            </div>
          ))}
        </div>

        {/* Demo + code. The live viewer is inline on desktop; on mobile it moves to a popup. */}
        <div className={`demo ${result === 'pass' && !runningId ? 'demo--ran' : ''}`} ref={resultsRef}>
          {/* Inline live viewer — hidden on mobile (shown in the popup instead) */}
          <div className="demo__browser">{viewerEl}</div>

          {/* Report button — only after a run finishes */}
          {result === 'pass' && !runningId && (
            <div className="report-ready" ref={infoRef}>
              <div className="report-ready__text">✔ Run selesai — ini report hasil testnya:</div>
              <button
                className="btn btn--solid report-cta"
                onClick={() => { trackEvent('open_report', { menu: `${active.id} · ${frameworkLabel}` }); window.open(`/report?tc=${active.id}&fw=${framework}&cat=${category}`, '_blank', 'noopener') }}
              >
                📄 Test Report (PDF)
              </button>
            </div>
          )}

          {consoleEl}

          <div className="code">
            <div className="code__bar">
              <span>{active.id} — source ({frameworkLabel})</span>
            </div>
            <pre className="code__body"><code>{codeFor(framework, active)}</code></pre>
          </div>
        </div>
      </div>

      {/* Live demo popup overlay — mobile only */}
      {popupOpen && (
        <div className="modal" onClick={closeDemo}>
          <div className="modal__card" onClick={(e) => e.stopPropagation()}>
            <div className="modal__head">
              <span className="modal__title">▶ Live demo — {demoTitle}</span>
              <button className="modal__close" onClick={closeDemo} aria-label="Close">×</button>
            </div>
            <div className="modal__body">
              {viewerEl}
              {result === 'pass' && !runningId && (
                <div className="modal__hint">
                  ✔ Run selesai! Tutup popup ini — <strong>test result</strong> &{' '}
                  <strong>source code</strong> tersedia di bawah ↓
                </div>
              )}
            </div>
            <div className="modal__foot">
              <button className="btn btn--ghost" onClick={closeDemo}>
                {runningId ? 'Stop & close ✕' : 'Close & lihat hasil ↓'}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </Layout>
  )
}
