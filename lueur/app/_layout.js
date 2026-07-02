import { useEffect, useState } from 'react';
import { View, ActivityIndicator, AppState } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { initDb } from '../lib/db';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { runSync } from '../lib/sync';
import { colors } from '../lib/theme';

// Composant interne : a accès à `useAuth()` (qui doit être *dans* AuthProvider)
// et déclenche la sync au changement d'utilisatrice + au retour au foreground.
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

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initDb().then(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.plum} />
      </View>
    );
  }

  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
