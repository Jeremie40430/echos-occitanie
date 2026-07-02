// Premier écran quand personne n'est connecté.
// Une image de marque, la promesse en une phrase, deux boutons : créer ou se connecter.

import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Btn } from '../../components/UI';
import { colors, spacing } from '../../lib/theme';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <View style={s.top}>
        <View style={s.badge}>
          <Ionicons name="sparkles-outline" size={36} color={colors.plum} />
        </View>
        <Text style={s.brand}>Lueur</Text>
        <Text style={s.tagline}>Ta ménopause, mieux comprise.</Text>
        <Text style={s.pitch}>
          Un carnet doux pour noter ce que tu ressens, jour après jour, et voir
          ce qui revient. Ton espace, protégé par ton compte.
        </Text>
      </View>

      <View style={s.actions}>
        <Btn
          label="Créer mon compte"
          onPress={() => router.push('/(auth)/create')}
        />
        <Pressable
          onPress={() => router.push('/(auth)/create?mode=signin')}
          style={s.link}
        >
          <Text style={s.linkText}>
            J'ai déjà un compte <Text style={s.linkStrong}>Se connecter</Text>
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
  },
  top: { alignItems: 'center', marginTop: spacing.xl * 2, gap: spacing.md },
  badge: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: { fontSize: 34, fontWeight: '700', color: colors.plumDeep, letterSpacing: 0.5 },
  tagline: { fontSize: 17, color: colors.ink, textAlign: 'center' },
  pitch: {
    fontSize: 15,
    color: colors.inkSoft,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  actions: { gap: spacing.md, marginBottom: spacing.xl },
  link: { alignItems: 'center', paddingVertical: spacing.sm },
  linkText: { fontSize: 14, color: colors.inkSoft },
  linkStrong: { color: colors.plum, fontWeight: '600' },
});
