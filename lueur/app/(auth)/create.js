import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Field, Btn } from '../../components/UI';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing } from '../../lib/theme';

function StepBar() {
  return (
    <View style={s.stepBar}>
      {[1, 2, 3].map(i => (
        <View key={i} style={[s.step, i <= 1 && s.stepActive]} />
      ))}
    </View>
  );
}

export default function CreateScreen() {
  const router = useRouter();
  const { signUp, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('signup');

  const valid = email.includes('@') && pwd.length >= 6;

  const handleSubmit = async () => {
    if (!valid || loading) return;
    setLoading(true);
    try {
      if (mode === 'signup') {
        await signUp(email, pwd);
        router.push('/(auth)/profile-setup');
      } else {
        await signIn(email, pwd);
        // AuthContext ne fait la redirection auto que depuis welcome — ici on
        // pousse à la main pour éviter que l'utilisatrice reste bloquée sur
        // l'écran de connexion.
        router.replace('/(tabs)/');
      }
    } catch (error) {
      const msg = error.message || '';
      let friendly = 'Une erreur est survenue. Réessayez.';
      if (msg.includes('Invalid login credentials')) {
        friendly = 'Email ou mot de passe incorrect.';
      } else if (msg.includes('already registered') || msg.includes('already been registered')) {
        friendly = 'Cet email est déjà utilisé. Connectez-vous plutôt.';
        setMode('signin');
      } else if (msg.includes('Password')) {
        friendly = 'Le mot de passe doit contenir au moins 6 caractères.';
      } else if (msg.includes('valid email')) {
        friendly = 'Adresse email invalide.';
      }
      Alert.alert('Erreur', friendly);
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

        <Text style={s.title}>
          {mode === 'signup' ? 'Créer votre compte' : 'Se connecter'}
        </Text>
        <Text style={s.sub}>
          {mode === 'signup' ? 'Votre espace vous attend.' : 'Bienvenue de retour.'}
        </Text>

        <View style={s.form}>
          <Field
            label="Adresse e-mail"
            value={email}
            onChangeText={setEmail}
            iconName="mail-outline"
            placeholder="vous@exemple.fr"
            keyboardType="email-address"
          />
          <Field
            label="Mot de passe"
            value={pwd}
            onChangeText={setPwd}
            placeholder="6 caractères minimum"
            secureTextEntry
          />
        </View>

        <View style={s.btnWrap}>
          <Btn
            label={loading ? 'Chargement…' : (mode === 'signup' ? 'Créer mon compte' : 'Se connecter')}
            onPress={handleSubmit}
            disabled={!valid || loading}
          />
        </View>

        <Pressable
          onPress={() => setMode(m => m === 'signup' ? 'signin' : 'signup')}
          style={s.switchLink}
        >
          <Text style={s.switchText}>
            {mode === 'signup' ? 'Déjà un compte ? ' : 'Pas encore de compte ? '}
            <Text style={s.switchAction}>
              {mode === 'signup' ? 'Se connecter' : 'Créer un compte'}
            </Text>
          </Text>
        </Pressable>
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
  btnWrap: { marginTop: 24 },
  switchLink: { marginTop: 16, alignItems: 'center' },
  switchText: { fontSize: 13, color: colors.inkSoft },
  switchAction: { color: colors.plum, fontWeight: '600' },
});
