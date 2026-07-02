import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import FlowerBg from '../../components/FlowerBg';
import { colors, spacing, radius } from '../../lib/theme';

// Logo Google dessiné à la main pour éviter une dépendance externe.
function GoogleLogo() {
  return (
    <View style={{ width: 18, height: 18 }}>
      <Text style={{ fontSize: 13, fontWeight: '700', color: '#4285F4' }}>G</Text>
    </View>
  );
}

export default function WelcomeScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      {/* Fleur en fond */}
      <View style={s.flowerWrap} pointerEvents="none">
        <FlowerBg width={380} height={320} />
      </View>

      <View style={s.content}>
        {/* Marque & tagline */}
        <View style={s.hero}>
          <Text style={s.brand}>L U E U R</Text>
          <Text style={s.title}>La ménopause{'\n'}vous appartient.</Text>
          <Text style={s.subtitle}>Un symptôme noté, c'est une peur de moins.</Text>
        </View>

        {/* Boutons de connexion */}
        <View style={s.actions}>
          <Pressable style={s.btnGoogle} onPress={() => router.push('/(auth)/profile-setup')}>
            <GoogleLogo />
            <Text style={s.btnGoogleText}>Continuer avec Google</Text>
          </Pressable>

          <Pressable style={s.btnEmail} onPress={() => router.push('/(auth)/create')}>
            <Ionicons name="mail-outline" size={18} color="#fff" />
            <Text style={s.btnEmailText}>Continuer avec l'e-mail</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flowerWrap: { position: 'absolute', top: 0, right: 0, left: 0, height: 320, overflow: 'hidden' },
  content: { flex: 1, paddingHorizontal: spacing.lg, justifyContent: 'space-between', paddingBottom: spacing.xl },
  hero: { flex: 1, justifyContent: 'center', paddingTop: spacing.xl * 2 },
  brand: { fontSize: 22, fontWeight: '800', letterSpacing: 5, color: colors.plum, marginBottom: spacing.md },
  title: { fontSize: 38, fontWeight: '800', color: colors.plumDeep, lineHeight: 44 },
  subtitle: { fontSize: 17, color: colors.inkSoft, marginTop: spacing.md, fontStyle: 'italic', lineHeight: 26 },
  actions: { gap: spacing.sm },
  btnGoogle: { borderWidth: 1.5, borderColor: colors.line, borderRadius: radius.md, padding: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: colors.surface },
  btnGoogleText: { fontSize: 15, fontWeight: '600', color: colors.ink },
  btnEmail: { borderRadius: radius.md, padding: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: colors.plum },
  btnEmailText: { fontSize: 15, fontWeight: '600', color: '#fff' },
});
