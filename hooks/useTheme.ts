import { useColorScheme } from 'react-native';
import { Colors, type ThemeColors } from '@/theme';
import { useSettingsStore } from '@/store/settingsStore';

type UseThemeReturn = {
  colors: ThemeColors;
  isDark: boolean;
  scheme: 'light' | 'dark';
};

/**
 * Returns the correct color palette based on system color scheme
 * and the user's theme override setting.
 */
export function useTheme(): UseThemeReturn {
  const systemScheme = useColorScheme();
  const themeSetting = useSettingsStore((s) => s.theme);

  const scheme: 'light' | 'dark' =
    themeSetting === 'system'
      ? (systemScheme ?? 'light')
      : themeSetting;

  return {
    colors: Colors[scheme],
    isDark: scheme === 'dark',
    scheme,
  };
}
