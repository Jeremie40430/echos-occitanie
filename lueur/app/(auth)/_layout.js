// Stack des écrans d'onboarding (welcome, create, profile-setup, newsletter).
// Pas de header : chaque écran gère son propre haut de page.

import { Stack } from 'expo-router';

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
