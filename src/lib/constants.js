/** SafeHer design tokens & app constants */

export const COLORS = {
  charcoal: '#1A1B25',
  offWhite: '#FAF9F6',
  coral: '#FF4D6D',
  accent: '#6C63FF',
  teal: '#4ECDC4',
};

export const EMERGENCY_NUMBER = '112'; // India national emergency

export const SOS_COUNTDOWN_SEC = 3;
export const WALK_CHECKIN_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes
export const WALK_GRACE_PERIOD_MS = 2 * 60 * 1000; // 2 minutes
export const LOCATION_UPDATE_INTERVAL_MS = 10 * 1000; // 10 seconds

export const STORAGE_KEYS = {
  CONTACTS: 'safeher_contacts',
  SETTINGS: 'safeher_settings',
  INCIDENTS: 'safeher_incidents',
  WALK_SESSION: 'safeher_walk_session',
  LAST_LOCATION: 'safeher_last_location',
};

// MongoDB-ready schema shapes (pilot uses localStorage)
/** @typedef {{ id: string, name: string, phone: string, relationship?: string, createdAt: string }} EmergencyContact */
/** @typedef {{ id: string, lat: number, lng: number, accuracy?: number, timestamp: string }} LocationPoint */
/** @typedef {{ id: string, type: 'sos'|'walk_escalation', startedAt: string, endedAt?: string, locationTrail: LocationPoint[], contactsNotified: ContactAlertResult[], recordingIds: string[] }} IncidentRecord */
/** @typedef {{ contactId: string, contactName: string, method: 'share'|'sms'|'copy'|'failed', status: 'sent'|'failed'|'fallback' }} ContactAlertResult */

export const DEFAULT_SETTINGS = {
  shakeEnabled: true,
  shakeSensitivity: 15, // threshold — higher = less sensitive
  voiceEnabled: true,
  darkModeOverride: null, // null = auto (dark after 7pm)
  duressPin: null,
};

export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function buildMapsLink(lat, lng) {
  if (lat == null || lng == null) return null;
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

export function buildAlertMessage({ lat, lng, userName = 'I' }) {
  const link = buildMapsLink(lat, lng);
  const locationPart = link
    ? `My live location: ${link}`
    : 'Location unavailable — please call me immediately.';
  return `🆘 SAFEHER EMERGENCY ALERT\n\n${userName} need help NOW!\n${locationPart}\n\nThis is an automated safety alert from SafeHer.`;
}

export function buildSafeMessage({ userName = 'I' }) {
  return `✅ SafeHer Update: ${userName} am safe now. Thank you for checking in.`;
}

export function formatDistance(meters) {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
