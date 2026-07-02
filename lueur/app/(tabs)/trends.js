import { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { ALL_SYMPTOMS } from '../../lib/symptoms';
import { getRecentEntries } from '../../lib/db';
import { useAuth } from '../../context/AuthContext';
import { today, lastNDays, dayNum, fromKey } from '../../lib/dateUtils';
import { colors, spacing, radius, shade, LEVELS } from '../../lib/theme';

// Charge et structure les données des 7 derniers jours.
function useWeekData() {
  const { user } = useAuth();
  const userId = user?.id;
  const todayKey = today();
  const days = lastNDays(7, todayKey);
  const [data, setData] = useState({});

  useFocusEffect(useCallback(() => {
    if (!userId) return;
    getRecentEntries(userId, 7).then(rows => {
      const d = {};
      for (const row of rows) {
        if (!d[row.day]) d[row.day] = {};
        d[row.day][row.symptom_key] = row.intensity;
      }
      setData(d);
    });
  }, [userId]));

  return { days, data, todayKey };
}

// ── Bloc 1 : graphique en barres des journées ────────────────────────────
function DayChart({ days, data, todayKey }) {
  const scores = days.map(d => ALL_SYMPTOMS.reduce((s, sym) => s + ((data[d]?.[sym.key]) || 0), 0));
  const max = Math.max(1, ...scores);
  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>Vos journées</Text>
      <Text style={s.cardSub}>Plus la barre est haute, plus la journée a été chargée.</Text>
      <View style={s.bars}>
        {days.map((d, i) => {
          const ratio = scores[i] / max;
          const lvl = ratio <= 0 ? 0 : ratio < 0.34 ? 1 : ratio < 0.67 ? 2 : 3;
          return (
            <View key={d} style={s.barWrap}>
              <View style={s.barTrack}>
                <View style={[s.barFill, { height: `${Math.max(4, ratio * 100)}%`, backgroundColor: shade(colors.plum, lvl), borderWidth: d === todayKey ? 1.5 : 0, borderColor: colors.plum }]} />
              </View>
              <Text style={[s.barLabel, d === todayKey && s.barLabelToday]}>{dayNum(d)}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ── Bloc 2 : classement % ────────────────────────────────────────────────
function Ranking({ days, data }) {
  const avgs = ALL_SYMPTOMS.map(sym => {
    const total = days.reduce((s, d) => s + ((data[d]?.[sym.key]) || 0), 0);
    return { sym, avg: total / days.length };
  }).sort((a, b) => b.avg - a.avg);

  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>Ce qui vous gêne le plus</Text>
      <Text style={s.cardSub}>Classement de la semaine, du plus marqué au moins marqué.</Text>
      {avgs.map(({ sym, avg }) => {
        const pct = Math.round((avg / 3) * 100);
        return (
          <View key={sym.key} style={s.rankRow}>
            <View style={[s.rankIcon, { backgroundColor: sym.color + '22' }]}>
              <Ionicons name={sym.icon} size={16} color={sym.color} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={s.rankHead}>
                <Text style={s.rankLabel}>{sym.label}</Text>
                <Text style={[s.rankPct, { color: pct > 60 ? sym.color : colors.inkSoft }]}>{pct}%</Text>
              </View>
              <View style={s.barBg}>
                <View style={[s.barProgress, { width: `${pct}%`, backgroundColor: sym.color }]} />
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ── Bloc 3 : résumé IA (premium) ─────────────────────────────────────────
function AiSummary({ days, data }) {
  const [unlocked, setUnlocked] = useState(false);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    const lines = days.map(d => {
      const e = data[d] || {};
      const parts = ALL_SYMPTOMS.filter(s => e[s.key] > 0).map(s => `${s.label} (${LEVELS[e[s.key]]})`).join(', ');
      const sd = fromKey(d).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
      return parts ? `${sd} : ${parts}` : `${sd} : aucun symptôme notable`;
    });
    const prompt = `Voici les symptômes de ménopause notés par une femme sur les 7 derniers jours :\n\n${lines.join('\n')}\n\nRédige un résumé bienveillant de 3 à 4 phrases, en français, à la deuxième personne du pluriel (vouvoiement). Ce résumé doit :\n1. Identifier les symptômes les plus fréquents ou intenses\n2. Relever une tendance positive si elle existe\n3. Proposer 1-2 points concrets à mentionner au médecin\nTon : chaleureux, factuel, jamais alarmiste. Ne pas faire de diagnostic.`;
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 400, messages: [{ role: 'user', content: prompt }] }),
      });
      const json = await res.json();
      setSummary(json.content?.[0]?.text || 'Impossible de générer le résumé.');
    } catch { setSummary('Une erreur est survenue. Réessayez dans un instant.'); }
    setLoading(false);
  };

  if (!unlocked) return (
    <View style={[s.card, s.premiumCard]}>
      <View style={s.premiumHeader}>
        <Ionicons name="sparkles" size={18} color={colors.plum} />
        <Text style={s.cardTitle}>Résumé IA — Premium</Text>
      </View>
      <Text style={s.cardSub}>Un résumé personnalisé de votre semaine, à montrer à votre médecin.</Text>
      <Pressable style={s.unlockBtn} onPress={() => setUnlocked(true)}>
        <Ionicons name="lock-closed-outline" size={14} color="#fff" />
        <Text style={s.unlockBtnText}>Essayer Premium</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={[s.card, { borderColor: colors.plum, borderWidth: 1.5 }]}>
      <View style={s.premiumHeader}>
        <Ionicons name="sparkles" size={18} color={colors.plum} />
        <Text style={s.cardTitle}>Résumé de votre semaine</Text>
      </View>
      {!summary && !loading && (
        <>
          <Text style={s.cardSub}>Claude analyse vos 7 jours et rédige un résumé à montrer à votre médecin.</Text>
          <Pressable style={s.unlockBtn} onPress={generate}>
            <Ionicons name="sparkles" size={14} color="#fff" />
            <Text style={s.unlockBtnText}>Générer le résumé</Text>
          </Pressable>
        </>
      )}
      {loading && (
        <View style={s.loadingRow}>
          <ActivityIndicator color={colors.plum} size="small" />
          <Text style={s.cardSub}>Claude analyse vos symptômes…</Text>
        </View>
      )}
      {summary && (
        <>
          <Text style={s.summaryText}>{summary}</Text>
          <Pressable onPress={generate}><Text style={s.regenBtn}>↺ Regénérer</Text></Pressable>
        </>
      )}
    </View>
  );
}

export default function TrendsScreen() {
  const { days, data, todayKey } = useWeekData();
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.title}>Vos tendances</Text>
        <Text style={s.sub}>Vos 7 derniers jours, en un coup d'œil.</Text>
        <DayChart days={days} data={data} todayKey={todayKey} />
        <Ranking days={days} data={data} />
        <AiSummary days={days} data={data} />
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.lg },
  title: { fontSize: 24, fontWeight: '700', color: colors.ink },
  sub: { fontSize: 15, color: colors.inkSoft, lineHeight: 22 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.line },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.ink, marginBottom: 4 },
  cardSub: { fontSize: 13, color: colors.inkSoft, marginBottom: spacing.md, lineHeight: 19 },
  // Barres journées
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 140 },
  barWrap: { flex: 1, alignItems: 'center', gap: 6 },
  barTrack: { flex: 1, width: '100%', justifyContent: 'flex-end' },
  barFill: { width: '100%', borderRadius: 8 },
  barLabel: { fontSize: 11, color: colors.inkSoft, fontWeight: '500' },
  barLabelToday: { color: colors.plum, fontWeight: '700' },
  // Classement
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: spacing.md },
  rankIcon: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  rankHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 },
  rankLabel: { fontSize: 14, fontWeight: '600', color: colors.ink },
  rankPct: { fontSize: 13, fontWeight: '700' },
  barBg: { height: 8, borderRadius: 4, backgroundColor: colors.empty, overflow: 'hidden' },
  barProgress: { height: '100%', borderRadius: 4 },
  // IA premium
  premiumCard: { borderColor: colors.line },
  premiumHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  unlockBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.plum, borderRadius: 12, padding: 13, marginTop: 4 },
  unlockBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  summaryText: { fontSize: 14, color: colors.ink, lineHeight: 24 },
  regenBtn: { marginTop: spacing.md, fontSize: 13, fontWeight: '600', color: colors.plum },
});
