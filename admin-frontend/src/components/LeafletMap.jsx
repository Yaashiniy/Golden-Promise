import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Icon } from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet default icon paths (Vite-friendly)
const markerIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

export function LeafletMap({ lat, lng, label, height = 240 }) {
  // Default to JB center if no coords
  const center = [lat ?? 1.4655, lng ?? 103.7578]
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng)

  return (
    <div style={{ height }} className="rounded-2xl overflow-hidden border border-[#7B1F2A]/10 shadow-md">
      <MapContainer
        center={center}
        zoom={hasCoords ? 14 : 10}
        scrollWheelZoom={false}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        {hasCoords && (
          <Marker position={center} icon={markerIcon}>
            <Popup>{label}</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  )
}
