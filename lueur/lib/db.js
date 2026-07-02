// Base SQLite locale (expo-sqlite).
// Elle est la source de vérité pour la saisie : l'écriture est instantanée et
// marche hors-ligne. La couche `sync.js` s'occupe ensuite de pousser vers
// Supabase (best-effort) et de tirer les changements des autres appareils.
//
// Chaque entrée porte un `user_id` (l'utilisatrice connectée) et un
// `synced_at`. Si `synced_at` est NULL, c'est une écriture qui n'a pas encore
// été confirmée par le serveur — la couche sync la ressaie plus tard.

import * as SQLite from 'expo-sqlite';

let dbPromise = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('lueur.db');
  }
  return dbPromise;
}

export async function initDb() {
  const db = await getDb();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS entries (
      id           TEXT PRIMARY KEY,        -- uuid généré localement
      user_id      TEXT NOT NULL,
      day          TEXT NOT NULL,           -- AAAA-MM-JJ
      symptom_key  TEXT NOT NULL,
      intensity    INTEGER NOT NULL,        -- 0..3
      updated_at   TEXT NOT NULL,           -- ISO 8601 UTC
      synced_at    TEXT,                    -- NULL = à pousser
      UNIQUE(user_id, day, symptom_key)
    );

    CREATE INDEX IF NOT EXISTS idx_entries_dirty
      ON entries(user_id) WHERE synced_at IS NULL;

    CREATE TABLE IF NOT EXISTS profile (
      user_id      TEXT PRIMARY KEY,
      first_name   TEXT DEFAULT '',
      last_name    TEXT DEFAULT '',
      dob          TEXT DEFAULT '',
      phone        TEXT DEFAULT '',
      zip          TEXT DEFAULT '',
      city         TEXT DEFAULT '',
      newsletter   INTEGER DEFAULT 1,
      updated_at   TEXT NOT NULL,
      synced_at    TEXT
    );
  `);
}

export function today() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

// UUID v4 court, sans dépendance.
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ─── Entrées quotidiennes ─────────────────────────────────────────────────

// Enregistre l'intensité d'un symptôme pour l'utilisatrice et le jour donnés.
// Renvoie l'entrée locale mise à jour (utile pour déclencher un push immédiat).
export async function setIntensity(userId, day, symptomKey, intensity) {
  const db = await getDb();
  const now = new Date().toISOString();
  const existing = await db.getFirstAsync(
    `SELECT id FROM entries WHERE user_id = ? AND day = ? AND symptom_key = ?;`,
    [userId, day, symptomKey]
  );
  if (existing) {
    await db.runAsync(
      `UPDATE entries SET intensity = ?, updated_at = ?, synced_at = NULL WHERE id = ?;`,
      [intensity, now, existing.id]
    );
    return { id: existing.id, user_id: userId, day, symptom_key: symptomKey, intensity, updated_at: now };
  }
  const id = uuid();
  await db.runAsync(
    `INSERT INTO entries (id, user_id, day, symptom_key, intensity, updated_at, synced_at)
     VALUES (?, ?, ?, ?, ?, ?, NULL);`,
    [id, userId, day, symptomKey, intensity, now]
  );
  return { id, user_id: userId, day, symptom_key: symptomKey, intensity, updated_at: now };
}

export async function getDay(userId, day) {
  const db = await getDb();
  const rows = await db.getAllAsync(
    `SELECT symptom_key, intensity FROM entries WHERE user_id = ? AND day = ?;`,
    [userId, day]
  );
  const result = {};
  for (const row of rows) result[row.symptom_key] = row.intensity;
  return result;
}

export async function getRecent(userId, days = 30) {
  const db = await getDb();
  return db.getAllAsync(
    `SELECT day, symptom_key, intensity FROM entries
     WHERE user_id = ?
     ORDER BY day DESC LIMIT ?;`,
    [userId, days * 12]
  );
}

// ─── Support de la couche sync ────────────────────────────────────────────

export async function getDirtyEntries(userId, limit = 200) {
  const db = await getDb();
  return db.getAllAsync(
    `SELECT id, user_id, day, symptom_key, intensity, updated_at
     FROM entries
     WHERE user_id = ? AND synced_at IS NULL
     LIMIT ?;`,
    [userId, limit]
  );
}

export async function markEntrySynced(id, syncedAt) {
  const db = await getDb();
  await db.runAsync(
    `UPDATE entries SET synced_at = ? WHERE id = ? AND synced_at IS NULL;`,
    [syncedAt, id]
  );
}

// Applique une entrée reçue du serveur. Last-Write-Wins sur updated_at.
// N'écrase pas une écriture locale plus récente non encore synchronisée.
export async function upsertRemoteEntry(remote) {
  const db = await getDb();
  const existing = await db.getFirstAsync(
    `SELECT id, updated_at, synced_at FROM entries
     WHERE user_id = ? AND day = ? AND symptom_key = ?;`,
    [remote.user_id, remote.day, remote.symptom_key]
  );
  if (existing) {
    if (existing.synced_at === null && existing.updated_at > remote.updated_at) return;
    await db.runAsync(
      `UPDATE entries SET intensity = ?, updated_at = ?, synced_at = ? WHERE id = ?;`,
      [remote.intensity, remote.updated_at, remote.updated_at, existing.id]
    );
    return;
  }
  await db.runAsync(
    `INSERT INTO entries (id, user_id, day, symptom_key, intensity, updated_at, synced_at)
     VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [remote.id || uuid(), remote.user_id, remote.day, remote.symptom_key, remote.intensity, remote.updated_at, remote.updated_at]
  );
}

export async function getMaxEntryUpdatedAt(userId) {
  const db = await getDb();
  const row = await db.getFirstAsync(
    `SELECT MAX(updated_at) AS max_at FROM entries WHERE user_id = ? AND synced_at IS NOT NULL;`,
    [userId]
  );
  return row?.max_at || null;
}

// ─── Profil ───────────────────────────────────────────────────────────────

export async function saveProfile(userId, fields) {
  const db = await getDb();
  const now = new Date().toISOString();
  const existing = await db.getFirstAsync(
    `SELECT user_id FROM profile WHERE user_id = ?;`,
    [userId]
  );
  const values = {
    first_name: fields.firstName ?? '',
    last_name: fields.lastName ?? '',
    dob: fields.dob ?? '',
    phone: fields.phone ?? '',
    zip: fields.zip ?? '',
    city: fields.city ?? '',
    newsletter: fields.newsletter === false ? 0 : 1,
  };
  if (existing) {
    await db.runAsync(
      `UPDATE profile SET first_name = ?, last_name = ?, dob = ?, phone = ?, zip = ?, city = ?, newsletter = ?, updated_at = ?, synced_at = NULL
       WHERE user_id = ?;`,
      [values.first_name, values.last_name, values.dob, values.phone, values.zip, values.city, values.newsletter, now, userId]
    );
  } else {
    await db.runAsync(
      `INSERT INTO profile (user_id, first_name, last_name, dob, phone, zip, city, newsletter, updated_at, synced_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL);`,
      [userId, values.first_name, values.last_name, values.dob, values.phone, values.zip, values.city, values.newsletter, now]
    );
  }
  return { ...values, updated_at: now };
}

export async function getProfile(userId) {
  const db = await getDb();
  return db.getFirstAsync(`SELECT * FROM profile WHERE user_id = ?;`, [userId]);
}

export async function markProfileSynced(userId, syncedAt) {
  const db = await getDb();
  await db.runAsync(
    `UPDATE profile SET synced_at = ? WHERE user_id = ? AND synced_at IS NULL;`,
    [syncedAt, userId]
  );
}

export async function getDirtyProfile(userId) {
  const db = await getDb();
  return db.getFirstAsync(
    `SELECT * FROM profile WHERE user_id = ? AND synced_at IS NULL;`,
    [userId]
  );
}
