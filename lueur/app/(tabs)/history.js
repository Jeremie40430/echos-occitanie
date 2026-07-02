// Écran "Historique" — à construire ensuite.
// L'idée : un calendrier en damier où chaque jour montre les couleurs des
// symptômes notés (à la manière des cases colorées de HabitKit).
// C'est l'élément visuel signature de l'app.

import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../lib/theme';

export default function HistoryScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.center}>
        <Ionicons name="calendar-outline" size={40} color={colors.plum} />
        <Text style={styles.title}>Ton historique</Text>
        <Text style={styles.text}>
          Bientôt : un calendrier coloré de tes symptômes, jour après jour.
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
