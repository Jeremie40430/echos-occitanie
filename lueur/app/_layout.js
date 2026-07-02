// Layout racine.
// 1) Initialise la base locale au lancement.
// 2) Enveloppe toute l'app dans AuthProvider (session Supabase + redirections).
// 3) Déclenche une sync quand l'app revient au premier plan.

import { useEffect, useState } from 'react';
import { Slot } from 'expo-router';
import { View, ActivityIndicator, AppState } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { initDb } from '../lib/db';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { runSync } from '../lib/sync';
import { colors } from '../lib/theme';

function AppShell() {
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) runSync(user.id);
  }, [user?.id]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && user?.id) runSync(user.id);
    });
    return () => sub.remove();
  }, [user?.id]);

  return <Slot />;
}

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initDb().then(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator color={colors.plum} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </>
  );
}
