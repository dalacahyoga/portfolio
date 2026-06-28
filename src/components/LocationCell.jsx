import { getGoogleMapsLink, getGoogleMapsEmbed } from '../lib/geocoding.js'

// Shows an approximate (IP-based) location: city name, a Google Maps preview,
// coordinates, and a link. Rendered inside each visitor card.
export default function LocationCell({ location }) {
  if (!location || location.latitude == null || location.longitude == null) {
    return <p className="loc-empty">Lokasi tidak tersedia</p>
  }

  const { latitude: lat, longitude: lng, city } = location
  const mapsLink = getGoogleMapsLink(lat, lng)
  const embed = getGoogleMapsEmbed(lat, lng)

  return (
    <div className="loc-cell">
      {city && <div className="loc-name">📍 {city}</div>}
      {embed && (
        <div className="loc-map">
          <iframe
            key={embed}
            title={`Peta ${city || `${lat}, ${lng}`}`}
            src={embed}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )}
      <div className="loc-meta">
        <span className="admin-mono">{Number(lat).toFixed(4)}, {Number(lng).toFixed(4)}</span>
        {mapsLink && <a href={mapsLink} target="_blank" rel="noreferrer">Buka di Maps →</a>}
      </div>
      <div className="loc-note">📡 Perkiraan via IP · akurasi level kota</div>
    </div>
  )
}
