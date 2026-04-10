/**
 * Typography system for Agar mobile app.
 *
 * Uses Urbanist across the board for a compact, sleek look.
 *
 * Fonts must be loaded via expo-font before use.
 */

export const fontFamily = {
  body: 'Urbanist_400Regular',
  bodyMedium: 'Urbanist_500Medium',
  bodySemibold: 'Urbanist_600SemiBold',
  bodyBold: 'Urbanist_700Bold',
  display: 'Urbanist_600SemiBold',
  displayBold: 'Urbanist_700Bold',
  displayExtrabold: 'Urbanist_800ExtraBold',
  accent: 'Urbanist_500Medium',
  accentBold: 'Urbanist_700Bold',
} as const;

export const textStyles = {
  // Hero / splash headings
  heroTitle: {
    fontFamily: fontFamily.displayExtrabold,
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: -1.2,
  },
  // Section headings
  h1: {
    fontFamily: fontFamily.displayBold,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.8,
  },
  h2: {
    fontFamily: fontFamily.display,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.5,
  },
  h3: {
    fontFamily: fontFamily.display,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.3,
  },
  // Body text
  bodyLarge: {
    fontFamily: fontFamily.body,
    fontSize: 18,
    lineHeight: 26,
    letterSpacing: -0.2,
  },
  body: {
    fontFamily: fontFamily.body,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: -0.1,
  },
  bodySmall: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
  },
  // Captions, labels
  caption: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.2,
  },
  label: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  // Stat numbers (compatibility scores, etc.)
  stat: {
    fontFamily: fontFamily.accentBold,
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -1,
  },
  statSmall: {
    fontFamily: fontFamily.accent,
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: -0.5,
  },
  // Buttons
  button: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  buttonSmall: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0.2,
  },
} as const;

export type TextStyle = keyof typeof textStyles;
