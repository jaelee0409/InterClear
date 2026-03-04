import React, { createContext, useContext, useEffect } from 'react';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/store/authStore';

type AuthContextValue = {
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

/**
 * Subscribes to Supabase auth state and syncs the token into authStore.
 * Mount once at the app root (inside _layout.tsx).
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuth, clearAuth, setHydrated } = useAuthStore();

  useEffect(() => {
    // Hydrate from any persisted session on app start
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setAuth(session.access_token, session.user.id, session.user.email ?? '');
      }
      // Always mark hydrated so index.tsx knows the check is done
      setHydrated();
    });

    // Keep the store in sync with token refreshes and sign-outs
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setAuth(session.access_token, session.user.id, session.user.email ?? '');
      } else {
        clearAuth();
      }
    });

    return () => subscription.unsubscribe();
  }, [setAuth, clearAuth, setHydrated]);

  async function signInWithEmail(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }

  async function signUp(email: string, password: string) {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message ?? null };
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ signInWithEmail, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
