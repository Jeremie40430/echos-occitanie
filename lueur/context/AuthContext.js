// Contexte d'authentification : expose la session Supabase à toute l'app.
//
// Règles de routage :
//   • Personne connectée + hors /(auth) → renvoi vers /(auth)/welcome.
//   • Connectée + sur /(auth)/welcome    → renvoi vers /(tabs)/.
//   • Connectée + sur create / profile-setup / newsletter → on laisse
//     l'utilisatrice terminer son onboarding manuellement.

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user === undefined) return;
    const inAuth = segments[0] === '(auth)';
    const onWelcome = inAuth && segments[1] === 'welcome';
    if (user && onWelcome) {
      router.replace('/(tabs)/');
    } else if (!user && !inAuth) {
      router.replace('/(auth)/welcome');
    }
  }, [user, segments]);

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, signUp, signIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
