import { useCallback, useMemo, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Circle } from '@react-google-maps/api';
import Badge from '../common/Badge';
import { Map as MapIcon } from 'lucide-react';
import LoadingState from '../common/LoadingState';

const mapContainerStyle = { width: '100%', height: '100%', borderRadius: '20px' };

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  styles: [
    { elementType: 'geometry', stylers: [{ color: '#1A1B25' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#FAF9F6' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2E2F3D' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
  ],
};

export default function GoogleMapView({ lat, lng, height = '200px', policeStation, onPlacesReady }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: ['places'],
  });

  const center = useMemo(
    () => ({ lat: lat ?? 28.6139, lng: lng ?? 77.209 }),
    [lat, lng]
  );

  const onLoad = useCallback((map) => {
    if (lat != null && lng != null) {
      const placesService = new google.maps.places.PlacesService(map);
      onPlacesReady?.(placesService);
    }
  }, [lat, lng, onPlacesReady]);

  if (loadError) return null;
  if (!isLoaded) {
    return (
      <div style={{ height }} className="card flex items-center justify-center">
        <LoadingState message="Loading map..." />
      </div>
    );
  }

  return (
    <div className="relative rounded-[var(--radius-card)] overflow-hidden" style={{ height }}>
      <div className="absolute top-3 left-3 z-10">
        <Badge variant="accent">
          <MapIcon className="w-3 h-3" aria-hidden="true" />
          Live map
        </Badge>
      </div>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={15}
        options={mapOptions}
        onLoad={onLoad}
      >
        {lat != null && lng != null && (
          <>
            <Marker
              position={{ lat, lng }}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: '#FF4D6D',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 3,
              }}
            />
            <Circle
              center={{ lat, lng }}
              radius={50}
              options={{ fillColor: '#FF4D6D', fillOpacity: 0.15, strokeColor: '#FF4D6D', strokeOpacity: 0.5 }}
            />
          </>
        )}
        {policeStation?.lat != null && policeStation?.lng != null && (
          <Marker
            position={{ lat: policeStation.lat, lng: policeStation.lng }}
            icon={{
              path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
              scale: 6,
              fillColor: '#6C63FF',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 2,
            }}
            title={policeStation.name}
          />
        )}
      </GoogleMap>
    </div>
  );
}
