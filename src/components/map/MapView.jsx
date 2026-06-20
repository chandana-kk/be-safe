import { useState, useEffect, useCallback } from 'react';
import { shouldUseGoogleMaps } from '../../lib/location';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { findPoliceOffline, findPoliceNearbyPlacesService } from '../../lib/police';
import LeafletMap from './LeafletMap';
import GoogleMapView from './GoogleMapView';
import LoadingState from '../common/LoadingState';

/**
 * MapView — single abstraction for hybrid online/offline maps.
 * Consumers never need to know which provider is active.
 */
export default function MapView({ lat, lng, height = '200px', policeStation: externalPolice, onPoliceFound, trail = [] }) {
  const isOnline = useOnlineStatus();
  const useGoogle = shouldUseGoogleMaps(isOnline);
  const [policeStation, setPoliceStation] = useState(externalPolice || null);
  const [mapLoading, setMapLoading] = useState(true);

  useEffect(() => {
    setMapLoading(false);
  }, [useGoogle]);

  useEffect(() => {
    if (externalPolice) setPoliceStation(externalPolice);
  }, [externalPolice]);

  const handlePlacesReady = useCallback(async (placesService) => {
    if (lat == null || lng == null) return;
    const station = await findPoliceNearbyPlacesService({ placesService, lat, lng });
    setPoliceStation(station);
    onPoliceFound?.(station);
  }, [lat, lng, onPoliceFound]);

  useEffect(() => {
    if (!useGoogle && lat != null && lng != null) {
      findPoliceOffline(lat, lng).then((station) => {
        setPoliceStation(station);
        onPoliceFound?.(station);
      });
    }
  }, [useGoogle, lat, lng, onPoliceFound]);

  if (mapLoading) {
    return (
      <div style={{ height }} className="card">
        <LoadingState message="Preparing map..." />
      </div>
    );
  }

  if (useGoogle) {
    return (
      <GoogleMapView
        lat={lat}
        lng={lng}
        height={height}
        policeStation={policeStation}
        onPlacesReady={handlePlacesReady}
      />
    );
  }

  return (
    <LeafletMap
      lat={lat}
      lng={lng}
      height={height}
      policeStation={policeStation}
      showOfflineBadge
      trail={trail}
    />
  );
}

export { MapView };
