// Écran "Aujourd'hui" : le coeur de l'app.
// La femme note ses symptômes du jour en quelques touches. Chaque changement
// est enregistré immédiatement en local (SQLite) puis poussé vers Supabase
// par la couche sync en arrière-plan.

import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SymptomCard from '../../components/SymptomCard';
import { SYMPTOMS } from '../../lib/symptoms';
import { getDay, setIntensity, today } from '../../lib/db';
import { runSync } from '../../lib/sync';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing } from '../../lib/theme';

function prettyDate() {
  return new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export default function TodayScreen() {
  const { user } = useAuth();
  const userId = user?.id;
  const day = today();
  const [values, setValues] = useState({});

  useEffect(() => {
    if (!userId) return;
    getDay(userId, day).then(setValues);
  }, [userId, day]);

  const handleChange = async (symptomKey, intensity) => {
    if (!userId) return;
    setValues((prev) => ({ ...prev, [symptomKey]: intensity }));
    await setIntensity(userId, day, symptomKey, intensity);
    runSync(userId);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>{prettyDate()}</Text>
        <Text style={styles.title}>Comment te sens-tu aujourd'hui ?</Text>
        <Text style={styles.subtitle}>
          Note ce que tu ressens. Ton espace, protégé par ton compte.
        </Text>

        <View style={styles.list}>
          {SYMPTOMS.map((symptom) => (
            <SymptomCard
              key={symptom.key}
              symptom={symptom}
              value={values[symptom.key] || 0}
              onChange={(intensity) => handleChange(symptom.key, intensity)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xl * 2, gap: spacing.sm },
  eyebrow: { fontSize: 14, color: colors.plum, fontWeight: '600', textTransform: 'capitalize' },
  title: { fontSize: 26, fontWeight: '700', color: colors.ink, marginTop: spacing.xs, lineHeight: 32 },
  subtitle: { fontSize: 15, color: colors.inkSoft, marginTop: spacing.sm, marginBottom: spacing.md },
  list: { gap: spacing.md },
});
