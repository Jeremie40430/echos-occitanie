import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Toggle, Btn } from '../../components/UI';
import { saveProfile, getProfile } from '../../lib/db';
import { runSync } from '../../lib/sync';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing } from '../../lib/theme';

function StepBar() {
  return (
    <View style={s.stepBar}>
      {[1, 2, 3].map(i => (
        <View key={i} style={[s.step, s.stepActive]} />
      ))}
    </View>
  );
}

export default function NewsletterScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [nl, setNl] = useState(true);
  const [cgu, setCgu] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDone = async () => {
    if (!cgu || loading || !user?.id) return;
    setLoading(true);
    try {
      // Fusionne le choix newsletter avec le profil déjà saisi.
      const current = await getProfile(user.id);
      await saveProfile(user.id, {
        firstName: current?.first_name || '',
        lastName: current?.last_name || '',
        dob: current?.dob || '',
        phone: current?.phone || '',
        zip: current?.zip || '',
        city: current?.city || '',
        newsletter: nl,
      });
      runSync(user.id);
    } catch (e) {
      // Non bloquant : on continue vers l'app.
    } finally {
      setLoading(false);
    }
    router.replace('/(tabs)/');
  };

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StepBar />
      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.title}>Presque prête !</Text>
        <Text style={s.sub}>Deux dernières choses avant de commencer.</Text>

        <View style={s.toggles}>
          <Toggle
            checked={nl}
            onChange={setNl}
            label="Recevoir la newsletter"
            sublabel="Conseils ménopause, témoignages et nouveautés. Désinscription en 1 clic."
          />
          <View style={s.divider} />
          <Toggle
            checked={cgu}
            onChange={setCgu}
            label="J'accepte les conditions d'utilisation"
            sublabel="Vos données sont associées à votre compte, protégées et jamais revendues."
          />
        </View>

        <View style={s.btnWrap}>
          <Btn
            label={loading ? 'Chargement…' : 'Commencer mon suivi'}
            onPress={handleDone}
            disabled={!cgu || loading}
            iconName="checkmark-circle-outline"
          />
          {!cgu && (
            <Text style={s.hint}>Veuillez accepter les conditions pour continuer.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  stepBar: { flexDirection: 'row', gap: 6, padding: 16, paddingBottom: 0 },
  step: { flex: 1, height: 3, borderRadius: 3, backgroundColor: colors.empty },
  stepActive: { backgroundColor: colors.plum },
  content: { padding: 24, paddingTop: 8 },
  title: { fontSize: 26, fontWeight: '700', color: colors.ink, marginBottom: 6 },
  sub: { fontSize: 15, color: colors.inkSoft, marginBottom: 32 },
  toggles: { gap: 24 },
  divider: { height: 1, backgroundColor: colors.line },
  btnWrap: { marginTop: 36 },
  hint: { fontSize: 13, color: colors.inkSoft, textAlign: 'center', marginTop: 12 },
});
