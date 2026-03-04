import { create } from 'zustand';

type AuthState = {
  token: string | null;
  userId: string | null;
  email: string | null;
  /** True once the initial getSession() check has completed (even if no session exists) */
  hydrated: boolean;
  /** Called by AuthProvider when a Supabase session arrives or refreshes */
  setAuth: (token: string, userId: string, email: string) => void;
  /** Called by AuthProvider on sign-out or session expiry */
  clearAuth: () => void;
  /** Called by AuthProvider after the initial getSession() resolves */
  setHydrated: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  userId: null,
  email: null,
  hydrated: false,
  setAuth: (token, userId, email) => set({ token, userId, email }),
  clearAuth: () => set({ token: null, userId: null, email: null }),
  setHydrated: () => set({ hydrated: true }),
}));
