import { openDB } from 'idb';

const DB_NAME = 'safeher-recordings';
const STORE = 'recordings';

async function getDb() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' });
        store.createIndex('incidentId', 'incidentId');
        store.createIndex('createdAt', 'createdAt');
      }
    },
  });
}

// Production: upload blobs to S3/Cloud Storage via backend API
export async function saveRecordingBlob({ id, blob, incidentId, mimeType, durationMs }) {
  const db = await getDb();
  await db.put(STORE, {
    id,
    blob,
    incidentId,
    mimeType,
    durationMs,
    createdAt: new Date().toISOString(),
  });
}

export async function getRecording(id) {
  const db = await getDb();
  return db.get(STORE, id);
}

export async function getRecordingsByIncident(incidentId) {
  const db = await getDb();
  return db.getAllFromIndex(STORE, 'incidentId', incidentId);
}

export async function getAllRecordings() {
  const db = await getDb();
  return db.getAll(STORE);
}

export async function deleteRecording(id) {
  const db = await getDb();
  await db.delete(STORE, id);
}

export function createRecordingUrl(blob) {
  return URL.createObjectURL(blob);
}

export function revokeRecordingUrl(url) {
  URL.revokeObjectURL(url);
}
