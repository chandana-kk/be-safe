import { saveLastLocation, getLastLocation } from './storage';
import { LOCATION_UPDATE_INTERVAL_MS } from './constants';

export function getCurrentPosition(options = {}) {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ error: 'Geolocation not supported', location: getLastLocation() });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const location = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: new Date().toISOString(),
        };
        saveLastLocation(location);
        resolve({ location, error: null });
      },
      (err) => {
        resolve({
          error: err.message || 'Permission denied',
          location: getLastLocation(),
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
        ...options,
      }
    );
  });
}

export function watchPosition(onUpdate, onError) {
  if (!navigator.geolocation) {
    onError?.('Geolocation not supported');
    return () => {};
  }

  const id = navigator.geolocation.watchPosition(
    (pos) => {
      const location = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        timestamp: new Date().toISOString(),
      };
      saveLastLocation(location);
      onUpdate(location);
    },
    (err) => onError?.(err.message),
    { enableHighAccuracy: true, maximumAge: 5000 }
  );

  return () => navigator.geolocation.clearWatch(id);
}

export function startLocationPolling(callback, intervalMs = LOCATION_UPDATE_INTERVAL_MS) {
  getCurrentPosition().then(({ location }) => {
    if (location) callback(location);
  });

  const interval = setInterval(async () => {
    const { location } = await getCurrentPosition();
    if (location) callback(location);
  }, intervalMs);

  return () => clearInterval(interval);
}

export function hasGoogleMapsKey() {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  return Boolean(key && key !== 'your_google_maps_api_key_here' && key.length > 10);
}

export function shouldUseGoogleMaps(isOnline) {
  return isOnline && hasGoogleMapsKey();
}
