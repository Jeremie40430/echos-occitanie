import { useState, useCallback } from 'react';
import { View, Text, ScrollView, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SectionTitle, SettingsRow, Toggle } from '../../components/UI';
import { useAuth } from '../../context/AuthContext';
import { getProfile } from '../../lib/db';
import { colors, spacing, radius } from '../../lib/theme';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const userId = user?.id;
  const [reminder, setReminder] = useState(true);
  const [profile, setProfile] = useState({ firstName: '', lastName: '' });

  useFocusEffect(useCallback(() => {
    if (!userId) return;
    getProfile(userId).then(p => { if (p.firstName) setProfile(p); });
  }, [userId]));

  const handleLogout = () => {
    Alert.alert(
      'Se déconnecter',
      'Vos données locales sont conservées sur votre téléphone.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Se déconnecter', style: 'destructive', onPress: logout },
      ]
    );
  };

  const name = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'Votre profil';
  const email = user?.email || '';

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.title}>Paramètres</Text>

        {/* Carte profil */}
        <View style={s.profileCard}>
          <View style={s.avatar}>
            <Ionicons name="person" size={26} color={colors.plum} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.profileName}>{name}</Text>
            <Text style={s.profileEmail}>{email}</Text>
          </View>
        </View>

        {/* Rappels */}
        <SectionTitle>Rappels</SectionTitle>
        <View style={s.section}>
          <View style={[s.row, { borderBottomWidth: 1, borderBottomColor: colors.line }]}>
            <View style={s.rowIcon}>
              <Ionicons name="notifications-outline" size={18} color={colors.plum} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.rowLabel}>Rappel quotidien</Text>
              <Text style={s.rowSub}>Tous les soirs à 21h00</Text>
            </View>
            <Toggle checked={reminder} onChange={setReminder} label="" />
          </View>
          <SettingsRow iconName="time-outline" label="Heure du rappel" sub="21h00" onPress={() => {}} />
        </View>

        {/* Abonnement */}
        <SectionTitle>Mon abonnement</SectionTitle>
        <View style={s.section}>
          <View style={[s.row, { borderBottomWidth: 1, borderBottomColor: colors.line }]}>
            <View style={s.rowIcon}>
              <Ionicons name="card-outline" size={18} color={colors.plum} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.rowLabel}>Plan actuel</Text>
              <Text style={s.rowSub}>Gratuit — 7 jours d'historique</Text>
            </View>
            <View style={s.freeBadge}><Text style={s.freeBadgeText}>Gratuit</Text></View>
          </View>
          <SettingsRow iconName="sparkles" label="Passer à Premium" sub="Historique illimité + résumé IA médecin" onPress={() => {}} />
        </View>

        {/* Support */}
        <SectionTitle>Support</SectionTitle>
        <View style={s.section}>
          <SettingsRow iconName="star-outline" label="Noter l'application" sub="Ça nous aide vraiment 🙏" onPress={() => {}} />
          <SettingsRow iconName="chatbubble-outline" label="Nous contacter" sub="support@lueur.app" onPress={() => {}} />
        </View>

        {/* Légal */}
        <SectionTitle>Légal</SectionTitle>
        <View style={s.section}>
          <SettingsRow iconName="document-text-outline" label="Conditions d'utilisation" onPress={() => {}} />
          <SettingsRow iconName="shield-outline" label="Politique de confidentialité" onPress={() => {}} />
        </View>

        {/* Compte */}
        <SectionTitle>Compte</SectionTitle>
        <View style={s.section}>
          <SettingsRow iconName="log-out-outline" label="Se déconnecter" onPress={handleLogout} danger />
        </View>

        <Text style={s.version}>Lueur · Version 1.0.0</Text>
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg },
  title: { fontSize: 24, fontWeight: '700', color: colors.ink, marginBottom: spacing.lg },
  profileCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.line, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.plum + '22', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  profileName: { fontSize: 17, fontWeight: '700', color: colors.ink },
  profileEmail: { fontSize: 14, color: colors.inkSoft },
  section: { backgroundColor: colors.surface, borderRadius: radius.lg, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.line },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  rowIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.plum + '18', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  rowLabel: { fontSize: 15, fontWeight: '600', color: colors.ink },
  rowSub: { fontSize: 13, color: colors.inkSoft, marginTop: 1 },
  freeBadge: { backgroundColor: colors.plum + '18', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  freeBadgeText: { fontSize: 11, fontWeight: '700', color: colors.plum },
  version: { textAlign: 'center', marginTop: spacing.lg, fontSize: 13, color: colors.empty },
});
