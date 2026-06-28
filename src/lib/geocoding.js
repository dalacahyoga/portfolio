// Approximate visitor location from their IP — no browser permission needed,
// city-level accuracy. Returns { latitude, longitude, source:'ip', city } or null.
export async function getIpLocation() {
  try {
    const res = await fetch('https://ipwho.is/')
    if (!res.ok) return null
    const d = await res.json()
    if (d && d.success !== false && typeof d.latitude === 'number' && typeof d.longitude === 'number') {
      return {
        latitude: d.latitude,
        longitude: d.longitude,
        source: 'ip',
        city: [d.city, d.region, d.country].filter(Boolean).join(', '),
      }
    }
    return null
  } catch {
    return null
  }
}

// Google Maps link (opens the location).
export const getGoogleMapsLink = (lat, lng) =>
  (lat == null || lng == null) ? null : `https://www.google.com/maps?q=${lat},${lng}`

// Embeddable Google Maps URL (no API key via output=embed). t=h → hybrid
// satellite (imagery + place labels) as the default view.
export const getGoogleMapsEmbed = (lat, lng) =>
  (lat == null || lng == null) ? null : `https://maps.google.com/maps?q=${lat},${lng}&z=12&t=h&hl=id&output=embed`
