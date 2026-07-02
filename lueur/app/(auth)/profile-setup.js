import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Field, Btn } from '../../components/UI';
import { saveProfile } from '../../lib/db';
import { runSync } from '../../lib/sync';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing } from '../../lib/theme';

function StepBar() {
  return (
    <View style={s.stepBar}>
      {[1, 2, 3].map(i => (
        <View key={i} style={[s.step, i <= 2 && s.stepActive]} />
      ))}
    </View>
  );
}

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [form, setForm] = useState({
    firstName: '', lastName: '', dob: '', phone: '', zip: '', city: '',
  });
  const [loading, setLoading] = useState(false);
  const set = k => v => setForm(p => ({ ...p, [k]: v }));
  const valid = form.firstName.trim().length > 0 && form.lastName.trim().length > 0;

  const handleNext = async () => {
    if (!valid || loading || !user?.id) return;
    setLoading(true);
    try {
      await saveProfile(user.id, form);
      runSync(user.id);
      router.push('/(auth)/newsletter');
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de sauvegarder. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StepBar />
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => router.back()} style={s.back}>
          <Ionicons name="arrow-back" size={16} color={colors.plum} />
          <Text style={s.backText}>Retour</Text>
        </Pressable>
        <Text style={s.title}>Votre profil</Text>
        <Text style={s.sub}>Pour personnaliser votre expérience.</Text>
        <View style={s.form}>
          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <Field label="Prénom *" value={form.firstName} onChangeText={set('firstName')}
                iconName="person-outline" placeholder="Sophie" />
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Nom *" value={form.lastName} onChangeText={set('lastName')}
                placeholder="Dupont" />
            </View>
          </View>
          <Field label="Date de naissance" value={form.dob} onChangeText={set('dob')}
            iconName="calendar-outline" placeholder="JJ/MM/AAAA"
            keyboardType="numbers-and-punctuation" />
          <Field label="Téléphone" value={form.phone} onChangeText={set('phone')}
            iconName="call-outline" placeholder="+33 6 00 00 00 00" keyboardType="phone-pad" />
          <View style={s.row}>
            <View style={{ width: 110 }}>
              <Field label="Code postal" value={form.zip} onChangeText={set('zip')}
                iconName="location-outline" placeholder="75001" keyboardType="number-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Ville" value={form.city} onChangeText={set('city')}
                placeholder="Paris" />
            </View>
          </View>
        </View>
        <Text style={s.required}>* Champs obligatoires</Text>
        <Btn
          label={loading ? 'Enregistrement…' : 'Continuer'}
          onPress={handleNext}
          disabled={!valid || loading}
        />
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
  back: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 16 },
  backText: { fontSize: 14, fontWeight: '600', color: colors.plum },
  title: { fontSize: 26, fontWeight: '700', color: colors.ink, marginBottom: 6 },
  sub: { fontSize: 15, color: colors.inkSoft, marginBottom: 24 },
  form: { gap: 16 },
  row: { flexDirection: 'row', gap: 12 },
  required: { fontSize: 13, color: colors.inkSoft, marginTop: 8, marginBottom: 24 },
});
