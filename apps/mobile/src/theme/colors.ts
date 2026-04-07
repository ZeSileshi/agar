export const colors = {
  primary: {
    50: '#f0edff',
    100: '#ddd6fe',
    200: '#c4b5fd',
    300: '#a78bfa',
    400: '#8b5cf6',
    500: '#6c5ce7',
    600: '#5b4bd5',
    700: '#4c3fc0',
    800: '#3d329d',
    900: '#2e2578',
  },
  accent: {
    50: '#fff1f0',
    100: '#ffe0de',
    200: '#ffc7c4',
    300: '#ff9e99',
    400: '#ff6b6b',
    500: '#ff4757',
    600: '#ed2d3f',
  },
  gold: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#ffd93d',
    400: '#fbbf24',
    500: '#f59e0b',
  },
  neutral: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
  },
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  white: '#ffffff',
  black: '#000000',
} as const;

export const lightTheme = {
  background: colors.neutral[50],
  surface: colors.white,
  text: colors.neutral[900],
  textSecondary: colors.neutral[500],
  border: colors.neutral[200],
  primary: colors.primary[500],
  accent: colors.accent[400],
};

export const darkTheme = {
  background: '#0f0f23',
  surface: '#1a1a2e',
  text: colors.white,
  textSecondary: colors.neutral[400],
  border: colors.neutral[700],
  primary: colors.primary[400],
  accent: colors.accent[400],
};

export type Theme = typeof lightTheme;
