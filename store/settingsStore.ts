/**
 * App-wide settings — persisted to AsyncStorage on change.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AppLanguage = 'ko' | 'en';
type AppTheme = 'system' | 'light' | 'dark';

type SettingsState = {
  language: AppLanguage;
  theme: AppTheme;
  hapticsEnabled: boolean;
  autoTranscribe: boolean;
  showHints: boolean;
  displayName: string;
  onboardingComplete: boolean;
};

type SettingsActions = {
  setLanguage: (language: AppLanguage) => void;
  setTheme: (theme: AppTheme) => void;
  setHapticsEnabled: (enabled: boolean) => void;
  setAutoTranscribe: (enabled: boolean) => void;
  setShowHints: (show: boolean) => void;
  setDisplayName: (name: string) => void;
  setOnboardingComplete: (v: boolean) => void;
};

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set) => ({
      // ─── Defaults ────────────────────────────────────────────────────────
      language: 'ko',
      theme: 'system',
      hapticsEnabled: true,
      autoTranscribe: false, // off until API is connected
      showHints: true,
      displayName: '',
      onboardingComplete: false,

      // ─── Actions ─────────────────────────────────────────────────────────
      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme }),
      setHapticsEnabled: (hapticsEnabled) => set({ hapticsEnabled }),
      setAutoTranscribe: (autoTranscribe) => set({ autoTranscribe }),
      setShowHints: (showHints) => set({ showHints }),
      setDisplayName: (displayName) => set({ displayName }),
      setOnboardingComplete: (onboardingComplete) => set({ onboardingComplete }),
    }),
    {
      name: '@interviewlab:settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
