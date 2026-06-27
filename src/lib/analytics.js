// Client-side analytics with two backends:
//  • Supabase (when configured) → data is shared across ALL visitors
//  • localStorage fallback (no backend) → data is per-browser only
import { supabase, supabaseEnabled } from './supabase.js'

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
export function trackPageView(path) {
  if (path.startsWith('/admin')) return // don't count the admin area as a visit
  if (supabaseEnabled) {
    supabase.from('pageviews').insert({ path, ref: document.referrer || '' }).then(() => {}, () => {})
    return
  }
  const arr = lsRead(PV_KEY)
  arr.push({ path, ts: Date.now(), ref: document.referrer || '' })
  lsWrite(PV_KEY, arr)
}

export function trackEvent(name, meta) {
  if (supabaseEnabled) {
    supabase.from('events').insert({ name, meta: meta || null }).then(() => {}, () => {})
    return
  }
  const arr = lsRead(EV_KEY)
  arr.push({ name, meta: meta || null, ts: Date.now() })
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
