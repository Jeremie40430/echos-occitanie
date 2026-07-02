// Écran "Tendances" — à construire ensuite.
// L'idée : des graphiques simples sur 1, 3 et 6 mois, plus un résumé propre
// que la femme pourra montrer à son médecin (ce sera un argument fort du premium).

import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../lib/theme';

export default function TrendsScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.center}>
        <Ionicons name="trending-up-outline" size={40} color={colors.plum} />
        <Text style={styles.title}>Tes tendances</Text>
        <Text style={styles.text}>
          Bientôt : l'évolution de tes symptômes et un résumé à partager
          avec ton médecin.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  title: { fontSize: 20, fontWeight: '700', color: colors.ink, marginTop: spacing.sm },
  text: { fontSize: 15, color: colors.inkSoft, textAlign: 'center', lineHeight: 22 },
});
