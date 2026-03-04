import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';

/**
 * Entry point — waits for both auth and settings to hydrate from AsyncStorage,
 * then redirects to onboarding (first launch), login, or home.
 */
export default function Index() {
  const { token, hydrated: authHydrated } = useAuthStore();
  const onboardingComplete = useSettingsStore((s) => s.onboardingComplete);

  // Track settings store hydration separately — it's async like auth
  const [settingsHydrated, setSettingsHydrated] = useState(
    () => useSettingsStore.persist.hasHydrated(),
  );

  useEffect(() => {
    if (settingsHydrated) return;
    return useSettingsStore.persist.onFinishHydration(() => setSettingsHydrated(true));
  }, [settingsHydrated]);

  if (!authHydrated || !settingsHydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!token) return <Redirect href="/(auth)/login" />;
  if (!onboardingComplete) return <Redirect href={'/onboarding' as any} />;
  return <Redirect href="/(tabs)/home" />;
}
