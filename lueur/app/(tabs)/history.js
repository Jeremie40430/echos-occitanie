import { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { ALL_SYMPTOMS } from '../../lib/symptoms';
import { getRecentEntries } from '../../lib/db';
import { useAuth } from '../../context/AuthContext';
import { today, lastNDays, dayNum, dayInitial } from '../../lib/dateUtils';
import { colors, spacing, radius, shade } from '../../lib/theme';

export default function HistoryScreen() {
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

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.title}>Votre historique</Text>
        <Text style={s.sub}>Vos 7 derniers jours. Plus la teinte est foncée, plus le symptôme était fort.</Text>

        {/* Calendrier coloré */}
        <View style={s.grid}>
          {/* En-tête jours */}
          <View style={s.headerRow}>
            <View style={s.iconPlaceholder} />
            {days.map(d => (
              <View key={d} style={s.dayHead}>
                <Text style={s.dayInitial}>{dayInitial(d)}</Text>
                <Text style={[s.dayNum, d === todayKey && s.dayNumToday]}>{dayNum(d)}</Text>
              </View>
            ))}
          </View>
          {/* Lignes de symptômes */}
          {ALL_SYMPTOMS.map(sym => (
            <View key={sym.key} style={s.symptomRow}>
              <View style={[s.symIcon, { backgroundColor: sym.color + '22' }]}>
                <Text style={{ fontSize: 12 }}>·</Text>
              </View>
              {days.map(d => {
                const lvl = (data[d] && data[d][sym.key]) || 0;
                return (
                  <View key={d} style={[s.cell, { backgroundColor: shade(sym.color, lvl), borderColor: colors.line }]} />
                );
              })}
            </View>
          ))}
          {/* Légende */}
          <View style={s.legend}>
            <Text style={s.legendText}>Moins</Text>
            {[0,1,2,3].map(l => (
              <View key={l} style={[s.legendDot, { backgroundColor: shade(colors.plum, l) }]} />
            ))}
            <Text style={s.legendText}>Plus</Text>
          </View>
        </View>

        {/* Invitation Premium */}
        <View style={s.premiumCard}>
          <Text style={s.premiumTitle}>Aller plus loin</Text>
          <Text style={s.premiumText}>Vos 7 derniers jours sont gratuits, pour toujours. Premium ajoute l'historique complet, les tendances sur 3 et 6 mois, et un résumé IA à montrer à votre médecin.</Text>
          <Pressable style={s.premiumBtn}>
            <Text style={s.premiumBtnText}>Découvrir Premium</Text>
          </Pressable>
        </View>
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const CELL = 34;
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg },
  title: { fontSize: 24, fontWeight: '700', color: colors.ink, marginBottom: 6 },
  sub: { fontSize: 15, color: colors.inkSoft, marginBottom: spacing.lg, lineHeight: 22 },
  grid: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.line },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: 6 },
  iconPlaceholder: { width: CELL },
  dayHead: { flex: 1, alignItems: 'center' },
  dayInitial: { fontSize: 10, color: colors.inkSoft },
  dayNum: { fontSize: 12, fontWeight: '600', color: colors.ink },
  dayNumToday: { color: colors.plum },
  symptomRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  symIcon: { width: CELL, height: CELL, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  cell: { flex: 1, aspectRatio: 1, borderRadius: 7, borderWidth: 1 },
  legend: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 5, marginTop: spacing.sm },
  legendDot: { width: 14, height: 14, borderRadius: 4 },
  legendText: { fontSize: 11, color: colors.inkSoft },
  // Premium
  premiumCard: { marginTop: spacing.lg, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.line },
  premiumTitle: { fontSize: 16, fontWeight: '700', color: colors.ink, marginBottom: spacing.sm },
  premiumText: { fontSize: 14, color: colors.inkSoft, lineHeight: 21 },
  premiumBtn: { marginTop: spacing.md, backgroundColor: colors.plum, borderRadius: radius.sm, padding: 14, alignItems: 'center' },
  premiumBtnText: { fontSize: 15, fontWeight: '600', color: '#fff' },
});
