// Supabase Edge Function: emails you when a NEW visitor (unseen vid) arrives.
// Triggered by a Database Webhook on INSERT into `pageviews`.
// Secrets required: RESEND_API_KEY, NOTIFY_EMAIL, (optional) FROM_EMAIL.
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const NOTIFY_EMAIL = Deno.env.get('NOTIFY_EMAIL')!
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') ?? 'Portfolio <onboarding@resend.dev>'

async function sendEmail(subject: string, html: string): Promise<string> {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM_EMAIL, to: NOTIFY_EMAIL, subject, html }),
  })
  const detail = await r.text()
  if (!r.ok) console.error('resend error', r.status, detail)
  return r.ok ? 'sent' : `fail ${r.status}: ${detail}`
}

Deno.serve(async (req) => {
  try {
    const body = await req.json()
    const record = body.record ?? body.new ?? {}
    const meta = record.meta ?? {}
    const vid = meta.vid
    if (!vid) return new Response('no vid', { status: 200 })

    // Is this a brand-new visitor? Count this vid's page views (incl. the new row).
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/pageviews?select=id&meta->>vid=eq.${encodeURIComponent(vid)}&limit=2`,
      { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } },
    )
    const rows = await res.json()
    if (Array.isArray(rows) && rows.length > 1) {
      return new Response('returning visitor', { status: 200 }) // not new → skip
    }

    const when = new Date(record.ts ?? Date.now()).toLocaleString('id-ID')
    const row = (icon: string, label: string, value: string, last = false) =>
      `<tr>
         <td style="padding:11px 14px;font-size:13px;color:#5a6378;width:130px;${last ? '' : 'border-bottom:1px solid #eceef3'}">${icon}&nbsp;&nbsp;${label}</td>
         <td style="padding:11px 14px;font-size:13px;color:#161c2c;font-weight:600;${last ? '' : 'border-bottom:1px solid #eceef3'}">${value}</td>
       </tr>`
    const html = `
      <div style="background:#f4f5f7;padding:26px 12px;font-family:Arial,Helvetica,sans-serif">
        <div style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #e6e8ee;border-radius:14px;overflow:hidden">
          <div style="background:linear-gradient(135deg,#5b78f6,#3954d6);padding:16px 24px;color:#ffffff;font-size:16px;font-weight:700;letter-spacing:.2px">Dala Portfolio</div>
          <div style="padding:24px">
            <h1 style="margin:0 0 6px;font-size:20px;color:#161c2c">Ada pengunjung baru!</h1>
            <p style="margin:0 0 18px;color:#5a6378;font-size:14px">Seseorang baru saja membuka portfolio kamu.</p>
            <table style="width:100%;border-collapse:collapse;background:#f7f8fb;border:1px solid #eceef3;border-radius:10px;overflow:hidden">
              ${row('📍', 'Sumber', meta.source ?? '—')}
              ${row('📱', 'Perangkat', `${meta.device ?? '—'} · ${meta.os ?? '—'} · ${meta.browser ?? '—'}`)}
              ${row('📄', 'Halaman', record.path ?? '—')}
              ${row('🆔', 'Visitor ID', String(vid).slice(0, 12))}
              ${row('🕒', 'Waktu', when, true)}
            </table>
            <div style="text-align:center;margin-top:22px">
              <a href="https://dalacahyoga.github.io/admin" style="display:inline-block;background:#5b78f6;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:11px 24px;border-radius:10px">Lihat dashboard →</a>
            </div>
          </div>
          <div style="padding:14px 24px;background:#fafbfc;color:#9aa1b4;font-size:11px;text-align:center;border-top:1px solid #eef0f4">Email otomatis dari Dala Portfolio · kelola di Supabase</div>
        </div>
      </div>`
    const result = await sendEmail('Ada Pengunjung Baru di Dala Portfolio!', html)
    return new Response(result, { status: 200 })
  } catch (e) {
    console.error(e)
    return new Response('error', { status: 200 }) // 200 so the webhook doesn't retry-storm
  }
})
