const palette = {
  indigo50: '#EEF2FF',
  indigo100: '#E0E7FF',
  indigo200: '#C7D2FE',
  indigo500: '#6366F1',
  indigo600: '#4F46E5',
  indigo700: '#4338CA',

  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  green50: '#F0FDF4',
  green500: '#22C55E',
  green600: '#16A34A',

  orange50: '#FFF7ED',
  orange500: '#F97316',

  red50: '#FEF2F2',
  red500: '#EF4444',

  blue50: '#EFF6FF',
  blue500: '#3B82F6',
} as const;

export const Colors = {
  light: {
    primary: palette.indigo600,
    primaryLight: palette.indigo50,
    primaryMid: palette.indigo100,
    primaryDark: palette.indigo700,

    background: palette.white,
    surface: palette.gray50,
    surfaceElevated: palette.white,
    border: palette.gray200,
    borderStrong: palette.gray300,

    text: palette.gray900,
    textSecondary: palette.gray500,
    textTertiary: palette.gray400,
    textInverse: palette.white,
    textOnPrimary: palette.white,

    success: palette.green500,
    successBackground: palette.green50,
    warning: palette.orange500,
    warningBackground: palette.orange50,
    error: palette.red500,
    errorBackground: palette.red50,
    info: palette.blue500,
    infoBackground: palette.blue50,

    tabBar: palette.gray50,
    tabBarActive: palette.indigo600,
    tabBarInactive: palette.gray400,

    recordingActive: palette.red500,
    recordingBackground: palette.red50,
  },
  dark: {
    primary: palette.indigo500,
    primaryLight: '#1E1B4B',
    primaryMid: '#312E81',
    primaryDark: palette.indigo600,

    background: '#0A0A0A',
    surface: '#161616',
    surfaceElevated: '#1F1F1F',
    border: '#2A2A2A',
    borderStrong: '#383838',

    text: '#F0F0F0',
    textSecondary: palette.gray400,
    textTertiary: palette.gray500,
    textInverse: palette.gray900,
    textOnPrimary: palette.white,

    success: palette.green500,
    successBackground: '#052E16',
    warning: palette.orange500,
    warningBackground: '#431407',
    error: palette.red500,
    errorBackground: '#450A0A',
    info: palette.blue500,
    infoBackground: '#0C1A2E',

    tabBar: '#161616',
    tabBarActive: palette.indigo500,
    tabBarInactive: palette.gray500,

    recordingActive: palette.red500,
    recordingBackground: '#450A0A',
  },
} as const;

export type ColorScheme = keyof typeof Colors;
/** Accepts both light and dark palettes — use this for component props and hook returns. */
export type ThemeColors = typeof Colors[ColorScheme];
