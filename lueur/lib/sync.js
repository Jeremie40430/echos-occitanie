// Couche de synchronisation Supabase.
//
// L'UI écrit toujours dans SQLite (instantané, hors-ligne). Cette couche :
//   • pousse les entrées / notes / profils "dirty" vers Supabase,
//   • tire les changements plus récents des autres appareils,
//   • last-write-wins sur `updated_at`.
//
// Un seul `runSync` à la fois. Les erreurs réseau sont silencieuses — la
// sync est best-effort, les données restent en local et seront ressayées.

import { supabase } from './supabaseClient';
import {
  getDirtyEntries, markEntrySynced, upsertRemoteEntry, getMaxEntryUpdatedAt,
  getDirtyNotes,   markNoteSynced,   upsertRemoteNote,   getMaxNoteUpdatedAt,
  hasDirtyProfile, getProfile,       markProfileSynced,  getProfileMaxUpdatedAt,
  replaceLocalProfile,
} from './db';

let running = false;

export async function runSync(userId) {
  if (!userId || running) return;
  running = true;
  try {
    await pushDirtyEntries(userId);
    await pushDirtyNotes(userId);
    await pushDirtyProfile(userId);
    await pullEntries(userId);
    await pullNotes(userId);
    await pullProfile(userId);
  } catch (e) {
    console.warn('[sync] échec', e?.message || e);
  } finally {
    running = false;
  }
}

// ─── Push ─────────────────────────────────────────────────────────────────

async function pushDirtyEntries(userId) {
  const dirty = await getDirtyEntries(userId);
  if (dirty.length === 0) return;
  const payload = dirty.map(e => ({
    user_id: e.user_id,
    day: e.day,
    symptom_key: e.symptom_key,
    intensity: e.intensity,
    updated_at: e.updated_at,
  }));
  const { error } = await supabase
    .from('entries')
    .upsert(payload, { onConflict: 'user_id,day,symptom_key' });
  if (error) throw error;
  for (const e of dirty) await markEntrySynced(e.user_id, e.day, e.symptom_key, e.updated_at);
}

async function pushDirtyNotes(userId) {
  const dirty = await getDirtyNotes(userId);
  if (dirty.length === 0) return;
  const payload = dirty.map(n => ({
    user_id: n.user_id,
    day: n.day,
    note: n.note,
    updated_at: n.updated_at,
  }));
  const { error } = await supabase
    .from('notes')
    .upsert(payload, { onConflict: 'user_id,day' });
  if (error) throw error;
  for (const n of dirty) await markNoteSynced(n.user_id, n.day, n.updated_at);
}

// Convertit le profil clef/valeur local en colonnes Supabase.
const PROFILE_KEYS = ['first_name','last_name','dob','phone','zip','city'];
const CAMEL_TO_SNAKE = {
  firstName: 'first_name',
  lastName: 'last_name',
};

function toSnakeProfile(local) {
  const out = {};
  for (const [k, v] of Object.entries(local)) {
    const key = CAMEL_TO_SNAKE[k] || k;
    if (PROFILE_KEYS.includes(key)) out[key] = v;
    else if (key === 'newsletter') out.newsletter = v === true || v === 'true';
  }
  return out;
}

function toCamelProfile(remote) {
  return {
    firstName: remote.first_name ?? '',
    lastName: remote.last_name ?? '',
    dob: remote.dob ?? '',
    phone: remote.phone ?? '',
    zip: remote.zip ?? '',
    city: remote.city ?? '',
    newsletter: remote.newsletter === true ? 'true' : 'false',
  };
}

async function pushDirtyProfile(userId) {
  if (!(await hasDirtyProfile(userId))) return;
  const local = await getProfile(userId);
  const payload = { id: userId, ...toSnakeProfile(local) };
  const updatedAt = await getProfileMaxUpdatedAt(userId);
  if (updatedAt) payload.updated_at = updatedAt;
  const { error } = await supabase.from('profiles').upsert(payload);
  if (error) throw error;
  await markProfileSynced(userId, updatedAt || new Date().toISOString());
}

// ─── Pull ─────────────────────────────────────────────────────────────────

async function pullEntries(userId) {
  const cursor = await getMaxEntryUpdatedAt(userId);
  let q = supabase.from('entries')
    .select('user_id,day,symptom_key,intensity,updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: true })
    .limit(500);
  if (cursor) q = q.gt('updated_at', cursor);
  const { data, error } = await q;
  if (error) throw error;
  for (const row of data || []) await upsertRemoteEntry(row);
}

async function pullNotes(userId) {
  const cursor = await getMaxNoteUpdatedAt(userId);
  let q = supabase.from('notes')
    .select('user_id,day,note,updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: true })
    .limit(500);
  if (cursor) q = q.gt('updated_at', cursor);
  const { data, error } = await q;
  if (error) throw error;
  for (const row of data || []) await upsertRemoteNote(row);
}

async function pullProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return;
  const localMax = await getProfileMaxUpdatedAt(userId);
  const remoteAt = data.updated_at;
  // On n'écrase le profil local que si le serveur est strictement plus récent
  // ET qu'il n'y a pas de dirty local en attente de push.
  if (localMax && localMax >= remoteAt) return;
  if (await hasDirtyProfile(userId)) return;
  await replaceLocalProfile(userId, toCamelProfile(data), remoteAt);
}
