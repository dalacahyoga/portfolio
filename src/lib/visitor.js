// Collects non-invasive device + source info from the browser for analytics.
// No IP / geolocation. Source detection priority: UTM → in-app browser
// (Instagram/FB/TikTok…) → referrer host → "Direct".

// A stable, first-party visitor id (random UUID kept in localStorage) so repeat
// visits from the same browser can be recognised. NOT a hardware fingerprint —
// it resets if the user clears site data, uses incognito, or another browser.
const VID_KEY = 'qa_vid'
export function getVisitorId() {
  try {
    let id = localStorage.getItem(VID_KEY)
    if (!id) {
      id = (crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`)
      localStorage.setItem(VID_KEY, id)
    }
    return id
  } catch { return 'no-storage' }
}

// Friendly names for common referrer / link-shortener hosts.
const HOST_NAMES = [
  [/(^|\.)instagram\.com$|^l\.instagram\.com$/, 'Instagram'],
  [/(^|\.)facebook\.com$|^lm?\.facebook\.com$|^l\.facebook\.com$/, 'Facebook'],
  [/(^|\.)tiktok\.com$/, 'TikTok'],
  [/(^|\.)x\.com$|(^|\.)twitter\.com$|^t\.co$/, 'X/Twitter'],
  [/(^|\.)linkedin\.com$|^lnkd\.in$/, 'LinkedIn'],
  [/(^|\.)google\./, 'Google'],
  [/(^|\.)bing\.com$/, 'Bing'],
  [/(^|\.)github\.com$/, 'GitHub'],
  [/^t\.me$|(^|\.)telegram\./, 'Telegram'],
  [/(^|\.)youtube\.com$|^youtu\.be$/, 'YouTube'],
  [/(^|\.)whatsapp\.com$|^wa\.me$/, 'WhatsApp'],
]

function prettyHost(host) {
  for (const [re, name] of HOST_NAMES) if (re.test(host)) return name
  return host
}

// Canonicalise source labels so utm aliases (ig, insta, instagram) and in-app
// names ("Instagram") all collapse to one value. Idempotent.
const SOURCE_ALIASES = {
  ig: 'Instagram', insta: 'Instagram', instagram: 'Instagram',
  fb: 'Facebook', facebook: 'Facebook', meta: 'Facebook',
  tt: 'TikTok', tiktok: 'TikTok',
  x: 'X/Twitter', twitter: 'X/Twitter',
  li: 'LinkedIn', linkedin: 'LinkedIn',
  yt: 'YouTube', youtube: 'YouTube',
  wa: 'WhatsApp', whatsapp: 'WhatsApp',
  tg: 'Telegram', telegram: 'Telegram',
  google: 'Google', bing: 'Bing', github: 'GitHub',
  direct: 'Direct',
}
export function normalizeSource(s) {
  if (!s) return 'Direct'
  const key = String(s).trim().toLowerCase()
  return SOURCE_ALIASES[key] || String(s).trim()
}

export function collectVisitor() {
  const ua = navigator.userAgent || ''
  const uaData = navigator.userAgentData

  // device type
  let device = 'Desktop'
  if (uaData?.mobile) device = 'Mobile'
  else if (/iPad|Tablet|PlayBook|Silk/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) device = 'Tablet'
  else if (/Mobi|iPhone|iPod|Android.*Mobile|Windows Phone/i.test(ua)) device = 'Mobile'

  // OS
  let os = 'Unknown'
  if (/Windows/i.test(ua)) os = 'Windows'
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS'
  else if (/Mac OS X|Macintosh/i.test(ua)) os = 'macOS'
  else if (/Android/i.test(ua)) os = 'Android'
  else if (/Linux/i.test(ua)) os = 'Linux'

  // in-app browser detection (these usually hide the referrer)
  const inApp =
    /Instagram/i.test(ua) ? 'Instagram'
    : /FBAN|FBAV|FB_IAB/i.test(ua) ? 'Facebook'
    : /TikTok|musical_ly|BytedanceWebview/i.test(ua) ? 'TikTok'
    : /\bLine\//i.test(ua) ? 'LINE'
    : /LinkedInApp/i.test(ua) ? 'LinkedIn'
    : /Twitter/i.test(ua) ? 'X/Twitter'
    : /WhatsApp/i.test(ua) ? 'WhatsApp'
    : /Telegram/i.test(ua) ? 'Telegram'
    : null

  // browser
  const browser = inApp ? `${inApp} app`
    : /Edg\//i.test(ua) ? 'Edge'
    : /OPR\/|Opera/i.test(ua) ? 'Opera'
    : /SamsungBrowser/i.test(ua) ? 'Samsung Internet'
    : /Firefox\//i.test(ua) ? 'Firefox'
    : /CriOS/i.test(ua) ? 'Chrome'
    : /Chrome\//i.test(ua) ? 'Chrome'
    : /Safari\//i.test(ua) ? 'Safari'
    : 'Other'

  // referrer host
  let refHost = ''
  try { if (document.referrer) refHost = new URL(document.referrer).hostname.replace(/^www\./, '') } catch { /* ignore */ }

  // UTM source
  let utm = ''
  try { utm = (new URLSearchParams(location.search).get('utm_source') || '').trim() } catch { /* ignore */ }

  // source priority
  const sameHost = refHost && refHost === location.hostname
  let source
  if (utm) source = utm
  else if (inApp) source = inApp
  else if (refHost && !sameHost) source = prettyHost(refHost)
  else source = 'Direct'
  source = normalizeSource(source)

  return {
    vid: getVisitorId(),
    device, os, browser, source,
    referrer: refHost || '',
    utm: utm || '',
    screen: `${window.screen?.width || 0}x${window.screen?.height || 0}`,
    lang: navigator.language || '',
  }
}
