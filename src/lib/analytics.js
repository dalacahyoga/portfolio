// Client-side analytics with two backends:
//  • Supabase (when configured) → data is shared across ALL visitors
//  • localStorage fallback (no backend) → data is per-browser only
import { supabase, supabaseEnabled } from './supabase.js'
import { collectVisitor, getVisitorId } from './visitor.js'

const PV_KEY = 'qa_pageviews'
const EV_KEY = 'qa_events'
const MAX = 2000 // bound local storage

export const PAGE_LABELS = {
  '/': 'Home',
  '/portfolio': 'Portfolio',
  '/contact': 'Contact',
  '/certificates': 'Certificates',
  '/report': 'Report',
}
export const pageLabel = (path) => PAGE_LABELS[path] || path

// ---- localStorage helpers --------------------------------------------------
function lsRead(key) {
  try { return JSON.parse(localStorage.getItem(key)) || [] } catch { return [] }
}
function lsWrite(key, arr) {
  try { localStorage.setItem(key, JSON.stringify(arr.slice(-MAX))) } catch { /* ignore */ }
}

// ---- writes (fire-and-forget) ----------------------------------------------
// Guard against double counts (React StrictMode double-invokes effects in dev;
// also fast back/forward). Same path within this window is recorded once.
let _lastPV = { path: '', t: 0 }

export function trackPageView(path) {
  if (path.startsWith('/admin')) return // don't count the admin area as a visit
  const now = Date.now()
  if (path === _lastPV.path && now - _lastPV.t < 1500) return
  _lastPV = { path, t: now }
  const meta = collectVisitor()
  if (supabaseEnabled) {
    supabase.from('pageviews').insert({ path, ref: meta.referrer, meta }).then(() => {}, () => {})
    return
  }
  const arr = lsRead(PV_KEY)
  arr.push({ path, ts: Date.now(), ref: meta.referrer, meta })
  lsWrite(PV_KEY, arr)
}

export function trackEvent(name, meta) {
  const m = { ...(meta || {}), vid: getVisitorId() } // tie the event to a visitor
  if (supabaseEnabled) {
    supabase.from('events').insert({ name, meta: m }).then(() => {}, () => {})
    return
  }
  const arr = lsRead(EV_KEY)
  arr.push({ name, meta: m, ts: Date.now() })
  lsWrite(EV_KEY, arr)
}

// ---- reads (async) ---------------------------------------------------------
// Returns rows shaped { path|name, meta?, ts(ms), ref? }, newest last.
async function fetchRows(table, key) {
  if (supabaseEnabled) {
    const { data, error } = await supabase.from(table).select('*').order('ts', { ascending: true }).limit(5000)
    if (error) throw error
    return (data || []).map((r) => ({ ...r, ts: new Date(r.ts).getTime() }))
  }
  return lsRead(key)
}
export const getPageViews = () => fetchRows('pageviews', PV_KEY)
export const getEvents = () => fetchRows('events', EV_KEY)

export async function clearAnalytics() {
  if (supabaseEnabled) {
    await supabase.from('pageviews').delete().neq('id', 0)
    await supabase.from('events').delete().neq('id', 0)
    return
  }
  try { localStorage.removeItem(PV_KEY); localStorage.removeItem(EV_KEY) } catch { /* ignore */ }
}

// ---- aggregation -----------------------------------------------------------
export async function pageViewSummary() {
  const rows = await getPageViews()
  const map = new Map()
  for (const v of rows) {
    const e = map.get(v.path) || { path: v.path, label: pageLabel(v.path), count: 0, last: 0 }
    e.count += 1; e.last = Math.max(e.last, v.ts); map.set(v.path, e)
  }
  return [...map.values()].sort((a, b) => b.count - a.count)
}

// Visitor-centric report: one entry PER visitor id (vid), each carrying that
// visitor's device/source profile, total visits, pages opened, and a recent
// timeline. Plus small Source/Device summaries for overview. Sorted by most
// recently active first.
// Visitor aliases (admin-set labels for a vid). Supabase table `aliases` when
// configured, else localStorage. Only the admin reads/writes these.
const ALIAS_KEY = 'qa_vid_aliases'
export async function getAliases() {
  if (supabaseEnabled) {
    const { data, error } = await supabase.from('aliases').select('vid,alias')
    if (error) return {}
    const m = {}; for (const r of data || []) m[r.vid] = r.alias
    return m
  }
  try { return JSON.parse(localStorage.getItem(ALIAS_KEY)) || {} } catch { return {} }
}
export async function setAlias(vid, alias) {
  if (supabaseEnabled) {
    const { error } = await supabase.from('aliases').upsert({ vid, alias, updated_at: new Date().toISOString() })
    if (error) throw error
    return
  }
  try {
    const m = JSON.parse(localStorage.getItem(ALIAS_KEY)) || {}
    if (alias) m[vid] = alias; else delete m[vid]
    localStorage.setItem(ALIAS_KEY, JSON.stringify(m))
  } catch { /* ignore */ }
}

export async function visitorReport() {
  const [rows, evs, aliases] = await Promise.all([getPageViews(), getEvents(), getAliases()])
  const byVid = new Map()
  const source = new Map(), device = new Map()
  const bump = (m, key, ts) => {
    const k = key || '—'
    const e = m.get(k) || { key: k, count: 0, last: 0 }
    e.count += 1; e.last = Math.max(e.last, ts); m.set(k, e)
  }
  const ensure = (vid, ts) => {
    let v = byVid.get(vid)
    if (!v) {
      v = { vid, count: 0, eventCount: 0, first: ts, last: 0, device: '—', os: '—', browser: '—', source: '—', lang: '', screen: '', activity: [] }
      byVid.set(vid, v)
    }
    return v
  }
  for (const r of rows) {
    const ts = r.ts
    bump(source, r.meta?.source, ts)
    bump(device, r.meta?.device, ts)
    const v = ensure(r.meta?.vid || '—', ts)
    v.count += 1
    v.first = Math.min(v.first, ts)
    if (ts >= v.last) { // keep the freshest profile for this visitor
      v.last = ts
      v.device = r.meta?.device || '—'; v.os = r.meta?.os || '—'; v.browser = r.meta?.browser || '—'
      v.source = r.meta?.source || '—'; v.lang = r.meta?.lang || ''; v.screen = r.meta?.screen || ''
    }
    v.activity.push({ type: 'page', label: pageLabel(r.path), ts })
  }
  for (const ev of evs) {
    const ts = ev.ts
    const v = ensure(ev.meta?.vid || '—', ts)
    v.eventCount += 1
    v.first = Math.min(v.first, ts); v.last = Math.max(v.last, ts)
    v.activity.push({ type: 'event', name: ev.name, target: ev.meta?.menu || ev.meta?.label || '', ts })
  }
  const visitors = [...byVid.values()].map((v) => ({
    ...v,
    alias: aliases[v.vid] || '',
    activity: v.activity.sort((a, b) => b.ts - a.ts), // newest first
  })).sort((a, b) => b.last - a.last)
  const sort = (m) => [...m.values()].sort((a, b) => b.count - a.count)
  return {
    total: rows.length,
    totalEvents: evs.length,
    uniqueVisitors: byVid.size,
    visitors,
    source: sort(source),
    device: sort(device),
  }
}

// Friendly Indonesian labels for each event name.
export const EVENT_LABELS = {
  menu_click: 'Klik menu navigasi',
  toggle_theme: 'Ganti tema (gelap/terang)',
  open_photo: 'Buka foto profil',
  close_photo: 'Tutup foto profil',
  cta_click: 'Klik tombol CTA (Home)',
  social_click: 'Klik sosial (Home)',
  select_tab: 'Pilih tab Experience/Education',
  show_details: 'Lihat detail (Exp/Edu)',
  open_project: 'Buka project',
  view_project: 'Lihat deskripsi project',
  open_certificates: 'Buka CTA Certificates (Home)',
  open_certificate: 'Buka sertifikat',
  select_category: 'Pilih kategori (Portfolio)',
  select_framework: 'Pilih framework',
  select_testcase: 'Pilih test case',
  run_scenario: 'Run scenario',
  open_report: 'Buka test report',
  open_external: 'Buka link eksternal',
  close_demo: 'Tutup demo',
  report_print: 'Print / PDF report',
  report_back: 'Kembali dari report',
  toggle_skills: 'Lihat skill lainnya',
  contact_click: 'Klik kontak',
  submit_contact: 'Kirim pesan kontak',
}
export const eventLabel = (name) => EVENT_LABELS[name] || name

// Grouped event report: per event name (friendly label) with a breakdown of
// targets, total count, and last time. Sorted by most frequent.
export async function eventReport() {
  const rows = await getEvents()
  const groups = new Map()
  for (const ev of rows) {
    let g = groups.get(ev.name)
    if (!g) { g = { name: ev.name, label: eventLabel(ev.name), count: 0, last: 0, targets: new Map() }; groups.set(ev.name, g) }
    g.count += 1; g.last = Math.max(g.last, ev.ts)
    const t = ev.meta?.menu || ev.meta?.label || '—'
    const tt = g.targets.get(t) || { target: t, count: 0, last: 0 }
    tt.count += 1; tt.last = Math.max(tt.last, ev.ts); g.targets.set(t, tt)
  }
  const groupsArr = [...groups.values()]
    .map((g) => ({ ...g, targets: [...g.targets.values()].sort((a, b) => b.count - a.count) }))
    .sort((a, b) => b.count - a.count)
  return { total: rows.length, groups: groupsArr, recent: rows.slice(-100).reverse() }
}

export async function eventSummary() {
  const rows = await getEvents()
  const map = new Map()
  for (const ev of rows) {
    const key = ev.meta?.menu ? `${ev.name}:${ev.meta.menu}` : ev.name
    const e = map.get(key) || { key, name: ev.name, label: ev.meta?.menu || ev.meta?.label || '—', count: 0, last: 0 }
    e.count += 1; e.last = Math.max(e.last, ev.ts); map.set(key, e)
  }
  return [...map.values()].sort((a, b) => b.count - a.count)
}

export const sourceLabel = supabaseEnabled ? 'Supabase (semua pengunjung)' : 'localStorage (browser ini saja)'
