import { STORAGE_KEYS, DEFAULT_SETTINGS, generateId } from './constants';

// Pilot data layer — swap localStorage calls for API fetch when backend is live
// TODO: replace with API call to /api/contacts when backend is live

export function getContacts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONTACTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveContacts(contacts) {
  localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
}

export function addContact(contact) {
  const contacts = getContacts();
  const newContact = { ...contact, id: generateId(), createdAt: new Date().toISOString() };
  contacts.push(newContact);
  saveContacts(contacts);
  return newContact;
}

export function updateContact(id, updates) {
  const contacts = getContacts().map((c) => (c.id === id ? { ...c, ...updates } : c));
  saveContacts(contacts);
  return contacts;
}

export function deleteContact(id) {
  const contacts = getContacts().filter((c) => c.id !== id);
  saveContacts(contacts);
  return contacts;
}

export function getSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings) {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

export function getIncidents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INCIDENTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveIncident(incident) {
  const incidents = getIncidents();
  incidents.unshift(incident);
  localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(incidents.slice(0, 50)));
  return incident;
}

export function updateIncident(id, updates) {
  const incidents = getIncidents().map((i) => (i.id === id ? { ...i, ...updates } : i));
  localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(incidents));
}

export function saveLastLocation(location) {
  localStorage.setItem(STORAGE_KEYS.LAST_LOCATION, JSON.stringify(location));
}

export function getLastLocation() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LAST_LOCATION);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getWalkSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WALK_SESSION);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveWalkSession(session) {
  if (session) {
    localStorage.setItem(STORAGE_KEYS.WALK_SESSION, JSON.stringify(session));
  } else {
    localStorage.removeItem(STORAGE_KEYS.WALK_SESSION);
  }
}
