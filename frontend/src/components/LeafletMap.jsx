import React from 'react'
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

class MapErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("Leaflet Map crash:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ height: this.props.height }} className="rounded-2xl border border-red-200 bg-red-50/50 p-6 flex flex-col items-center justify-center text-center text-red-900 shadow-sm">
          <p className="font-semibold text-sm">Interactive Map Unavailable</p>
          <p className="text-xs text-red-700/80 mt-1 max-w-md break-all font-mono">
            {this.state.error?.toString()}
          </p>
        </div>
      )
    }
    return this.props.children
  }
}

export function LeafletMap({ lat, lng, label, height = 240 }) {
  // Validate coordinates: must be finite numbers and not exactly 0 (which represents missing/null data converted by Number())
  const hasCoords = 
    typeof lat === 'number' && 
    typeof lng === 'number' && 
    Number.isFinite(lat) && 
    Number.isFinite(lng) && 
    lat !== 0 && 
    lng !== 0

  // Default to Johor Bahru center if no valid coords
  const center = hasCoords ? [lat, lng] : [1.4655, 103.7578]

  return (
    <MapErrorBoundary height={height}>
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
    </MapErrorBoundary>
  )
}
