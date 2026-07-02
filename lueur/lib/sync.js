// Couche de synchronisation Supabase.
//
// Modèle : SQLite local est la source de vérité pour l'UI (instantané,
// marche hors-ligne). Cette couche pousse les écritures "dirty" vers
// Supabase et tire les changements plus récents des autres appareils.
// Simple last-write-wins sur `updated_at`.

import { supabase } from './supabaseClient';
import {
  getDirtyEntries,
  markEntrySynced,
  upsertRemoteEntry,
  getMaxEntryUpdatedAt,
  getDirtyProfile,
  markProfileSynced,
} from './db';

let running = false;

// Un seul run à la fois. Si un run est demandé pendant qu'un autre tourne,
// il est ignoré — la sync suivante se fera au prochain déclencheur.
export async function runSync(userId) {
  if (!userId || running) return;
  running = true;
  try {
    await pushDirtyEntries(userId);
    await pushDirtyProfile(userId);
    await pullEntries(userId);
  } catch (e) {
    // Silencieux : la sync est best-effort. Les logs des vraies erreurs
    // remontent via le client Supabase en dev.
    console.warn('[sync] échec', e?.message || e);
  } finally {
    running = false;
  }
}

async function pushDirtyEntries(userId) {
  const dirty = await getDirtyEntries(userId);
  if (dirty.length === 0) return;
  const payload = dirty.map((e) => ({
    id: e.id,
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
  for (const e of dirty) await markEntrySynced(e.id, e.updated_at);
}

async function pushDirtyProfile(userId) {
  const dirty = await getDirtyProfile(userId);
  if (!dirty) return;
  const { error } = await supabase.from('profiles').upsert({
    id: userId,
    first_name: dirty.first_name,
    last_name: dirty.last_name,
    dob: dirty.dob,
    phone: dirty.phone,
    zip: dirty.zip,
    city: dirty.city,
    newsletter: dirty.newsletter === 1,
    updated_at: dirty.updated_at,
  });
  if (error) throw error;
  await markProfileSynced(userId, dirty.updated_at);
}

async function pullEntries(userId) {
  const cursor = await getMaxEntryUpdatedAt(userId);
  let query = supabase
    .from('entries')
    .select('id,user_id,day,symptom_key,intensity,updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: true })
    .limit(500);
  if (cursor) query = query.gt('updated_at', cursor);
  const { data, error } = await query;
  if (error) throw error;
  if (!data) return;
  for (const row of data) await upsertRemoteEntry(row);
}
