import { EMERGENCY_NUMBER, haversineDistance, formatDistance } from './constants';

/**
 * Find nearest police station.
 * Online: Google Places API via Maps JS (handled in PoliceFinder component).
 * Offline: returns cached last result or national emergency fallback.
 * NOTE: Does NOT auto-dispatch police — requires formal partnership with emergency services.
 */

const CACHE_KEY = 'safeher_police_cache';

export function getCachedPoliceStation() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function cachePoliceStation(station) {
  localStorage.setItem(CACHE_KEY, JSON.stringify({ ...station, cachedAt: new Date().toISOString() }));
}

export function getEmergencyFallback() {
  return {
    name: 'National Emergency (112)',
    phone: EMERGENCY_NUMBER,
    address: 'India — dial 112 for police, ambulance, or fire',
    lat: null,
    lng: null,
    distance: null,
    isFallback: true,
    label: 'Emergency Hotline',
  };
}

export async function findPoliceNearbyPlacesService({ placesService, lat, lng }) {
  return new Promise((resolve) => {
    if (!placesService || lat == null || lng == null) {
      resolve(getCachedPoliceStation() || getEmergencyFallback());
      return;
    }

    const request = {
      location: new google.maps.LatLng(lat, lng),
      radius: 10000,
      type: 'police',
      keyword: 'police station',
    };

    placesService.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results?.length) {
        const nearest = results[0];
        const stationLat = nearest.geometry.location.lat();
        const stationLng = nearest.geometry.location.lng();
        const distance = haversineDistance(lat, lng, stationLat, stationLng);

        const station = {
          name: nearest.name,
          phone: nearest.formatted_phone_number || EMERGENCY_NUMBER,
          address: nearest.vicinity || nearest.formatted_address || '',
          lat: stationLat,
          lng: stationLng,
          distance: formatDistance(distance),
          distanceMeters: distance,
          placeId: nearest.place_id,
          isFallback: false,
          label: 'Find & Call Nearest Police',
        };

        cachePoliceStation(station);
        resolve(station);
      } else {
        resolve(getCachedPoliceStation() || getEmergencyFallback());
      }
    });
  });
}

export async function findPoliceOffline(lat, lng) {
  const cached = getCachedPoliceStation();
  if (cached) {
    if (lat != null && cached.lat != null) {
      const dist = haversineDistance(lat, lng, cached.lat, cached.lng);
      return { ...cached, distance: formatDistance(dist), distanceMeters: dist };
    }
    return cached;
  }
  return getEmergencyFallback();
}
