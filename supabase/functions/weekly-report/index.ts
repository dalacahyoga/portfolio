// Supabase Edge Function: emails a WEEKLY digest of the last 7 days.
// Invoke on a schedule (pg_cron / external cron) — see EMAIL_NOTIFICATIONS.md.
// Secrets required: RESEND_API_KEY, NOTIFY_EMAIL, (optional) FROM_EMAIL.
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const NOTIFY_EMAIL = Deno.env.get('NOTIFY_EMAIL')!
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') ?? 'Portfolio <onboarding@resend.dev>'

const h = { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` }
const get = async (path: string) => (await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers: h })).json()

// Source label aliases so ig / insta / instagram all collapse to "Instagram".
const SRC_ALIASES: Record<string, string> = {
  ig: 'Instagram', insta: 'Instagram', instagram: 'Instagram',
  fb: 'Facebook', facebook: 'Facebook', meta: 'Facebook',
  tt: 'TikTok', tiktok: 'TikTok', x: 'X/Twitter', twitter: 'X/Twitter',
  li: 'LinkedIn', linkedin: 'LinkedIn', yt: 'YouTube', youtube: 'YouTube',
  google: 'Google', bing: 'Bing', github: 'GitHub', direct: 'Direct',
}
const normSrc = (s: string) => SRC_ALIASES[String(s || '').trim().toLowerCase()] || String(s || 'Direct').trim()

// Email-safe list: a table with right-aligned counts (flexbox is ignored by Gmail).
function rankList(counts: Record<string, number>, medals = false) {
  const items = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5)
  if (!items.length) return '<div style="color:#9aa1b4;font-size:13px">—</div>'
  const marks = ['🥇', '🥈', '🥉']
  const rows = items.map(([k, v], i) => {
    const mark = medals ? (marks[i] ?? '•') : '•'
    return `<tr>
      <td style="padding:8px 2px;border-bottom:1px solid #f0f1f5;font-size:13.5px;color:#161c2c">${mark}&nbsp;&nbsp;${k}</td>
      <td style="padding:8px 2px;border-bottom:1px solid #f0f1f5;font-size:13.5px;color:#161c2c;font-weight:700;text-align:right">${v}</td>
    </tr>`
  }).join('')
  return `<table style="width:100%;border-collapse:collapse">${rows}</table>`
}

function statBox(icon: string, value: number, label: string) {
  return `<td style="padding:6px" width="33%">
    <div style="background:#f7f8fb;border:1px solid #eceef3;border-radius:12px;padding:14px 8px;text-align:center">
      <div style="font-size:22px">${icon}</div>
      <div style="font-size:22px;font-weight:800;color:#161c2c;margin-top:2px">${value}</div>
      <div style="font-size:11.5px;color:#5a6378;margin-top:2px">${label}</div>
    </div>
  </td>`
}

Deno.serve(async () => {
  try {
    const since = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()
    const pv = await get(`pageviews?select=path,ts,meta&ts=gte.${since}`)
    const ev = await get(`events?select=name,ts,meta&ts=gte.${since}`)

    const vids = new Set<string>()
    const bySource: Record<string, number> = {}
    const byPage: Record<string, number> = {}
    for (const r of pv) {
      if (r.meta?.vid) vids.add(r.meta.vid)
      const s = normSrc(r.meta?.source ?? 'Direct'); bySource[s] = (bySource[s] ?? 0) + 1
      byPage[r.path] = (byPage[r.path] ?? 0) + 1
    }

    const fmtDate = (d: Date) => d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', timeZone: 'Asia/Jakarta' })
    const range = `${fmtDate(new Date(since))} – ${fmtDate(new Date())}`

    const html = `
      <div style="background:#f4f5f7;padding:26px 12px;font-family:Arial,Helvetica,sans-serif">
        <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e6e8ee;border-radius:14px;overflow:hidden">
          <div style="background:linear-gradient(135deg,#5b78f6,#3954d6);padding:16px 24px;color:#ffffff;font-size:16px;font-weight:700;letter-spacing:.2px">Dala Portfolio</div>
          <div style="padding:24px">
            <h1 style="margin:0 0 4px;font-size:20px;color:#161c2c">Ringkasan Mingguan</h1>
            <p style="margin:0 0 18px;color:#5a6378;font-size:14px">Aktivitas 7 hari terakhir · ${range}</p>
            <table style="width:100%;border-collapse:collapse;margin-bottom:8px"><tr>
              ${statBox('👀', pv.length, 'Kunjungan')}
              ${statBox('🧑‍💻', vids.size, 'Pengunjung unik')}
              ${statBox('⚡', ev.length, 'Event')}
            </tr></table>
            <h3 style="margin:18px 0 4px;font-size:14px;color:#161c2c">🌐&nbsp; Sumber teratas</h3>
            ${rankList(bySource, true)}
            <h3 style="margin:18px 0 4px;font-size:14px;color:#161c2c">📄&nbsp; Halaman teratas</h3>
            ${rankList(byPage)}
            <div style="text-align:center;margin-top:24px">
              <a href="https://dalacahyoga.github.io/admin" style="display:inline-block;background:#5b78f6;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:11px 24px;border-radius:10px">Buka dashboard →</a>
            </div>
          </div>
          <div style="padding:14px 24px;background:#fafbfc;color:#9aa1b4;font-size:11px;text-align:center;border-top:1px solid #eef0f4">Email otomatis dari Dala Portfolio · kelola di Supabase</div>
        </div>
      </div>`

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM_EMAIL, to: NOTIFY_EMAIL, subject: 'Ringkasan Mingguan — Dala Portfolio', html }),
    })
    const detail = await r.text()
    if (!r.ok) console.error('resend error', r.status, detail)
    return new Response(r.ok ? 'sent' : `fail ${r.status}: ${detail}`, { status: 200 })
  } catch (e) {
    console.error(e)
    return new Response('error', { status: 200 })
  }
})
