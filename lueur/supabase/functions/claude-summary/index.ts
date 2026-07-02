// Edge Function : appel Anthropic côté serveur pour générer le résumé
// hebdomadaire de symptômes affiché sur l'écran "Tendances".
//
// Pourquoi côté serveur ? La clé API Anthropic ne doit JAMAIS vivre dans
// l'app (le .ipa est décompressable — n'importe qui pourrait l'extraire).
// Ici la clé reste dans les secrets Supabase, l'app n'appelle que cette
// fonction (via son JWT utilisateur).

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Anthropic from 'npm:@anthropic-ai/sdk@0.68.0';
import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const LEVEL_LABELS = ['Aucune', 'Légère', 'Modérée', 'Forte'];

// Miroir de lib/symptoms.js (côté app) : la fonction n'accepte que ces
// clés pour construire le prompt, ça bloque un client malicieux qui
// tenterait d'injecter des lignes arbitraires dans le contexte.
const SYMPTOM_LABELS: Record<string, string> = {
  hot_flashes: 'Bouffées de chaleur',
  sleep_trouble: 'Troubles du sommeil',
  fatigue: 'Fatigue',
  mood_swings: "Sautes d'humeur",
  anxiety: 'Anxiété',
  brain_fog: 'Brouillard mental',
  dryness: 'Sécheresse intime',
  low_libido: 'Baisse de libido',
};

type ClientDay = {
  day?: unknown;
  symptoms?: Record<string, unknown>;
};

// Retourne une ligne du type
//   "lundi 30 juin : Bouffées de chaleur (Forte), Sommeil (Modérée)"
// ou "lundi 30 juin : aucun symptôme notable"
function formatDay(entry: ClientDay): string | null {
  if (typeof entry.day !== 'string') return null;
  const parsed = new Date(entry.day);
  if (Number.isNaN(parsed.getTime())) return null;
  const label = parsed.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  const symptoms = entry.symptoms && typeof entry.symptoms === 'object' ? entry.symptoms : {};
  const active: string[] = [];
  for (const [key, rawLvl] of Object.entries(symptoms)) {
    const label = SYMPTOM_LABELS[key];
    if (!label) continue;
    const lvl = Number(rawLvl);
    if (!Number.isFinite(lvl) || lvl < 1 || lvl > 3) continue;
    active.push(`${label} (${LEVEL_LABELS[lvl]})`);
  }
  return active.length ? `${label} : ${active.join(', ')}` : `${label} : aucun symptôme notable`;
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  // 1. Vérifier l'utilisatrice via le JWT Supabase transmis par l'app.
  const authHeader = req.headers.get('Authorization') ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!token) return jsonResponse({ error: 'missing_auth' }, 401);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceKey) return jsonResponse({ error: 'server_misconfigured' }, 500);

  const supabase = createClient(supabaseUrl, serviceKey);
  const { data: userData, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !userData?.user) return jsonResponse({ error: 'invalid_auth' }, 401);

  // 2. Lire le payload envoyé par l'app.
  let payload: { days?: ClientDay[] };
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: 'invalid_json' }, 400);
  }
  const days = Array.isArray(payload.days) ? payload.days : [];
  if (days.length === 0) return jsonResponse({ error: 'no_data' }, 400);

  const lines = days
    .map(formatDay)
    .filter((l): l is string => typeof l === 'string');
  if (lines.length === 0) return jsonResponse({ error: 'no_valid_data' }, 400);

  // 3. Construire le prompt et appeler Anthropic.
  const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!anthropicKey) return jsonResponse({ error: 'ai_key_missing' }, 500);

  const anthropic = new Anthropic({ apiKey: anthropicKey });
  const prompt = `Voici les symptômes de ménopause notés par une femme sur les ${lines.length} derniers jours :\n\n${lines.join('\n')}\n\nRédige un résumé bienveillant de 3 à 4 phrases, en français, à la deuxième personne du pluriel (vouvoiement). Ce résumé doit :\n1. Identifier les symptômes les plus fréquents ou intenses\n2. Relever une tendance positive si elle existe\n3. Proposer 1 à 2 points concrets à mentionner au médecin\nTon : chaleureux, factuel, jamais alarmiste. Ne pas faire de diagnostic.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    });
    const summary = response.content
      .filter((b): b is { type: 'text'; text: string } => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();
    if (!summary) return jsonResponse({ error: 'empty_response' }, 502);
    return jsonResponse({ summary });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown_error';
    console.error('[claude-summary] anthropic error:', message);
    return jsonResponse({ error: 'ai_error', detail: message }, 502);
  }
});
