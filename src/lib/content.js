// Profile content overrides, backed by Supabase when configured (shared for all
// visitors) with a localStorage cache so the site renders synchronously.
import { supabase, supabaseEnabled } from './supabase.js'
import { PROFILE_OVERRIDE_KEY } from '../data/profile.js'

// Pull the latest content from Supabase into the local cache BEFORE the app
// renders, so profile.js (which reads localStorage at import) sees fresh data.
export async function preloadContent() {
  if (!supabaseEnabled) return
  try {
    const { data, error } = await supabase.from('content').select('data').eq('id', 1).maybeSingle()
    if (!error && data?.data) {
      localStorage.setItem(PROFILE_OVERRIDE_KEY, JSON.stringify(data.data))
    }
  } catch { /* offline / not set up yet — keep local cache */ }
}

export async function saveContent(overrides) {
  try { localStorage.setItem(PROFILE_OVERRIDE_KEY, JSON.stringify(overrides)) } catch { /* ignore */ }
  if (supabaseEnabled) {
    const { error } = await supabase
      .from('content')
      .upsert({ id: 1, data: overrides, updated_at: new Date().toISOString() })
    if (error) throw error
  }
}

export async function resetContent() {
  try { localStorage.removeItem(PROFILE_OVERRIDE_KEY) } catch { /* ignore */ }
  if (supabaseEnabled) {
    const { error } = await supabase
      .from('content')
      .upsert({ id: 1, data: {}, updated_at: new Date().toISOString() })
    if (error) throw error
  }
}
