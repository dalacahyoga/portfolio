import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { profile, profileDefaults, EDITABLE_FIELDS } from '../data/profile.js'
import {
  getPageViews, getEvents, pageViewSummary, eventSummary, clearAnalytics,
  pageLabel, sourceLabel,
} from '../lib/analytics.js'
import { saveContent, resetContent } from '../lib/content.js'
import { supabase, supabaseEnabled, usernameToEmail } from '../lib/supabase.js'

const AUTH_KEY = 'qa_admin_auth'
const USER = 'dcgnrg'
const PASS = 'dcgnrg'

const fmt = (ts) => new Date(ts).toLocaleString()

function initialForm() {
  const f = {}
  for (const { key } of EDITABLE_FIELDS) {
    if (key === 'linkedin' || key === 'github') f[key] = profile.links[key] || ''
    else f[key] = profile[key] || ''
  }
  return f
}

export default function Admin() {
  const [authed, setAuthed] = useState(false)
  const [ready, setReady] = useState(!supabaseEnabled)

  useEffect(() => {
    if (!supabaseEnabled) {
      try { setAuthed(sessionStorage.getItem(AUTH_KEY) === '1') } catch { /* ignore */ }
      return
    }
    let sub
    supabase.auth.getSession().then(({ data }) => { setAuthed(!!data.session); setReady(true) })
    const { data } = supabase.auth.onAuthStateChange((_e, session) => setAuthed(!!session))
    sub = data.subscription
    return () => sub?.unsubscribe()
  }, [])

  async function logout() {
    if (supabaseEnabled) await supabase.auth.signOut()
    else { try { sessionStorage.removeItem(AUTH_KEY) } catch { /* ignore */ } }
    setAuthed(false)
  }

  if (!ready) return <div className="admin admin--center"><p className="admin-empty">Loading…</p></div>
  if (!authed) return <Login onSuccess={() => setAuthed(true)} />
  return <Dashboard onLogout={logout} />
}

function Login({ onSuccess }) {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setErr('')
    if (supabaseEnabled) {
      setBusy(true)
      const { error } = await supabase.auth.signInWithPassword({
        email: usernameToEmail(user), password: pass,
      })
      setBusy(false)
      if (error) setErr('Username atau password salah.')
      else onSuccess()
      return
    }
    if (user.trim() === USER && pass === PASS) {
      try { sessionStorage.setItem(AUTH_KEY, '1') } catch { /* ignore */ }
      onSuccess()
    } else {
      setErr('Username atau password salah.')
    }
  }

  return (
    <div className="admin admin--center">
      <form className="admin-login" onSubmit={submit}>
        <h1 className="admin-login__title">Admin Login</h1>
        <p className="admin-login__sub">Restricted area · {supabaseEnabled ? 'Supabase Auth' : 'local'}</p>
        <label className="admin-field">
          <span>Username</span>
          <input value={user} onChange={(e) => setUser(e.target.value)} autoFocus autoComplete="username" />
        </label>
        <label className="admin-field">
          <span>Password</span>
          <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} autoComplete="current-password" />
        </label>
        {err && <p className="admin-login__err">{err}</p>}
        <button type="submit" className="btn btn--solid admin-login__btn" disabled={busy}>
          {busy ? 'Masuk…' : 'Masuk'}
        </button>
        <Link to="/" className="admin-login__back">← Kembali ke situs</Link>
      </form>
    </div>
  )
}

const TABS = [
  { id: 'content', label: 'Edit Konten' },
  { id: 'visitors', label: 'Pengunjung per Halaman' },
  { id: 'events', label: 'Event Tracker' },
]

function Dashboard({ onLogout }) {
  const [tab, setTab] = useState('content')
  return (
    <div className="admin">
      <header className="admin-bar">
        <div className="admin-bar__brand">⚙ Admin Panel</div>
        <div className="admin-bar__actions">
          <Link to="/" className="admin-bar__link">View site ↗</Link>
          <button className="admin-bar__logout" onClick={onLogout}>Logout</button>
        </div>
      </header>

      <nav className="admin-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`admin-tab ${tab === t.id ? 'is-active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="admin-content">
        {tab === 'content' && <EditContent />}
        {tab === 'visitors' && <Visitors />}
        {tab === 'events' && <EventsTab />}
      </main>
    </div>
  )
}

function EditContent() {
  const [form, setForm] = useState(initialForm)
  const [status, setStatus] = useState('')
  const set = (key, val) => { setForm((f) => ({ ...f, [key]: val })); setStatus('') }

  async function save() {
    const { linkedin, github, ...rest } = form
    try {
      await saveContent({ ...rest, links: { linkedin, github } })
      setStatus('✔ Tersimpan' + (supabaseEnabled ? ' ke Supabase' : ' (lokal)'))
    } catch { setStatus('✖ Gagal menyimpan') }
  }

  async function reset() {
    try { await resetContent() } catch { /* ignore */ }
    const f = {}
    for (const { key } of EDITABLE_FIELDS) {
      if (key === 'linkedin' || key === 'github') f[key] = profileDefaults.links[key] || ''
      else f[key] = profileDefaults[key] || ''
    }
    setForm(f)
    setStatus('✔ Direset ke default')
  }

  return (
    <section className="admin-panel">
      <div className="admin-panel__head">
        <h2>Edit Konten Profil</h2>
        <p className="admin-note">
          {supabaseEnabled
            ? 'Tersimpan ke Supabase (berlaku untuk semua pengunjung). '
            : 'Tersimpan di browser ini. '}
          <strong>Reload halaman situs</strong> untuk melihat hasilnya.
        </p>
      </div>
      <div className="admin-form">
        {EDITABLE_FIELDS.map(({ key, label, multiline }) => (
          <label key={key} className={`admin-field ${multiline ? 'admin-field--wide' : ''}`}>
            <span>{label}</span>
            {multiline
              ? <textarea rows={4} value={form[key]} onChange={(e) => set(key, e.target.value)} />
              : <input value={form[key]} onChange={(e) => set(key, e.target.value)} />}
          </label>
        ))}
      </div>
      <div className="admin-actions">
        <button className="btn btn--solid" onClick={save}>Simpan</button>
        <button className="btn btn--outline" onClick={reset}>Reset ke default</button>
        {status && <span className="admin-saved">{status}</span>}
      </div>
    </section>
  )
}

function useAnalytics(summaryFn, rowsFn) {
  const [state, setState] = useState({ loading: true, summary: [], recent: [], total: 0, error: '' })
  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: '' }))
    try {
      const [summary, rows] = await Promise.all([summaryFn(), rowsFn()])
      setState({
        loading: false, summary, recent: rows.slice(-25).reverse(),
        total: summary.reduce((s, r) => s + r.count, 0), error: '',
      })
    } catch {
      setState({ loading: false, summary: [], recent: [], total: 0, error: 'Gagal memuat data.' })
    }
  }, [summaryFn, rowsFn])
  useEffect(() => { load() }, [load])
  return { ...state, reload: load }
}

function Visitors() {
  const { loading, summary, recent, total, error, reload } = useAnalytics(pageViewSummary, getPageViews)
  return (
    <section className="admin-panel">
      <div className="admin-panel__head">
        <h2>Pengunjung per Halaman</h2>
        <p className="admin-note">Total kunjungan: <strong>{total}</strong> · sumber: {sourceLabel}</p>
      </div>
      {loading ? <p className="admin-empty">Memuat…</p> : error ? <p className="admin-login__err">{error}</p> : (
        <>
          {summary.length === 0 ? <p className="admin-empty">Belum ada data kunjungan.</p> : (
            <table className="admin-table">
              <thead><tr><th>Halaman</th><th>Path</th><th>Kunjungan</th><th>Terakhir</th></tr></thead>
              <tbody>
                {summary.map((r) => (
                  <tr key={r.path}>
                    <td>{r.label}</td><td className="admin-mono">{r.path}</td>
                    <td>{r.count}</td><td>{fmt(r.last)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <h3 className="admin-subhead">Kunjungan terbaru</h3>
          {recent.length === 0 ? <p className="admin-empty">—</p> : (
            <ul className="admin-log">
              {recent.map((v, i) => (
                <li key={i}><span className="admin-mono">{pageLabel(v.path)}</span> <time>{fmt(v.ts)}</time></li>
              ))}
            </ul>
          )}
        </>
      )}
      <Toolbar onReload={reload} />
    </section>
  )
}

function EventsTab() {
  const { loading, summary, recent, total, error, reload } = useAnalytics(eventSummary, getEvents)
  return (
    <section className="admin-panel">
      <div className="admin-panel__head">
        <h2>Event Tracker</h2>
        <p className="admin-note">Total event: <strong>{total}</strong> · klik menu &amp; aksi penting · sumber: {sourceLabel}</p>
      </div>
      {loading ? <p className="admin-empty">Memuat…</p> : error ? <p className="admin-login__err">{error}</p> : (
        <>
          {summary.length === 0 ? <p className="admin-empty">Belum ada event tercatat.</p> : (
            <table className="admin-table">
              <thead><tr><th>Event</th><th>Target</th><th>Jumlah</th><th>Terakhir</th></tr></thead>
              <tbody>
                {summary.map((r) => (
                  <tr key={r.key}>
                    <td>{r.name}</td><td>{r.label}</td><td>{r.count}</td><td>{fmt(r.last)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <h3 className="admin-subhead">Event terbaru</h3>
          {recent.length === 0 ? <p className="admin-empty">—</p> : (
            <ul className="admin-log">
              {recent.map((ev, i) => (
                <li key={i}>
                  <span className="admin-mono">{ev.name}{ev.meta?.menu ? ` · ${ev.meta.menu}` : ''}</span>
                  <time>{fmt(ev.ts)}</time>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
      <Toolbar onReload={reload} />
    </section>
  )
}

function Toolbar({ onReload }) {
  return (
    <div className="admin-danger">
      <button className="btn btn--outline" onClick={onReload}>↻ Refresh</button>
      <button
        className="btn btn--ghost"
        onClick={async () => {
          if (window.confirm('Hapus semua data kunjungan & event?')) {
            await clearAnalytics(); onReload()
          }
        }}
      >
        Hapus data analytics
      </button>
    </div>
  )
}
