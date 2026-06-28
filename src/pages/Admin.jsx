import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { profile, profileDefaults, EDITABLE_FIELDS } from '../data/profile.js'
import {
  eventReport, eventLabel, visitorReport, setAlias, deleteVisitor, clearAnalytics, sourceLabel,
} from '../lib/analytics.js'
import { TrashIcon } from '../components/Icons.jsx'
import LocationCell from '../components/LocationCell.jsx'
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
  { id: 'visitors', label: 'Pengunjung' },
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

// Generic async loader for an admin report function.
function useReport(reportFn) {
  const [state, setState] = useState({ loading: true, error: '', data: null })
  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: '' }))
    try { setState({ loading: false, error: '', data: await reportFn() }) }
    catch { setState({ loading: false, error: 'Gagal memuat data.', data: null }) }
  }, [reportFn])
  useEffect(() => { load() }, [load])
  return { ...state, reload: load }
}

function CountTable({ head, rows }) {
  if (!rows?.length) return <p className="admin-empty">—</p>
  return (
    <div className="table-wrap">
      <table className="admin-table">
        <thead><tr><th>{head}</th><th>Jumlah</th><th>Terakhir</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key}><td>{r.key}</td><td>{r.count}</td><td>{fmt(r.last)}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AliasInput({ vid, value }) {
  const [val, setVal] = useState(value || '')
  const [saved, setSaved] = useState(false)
  useEffect(() => { setVal(value || '') }, [value])
  async function commit() {
    const next = val.trim()
    if (next === (value || '')) return
    try { await setAlias(vid, next); setSaved(true); setTimeout(() => setSaved(false), 1200) } catch { /* ignore */ }
  }
  // stop clicks/keys from toggling the parent <summary>
  return (
    <input
      className={`visitor-card__alias ${saved ? 'is-saved' : ''}`}
      value={val}
      placeholder="+ alias"
      aria-label="Alias pengunjung"
      onChange={(e) => setVal(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => { e.stopPropagation(); if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur() } }}
      onBlur={commit}
    />
  )
}

function Visitors() {
  const { loading, error, data: rep, reload } = useReport(visitorReport)

  async function removeVisitor(vid) {
    if (!window.confirm('Hapus device ini beserta SEMUA kunjungan & event-nya?')) return
    try { await deleteVisitor(vid) } catch { /* ignore */ }
    reload()
  }

  return (
    <section className="admin-panel">
      <div className="admin-panel__head">
        <h2>Pengunjung</h2>
        <p className="admin-note">
          Pengunjung unik: <strong>{rep?.uniqueVisitors ?? 0}</strong> ·
          kunjungan: <strong>{rep?.total ?? 0}</strong> ·
          event: <strong>{rep?.totalEvents ?? 0}</strong> · sumber data: {sourceLabel}
        </p>
      </div>
      <Toolbar onReload={reload} />
      {loading ? <p className="admin-empty">Memuat…</p> : error ? <p className="admin-login__err">{error}</p> : (
        <>
          {rep.visitors.length === 0 ? <p className="admin-empty">Belum ada pengunjung.</p> : (
            <div className="visitor-list">
              {rep.visitors.map((v, idx) => (
                <details className="visitor-card" key={v.vid}>
                  <summary className="visitor-card__head">
                    <button
                      className="visitor-card__del"
                      title="Hapus device & semua data-nya"
                      aria-label="Hapus device"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeVisitor(v.vid) }}
                    >
                      <TrashIcon />
                    </button>
                    <span className="visitor-card__id" title={v.vid}>#{idx + 1} · {String(v.vid).slice(0, 8)}</span>
                    <AliasInput vid={v.vid} value={v.alias} />
                    <span className="visitor-card__profile">{v.device} · {v.os} · {v.browser}</span>
                    <span className="visitor-card__src">{v.source}</span>
                    <span className="visitor-card__count">{v.count}× kunjungan · {v.eventCount} event</span>
                    <span className="visitor-card__last">{fmt(v.last)}</span>
                  </summary>
                  <div className="visitor-card__body">
                    <h4>Lokasi (perkiraan IP)</h4>
                    <LocationCell location={v.location} />
                    <h4 style={{ marginTop: '16px' }}>Aktivitas (halaman + event)</h4>
                    <div className="visitor-card__scroll">
                      <table className="admin-table">
                        <thead><tr><th>Aktivitas</th><th>Waktu</th></tr></thead>
                        <tbody>
                          {v.activity.map((a, i) => (
                            <tr key={i}>
                              <td>
                                {a.type === 'page'
                                  ? <><span className="tag tag--page">Halaman</span> {a.label}</>
                                  : <><span className="tag tag--event">Event</span> {a.name}{a.target ? ` · ${a.target}` : ''}</>}
                              </td>
                              <td>{fmt(a.ts)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="visitor-card__foot">
                      Pertama: {fmt(v.first)} · Bahasa: {v.lang || '—'} · Layar: {v.screen || '—'} · ID lengkap: <span className="admin-mono">{v.vid}</span>
                    </p>
                  </div>
                </details>
              ))}
            </div>
          )}

          <div className="admin-grid2 admin-grid2--top">
            <div><h3 className="admin-subhead">Ringkasan Sumber</h3><CountTable head="Source" rows={rep.source} /></div>
            <div><h3 className="admin-subhead">Ringkasan Device</h3><CountTable head="Device" rows={rep.device} /></div>
          </div>
        </>
      )}
    </section>
  )
}

function EventsTab() {
  const { loading, error, data: rep, reload } = useReport(eventReport)
  return (
    <section className="admin-panel">
      <div className="admin-panel__head">
        <h2>Event Tracker</h2>
        <p className="admin-note">
          Total event: <strong>{rep?.total ?? 0}</strong> · {rep?.groups?.length ?? 0} jenis event · sumber: {sourceLabel}
        </p>
      </div>
      <Toolbar onReload={reload} />
      {loading ? <p className="admin-empty">Memuat…</p> : error ? <p className="admin-login__err">{error}</p> : (
        <>
          {rep.groups.length === 0 ? <p className="admin-empty">Belum ada event tercatat.</p> : (
            <div className="ev-list">
              {rep.groups.map((g) => (
                <details className="ev-card" key={g.name}>
                  <summary className="ev-card__head">
                    <span className="ev-card__name">{g.label}</span>
                    <span className="ev-card__raw admin-mono">{g.name}</span>
                    <span className="ev-card__count">{g.count}×</span>
                    <span className="ev-card__last">{fmt(g.last)}</span>
                  </summary>
                  <div className="ev-card__body">
                    <div className="table-wrap">
                      <table className="admin-table">
                        <thead><tr><th>Target</th><th>Jumlah</th><th>Terakhir</th></tr></thead>
                        <tbody>
                          {g.targets.map((t) => (
                            <tr key={t.target}><td>{t.target}</td><td>{t.count}</td><td>{fmt(t.last)}</td></tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          )}

          <h3 className="admin-subhead">Event terbaru</h3>
          {rep.recent.length === 0 ? <p className="admin-empty">—</p> : (
            <div className="scroll-table">
              <table className="admin-table">
                <thead><tr><th>Event</th><th>Target</th><th>Waktu</th></tr></thead>
                <tbody>
                  {rep.recent.map((ev, i) => (
                    <tr key={i}>
                      <td>
                        <span className="ev-name">{eventLabel(ev.name)}</span>
                        <span className="ev-raw admin-mono"> ({ev.name})</span>
                      </td>
                      <td>{ev.meta?.menu || ev.meta?.label || '—'}</td>
                      <td>{fmt(ev.ts)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  )
}

function Toolbar({ onReload }) {
  return (
    <div className="admin-toolbar">
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
