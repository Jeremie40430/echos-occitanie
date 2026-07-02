// Base SQLite locale — source de vérité pour l'UI (écriture instantanée,
// marche hors-ligne). La couche `sync.js` pousse ensuite les lignes "dirty"
// (synced_at IS NULL) vers Supabase et tire les changements plus récents des
// autres appareils.
//
// Toutes les tables sont scopées par `user_id` : chaque utilisatrice ne voit
// que ses données, et un changement de compte sur le même téléphone ne fuit
// pas les données d'une session à l'autre.

import * as SQLite from 'expo-sqlite';

const SCHEMA_VERSION = 2;
let dbPromise = null;

function getDb() {
  if (!dbPromise) dbPromise = SQLite.openDatabaseAsync('lueur.db');
  return dbPromise;
}

function now() {
  return new Date().toISOString();
}

export async function initDb() {
  const db = await getDb();
  const row = await db.getFirstAsync(`PRAGMA user_version;`);
  const current = row?.user_version ?? 0;

  if (current < SCHEMA_VERSION) {
    // Migration destructive : le schéma évolue (ajout de user_id + synced_at),
    // on repart d'un état propre. Sans données de production à préserver
    // aujourd'hui, c'est le chemin le plus sûr.
    await db.execAsync(`
      DROP TABLE IF EXISTS entries;
      DROP TABLE IF EXISTS notes;
      DROP TABLE IF EXISTS profile;
    `);
  }

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS entries (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id      TEXT NOT NULL,
      day          TEXT NOT NULL,
      symptom_key  TEXT NOT NULL,
      intensity    INTEGER NOT NULL DEFAULT 0,
      updated_at   TEXT NOT NULL,
      synced_at    TEXT,
      UNIQUE(user_id, day, symptom_key)
    );
    CREATE INDEX IF NOT EXISTS idx_entries_dirty
      ON entries(user_id) WHERE synced_at IS NULL;

    CREATE TABLE IF NOT EXISTS notes (
      user_id      TEXT NOT NULL,
      day          TEXT NOT NULL,
      note         TEXT NOT NULL DEFAULT '',
      updated_at   TEXT NOT NULL,
      synced_at    TEXT,
      PRIMARY KEY (user_id, day)
    );

    CREATE TABLE IF NOT EXISTS profile (
      user_id      TEXT NOT NULL,
      key          TEXT NOT NULL,
      value        TEXT NOT NULL DEFAULT '',
      updated_at   TEXT NOT NULL,
      synced_at    TEXT,
      PRIMARY KEY (user_id, key)
    );

    PRAGMA user_version = ${SCHEMA_VERSION};
  `);
}

// ─── Symptômes ────────────────────────────────────────────────────────────

// Écrit ou met à jour l'intensité d'un symptôme. Sans user, no-op silencieux
// (évite d'écrire "orphelin" pendant les micro-latences de l'auth au boot).
export async function setIntensity(userId, day, symptomKey, intensity) {
  if (!userId) return;
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO entries (user_id, day, symptom_key, intensity, updated_at, synced_at)
     VALUES (?, ?, ?, ?, ?, NULL)
     ON CONFLICT(user_id, day, symptom_key)
     DO UPDATE SET intensity = excluded.intensity,
                   updated_at = excluded.updated_at,
                   synced_at = NULL;`,
    [userId, day, symptomKey, intensity, now()]
  );
}

export async function getDay(userId, day) {
  if (!userId) return {};
  const db = await getDb();
  const rows = await db.getAllAsync(
    `SELECT symptom_key, intensity FROM entries WHERE user_id = ? AND day = ?;`,
    [userId, day]
  );
  const result = {};
  for (const row of rows) result[row.symptom_key] = row.intensity;
  return result;
}

export async function getRecentEntries(userId, days = 7) {
  if (!userId) return [];
  const db = await getDb();
  return db.getAllAsync(
    `SELECT day, symptom_key, intensity FROM entries
     WHERE user_id = ?
     ORDER BY day DESC LIMIT ?;`,
    [userId, days * 10]
  );
}

// ─── Notes ────────────────────────────────────────────────────────────────

export async function setNote(userId, day, note) {
  if (!userId) return;
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO notes (user_id, day, note, updated_at, synced_at)
     VALUES (?, ?, ?, ?, NULL)
     ON CONFLICT(user_id, day)
     DO UPDATE SET note = excluded.note,
                   updated_at = excluded.updated_at,
                   synced_at = NULL;`,
    [userId, day, note, now()]
  );
}

export async function getNote(userId, day) {
  if (!userId) return '';
  const db = await getDb();
  const row = await db.getFirstAsync(
    `SELECT note FROM notes WHERE user_id = ? AND day = ?;`,
    [userId, day]
  );
  return row ? row.note : '';
}

// ─── Profil (clef/valeur libre) ───────────────────────────────────────────

export async function saveProfile(userId, data) {
  if (!userId) return;
  const db = await getDb();
  const ts = now();
  for (const [key, value] of Object.entries(data)) {
    await db.runAsync(
      `INSERT INTO profile (user_id, key, value, updated_at, synced_at)
       VALUES (?, ?, ?, ?, NULL)
       ON CONFLICT(user_id, key)
       DO UPDATE SET value = excluded.value,
                     updated_at = excluded.updated_at,
                     synced_at = NULL;`,
      [userId, key, String(value), ts]
    );
  }
}

export async function getProfile(userId) {
  if (!userId) return {};
  const db = await getDb();
  const rows = await db.getAllAsync(
    `SELECT key, value FROM profile WHERE user_id = ?;`,
    [userId]
  );
  const result = {};
  for (const row of rows) result[row.key] = row.value;
  return result;
}

// ─── Support de la couche sync ────────────────────────────────────────────

export async function getDirtyEntries(userId, limit = 200) {
  if (!userId) return [];
  const db = await getDb();
  return db.getAllAsync(
    `SELECT user_id, day, symptom_key, intensity, updated_at
     FROM entries
     WHERE user_id = ? AND synced_at IS NULL
     LIMIT ?;`,
    [userId, limit]
  );
}

export async function markEntrySynced(userId, day, symptomKey, syncedAt) {
  const db = await getDb();
  await db.runAsync(
    `UPDATE entries SET synced_at = ?
     WHERE user_id = ? AND day = ? AND symptom_key = ? AND synced_at IS NULL;`,
    [syncedAt, userId, day, symptomKey]
  );
}

export async function upsertRemoteEntry(remote) {
  const db = await getDb();
  const existing = await db.getFirstAsync(
    `SELECT updated_at, synced_at FROM entries
     WHERE user_id = ? AND day = ? AND symptom_key = ?;`,
    [remote.user_id, remote.day, remote.symptom_key]
  );
  if (existing) {
    // Si un dirty local est plus récent, on ne l'écrase pas.
    if (existing.synced_at === null && existing.updated_at > remote.updated_at) return;
    await db.runAsync(
      `UPDATE entries SET intensity = ?, updated_at = ?, synced_at = ?
       WHERE user_id = ? AND day = ? AND symptom_key = ?;`,
      [remote.intensity, remote.updated_at, remote.updated_at, remote.user_id, remote.day, remote.symptom_key]
    );
    return;
  }
  await db.runAsync(
    `INSERT INTO entries (user_id, day, symptom_key, intensity, updated_at, synced_at)
     VALUES (?, ?, ?, ?, ?, ?);`,
    [remote.user_id, remote.day, remote.symptom_key, remote.intensity, remote.updated_at, remote.updated_at]
  );
}

export async function getMaxEntryUpdatedAt(userId) {
  if (!userId) return null;
  const db = await getDb();
  const row = await db.getFirstAsync(
    `SELECT MAX(updated_at) AS max_at FROM entries
     WHERE user_id = ? AND synced_at IS NOT NULL;`,
    [userId]
  );
  return row?.max_at || null;
}

export async function getDirtyNotes(userId, limit = 200) {
  if (!userId) return [];
  const db = await getDb();
  return db.getAllAsync(
    `SELECT user_id, day, note, updated_at
     FROM notes
     WHERE user_id = ? AND synced_at IS NULL
     LIMIT ?;`,
    [userId, limit]
  );
}

export async function markNoteSynced(userId, day, syncedAt) {
  const db = await getDb();
  await db.runAsync(
    `UPDATE notes SET synced_at = ?
     WHERE user_id = ? AND day = ? AND synced_at IS NULL;`,
    [syncedAt, userId, day]
  );
}

export async function upsertRemoteNote(remote) {
  const db = await getDb();
  const existing = await db.getFirstAsync(
    `SELECT updated_at, synced_at FROM notes WHERE user_id = ? AND day = ?;`,
    [remote.user_id, remote.day]
  );
  if (existing) {
    if (existing.synced_at === null && existing.updated_at > remote.updated_at) return;
    await db.runAsync(
      `UPDATE notes SET note = ?, updated_at = ?, synced_at = ?
       WHERE user_id = ? AND day = ?;`,
      [remote.note, remote.updated_at, remote.updated_at, remote.user_id, remote.day]
    );
    return;
  }
  await db.runAsync(
    `INSERT INTO notes (user_id, day, note, updated_at, synced_at)
     VALUES (?, ?, ?, ?, ?);`,
    [remote.user_id, remote.day, remote.note, remote.updated_at, remote.updated_at]
  );
}

export async function getMaxNoteUpdatedAt(userId) {
  if (!userId) return null;
  const db = await getDb();
  const row = await db.getFirstAsync(
    `SELECT MAX(updated_at) AS max_at FROM notes
     WHERE user_id = ? AND synced_at IS NOT NULL;`,
    [userId]
  );
  return row?.max_at || null;
}

export async function hasDirtyProfile(userId) {
  if (!userId) return false;
  const db = await getDb();
  const row = await db.getFirstAsync(
    `SELECT COUNT(*) AS n FROM profile WHERE user_id = ? AND synced_at IS NULL;`,
    [userId]
  );
  return (row?.n ?? 0) > 0;
}

export async function getProfileMaxUpdatedAt(userId) {
  if (!userId) return null;
  const db = await getDb();
  const row = await db.getFirstAsync(
    `SELECT MAX(updated_at) AS max_at FROM profile WHERE user_id = ?;`,
    [userId]
  );
  return row?.max_at || null;
}

export async function markProfileSynced(userId, syncedAt) {
  const db = await getDb();
  await db.runAsync(
    `UPDATE profile SET synced_at = ?
     WHERE user_id = ? AND synced_at IS NULL;`,
    [syncedAt, userId]
  );
}

// Remplace le profil local par la version serveur (utilisé par la sync pull).
export async function replaceLocalProfile(userId, data, updatedAt) {
  if (!userId) return;
  const db = await getDb();
  for (const [key, value] of Object.entries(data)) {
    await db.runAsync(
      `INSERT INTO profile (user_id, key, value, updated_at, synced_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(user_id, key)
       DO UPDATE SET value = excluded.value,
                     updated_at = excluded.updated_at,
                     synced_at = excluded.updated_at;`,
      [userId, key, String(value ?? ''), updatedAt, updatedAt]
    );
  }
}
