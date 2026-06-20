import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import Badge from '../common/Badge';
import { WifiOff } from 'lucide-react';

const userIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div style="width:16px;height:16px;background:#FF4D6D;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const policeIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div style="width:14px;height:14px;background:#6C63FF;border:2px solid white;border-radius:3px;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

function MapUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, zoom || map.getZoom());
  }, [center, zoom, map]);
  return null;
}

export default function LeafletMap({ lat, lng, height = '200px', policeStation, showOfflineBadge = true, trail = [] }) {
  const defaultCenter = lat != null && lng != null ? [lat, lng] : [28.6139, 77.209]; // Delhi fallback
  const center = lat != null && lng != null ? [lat, lng] : defaultCenter;

  return (
    <div className="relative rounded-[var(--radius-card)] overflow-hidden" style={{ height }}>
      {showOfflineBadge && (
        <div className="absolute top-3 left-3 z-[1000]">
          <Badge variant="offline">
            <WifiOff className="w-3 h-3" aria-hidden="true" />
            Offline mode — using cached map
          </Badge>
        </div>
      )}
      <MapContainer
        center={center}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        zoomControl={false}
        attributionControl
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <MapUpdater center={center} zoom={15} />
        {lat != null && lng != null && (
          <>
            <Marker position={[lat, lng]} icon={userIcon}>
              <Popup>Your location</Popup>
            </Marker>
            <Circle center={[lat, lng]} radius={50} pathOptions={{ color: '#FF4D6D', fillColor: '#FF4D6D', fillOpacity: 0.15 }} />
          </>
        )}
        {trail.length > 1 && (
          <Circle
            center={[trail[trail.length - 1].lat, trail[trail.length - 1].lng]}
            radius={30}
            pathOptions={{ color: '#6C63FF', fillOpacity: 0 }}
          />
        )}
        {policeStation?.lat != null && policeStation?.lng != null && (
          <Marker position={[policeStation.lat, policeStation.lng]} icon={policeIcon}>
            <Popup>{policeStation.name}</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
