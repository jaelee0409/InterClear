/**
 * Typography scale.
 * Korean characters render correctly with system fonts on both iOS/Android:
 *  - iOS: Apple SD Gothic Neo (built-in)
 *  - Android: Noto Sans KR (built-in via system)
 * No custom font loading required for Korean support.
 */
export const Typography = {
  displayLarge: {
    fontSize: 34,
    lineHeight: 42,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  displayMedium: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },

  h1: { fontSize: 24, lineHeight: 32, fontWeight: '700' as const },
  h2: { fontSize: 20, lineHeight: 28, fontWeight: '600' as const },
  h3: { fontSize: 18, lineHeight: 26, fontWeight: '600' as const },
  h4: { fontSize: 16, lineHeight: 24, fontWeight: '600' as const },

  bodyLarge: { fontSize: 16, lineHeight: 26, fontWeight: '400' as const },
  bodyMedium: { fontSize: 14, lineHeight: 22, fontWeight: '400' as const },
  bodySmall: { fontSize: 12, lineHeight: 18, fontWeight: '400' as const },

  labelLarge: { fontSize: 15, lineHeight: 20, fontWeight: '600' as const },
  labelMedium: { fontSize: 13, lineHeight: 18, fontWeight: '600' as const },
  labelSmall: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500' as const,
    letterSpacing: 0.4,
  },

  caption: { fontSize: 11, lineHeight: 16, fontWeight: '400' as const },
  overline: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '600' as const,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
  },
} as const;

export type TypographyVariant = keyof typeof Typography;
