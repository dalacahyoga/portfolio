import { createClient } from '@supabase/supabase-js'

// Configured via Vite env vars (safe to expose — the anon key is public and
// access is governed by Row Level Security). When absent, the app gracefully
// falls back to localStorage so it keeps working without a backend.
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabaseEnabled = Boolean(url && anonKey)
export const supabase = supabaseEnabled ? createClient(url, anonKey) : null

// Login form uses a username; Supabase Auth uses email. We map a username to a
// fixed-domain email so "dcgnrg" → "dcgnrg@dcgnrg.local".
export const ADMIN_EMAIL_DOMAIN = 'dcgnrg.local'
export const usernameToEmail = (u) => `${String(u).trim().toLowerCase()}@${ADMIN_EMAIL_DOMAIN}`
