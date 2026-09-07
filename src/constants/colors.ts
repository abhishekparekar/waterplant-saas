export const Colors = {
  primary: '#0284c7', // Sky blue brand color (Ganga water theme)
  primaryLight: '#e0f2fe',
  primaryDark: '#0369a1',
  
  secondary: '#00b4d8', // Cyan splash accent color
  secondaryLight: '#ecfeff',
  
  success: '#10B981', // Emerald green
  warning: '#F59E0B', // Amber orange
  danger: '#EF4444', // Rose red
  
  light: {
    text: '#0F172A', // Slate 900
    textSecondary: '#64748B', // Slate 500
    textMuted: '#94A3B8', // Slate 400
    background: '#F8FAFC', // Slate 50
    card: '#FFFFFF',
    border: '#E2E8F0', // Slate 200
  },
  dark: {
    text: '#F8FAFC', // Slate 50
    textSecondary: '#94A3B8', // Slate 400
    textMuted: '#64748B', // Slate 500
    background: '#0F172A', // Slate 900
    card: '#1E293B', // Slate 800
    border: '#334155', // Slate 700
  }
} as const;

export type ThemeColors = typeof Colors;
