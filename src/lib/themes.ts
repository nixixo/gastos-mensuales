export type ThemeName =
  | 'dark'
  | 'pastel-gray'
  | 'pastel-pink'
  | 'midnight-rose'
  | 'midnight-butter'
  | 'pastel-yellow';

export interface ThemeColors {
  name: ThemeName;
  label: string;
  // Main backgrounds
  bg: {
    primary: string;      // Main background color
    secondary: string;    // Secondary/card background
    tertiary: string;     // Tertiary elements
  };
  // Text colors
  text: {
    primary: string;      // Main text color
    secondary: string;    // Secondary text (muted)
    tertiary: string;     // Tertiary text (very muted)
  };
  // UI elements
  ui: {
    border: string;       // Border colors
    hover: string;        // Hover state background
    input: string;        // Input background
  };
  // Accent
  accent: {
    primary: string;      // Primary accent (button, primary CTA)
    contrast: string;     // Contrast color for accent surfaces
  };
  // Chart palette (generic categories)
  chart: {
    c1: string;
    c2: string;
    c3: string;
    c4: string;
    c5: string;
    c6: string;
    c7: string;
    c8: string;
  };
}

export const THEMES: Record<ThemeName, ThemeColors> = {
  dark: {
    name: 'dark',
    label: 'Oscuro',
    bg: {
      primary: '#000000',        // Pure black
      secondary: '#1a1a1a',      // Slightly lighter black
      tertiary: '#0f0f0f',       // Even darker for depth
    },
    text: {
      primary: '#ffffff',        // White text
      secondary: 'rgba(255, 255, 255, 0.5)', // 50% opacity white
      tertiary: 'rgba(255, 255, 255, 0.2)',  // 20% opacity white
    },
    ui: {
      border: 'rgba(255, 255, 255, 0.1)',    // 10% white border
      hover: 'rgba(255, 255, 255, 0.05)',    // 5% white hover
      input: 'rgba(255, 255, 255, 0.05)',    // Input background
    },
    accent: {
      primary: '#ffffff',        // White button
      contrast: '#000000',       // Black for check/icon on white
    },
    chart: {
      c1: '#ffffff',
      c2: '#a3a3a3',
      c3: '#737373',
      c4: '#d4d4d4',
      c5: '#525252',
      c6: '#e5e5e5',
      c7: '#404040',
      c8: '#fafafa',
    },
  },
  'pastel-gray': {
    name: 'pastel-gray',
    label: 'Grises Pasteles',
    bg: {
      primary: '#f5f3f0',        // Very light warm gray
      secondary: '#ede8e3',      // Light pastel gray
      tertiary: '#e6dfd7',       // Slightly darker pastel gray
    },
    text: {
      primary: '#4a4340',        // Dark brownish gray
      secondary: 'rgba(74, 67, 64, 0.6)',    // 60% opacity brownish gray
      tertiary: 'rgba(74, 67, 64, 0.35)',    // 35% opacity brownish gray
    },
    ui: {
      border: 'rgba(74, 67, 64, 0.12)',      // 12% brownish border
      hover: 'rgba(74, 67, 64, 0.05)',       // 5% brownish hover
      input: 'rgba(74, 67, 64, 0.06)',       // Input background
    },
    accent: {
      primary: '#4a4340',        // Dark brownish button
      contrast: '#f5f3f0',       // Light for check/icon on dark
    },
    chart: {
      c1: '#4a4340',
      c2: '#7a706c',
      c3: '#a1938e',
      c4: '#c6b9b2',
      c5: '#8d817b',
      c6: '#d6cbc5',
      c7: '#655b56',
      c8: '#ede8e3',
    },
  },
  'pastel-pink': {
    name: 'pastel-pink',
    label: 'Rosas Pasteles',
    bg: {
      primary: '#fdf4f6',        // Very light pink
      secondary: '#f7e7ec',      // Soft blush
      tertiary: '#f1d9e2',       // Deeper blush for depth
    },
    text: {
      primary: '#4c2f36',        // Muted plum
      secondary: 'rgba(76, 47, 54, 0.6)',   // 60% opacity plum
      tertiary: 'rgba(76, 47, 54, 0.35)',   // 35% opacity plum
    },
    ui: {
      border: 'rgba(76, 47, 54, 0.12)',     // 12% plum border
      hover: 'rgba(76, 47, 54, 0.05)',      // 5% plum hover
      input: 'rgba(76, 47, 54, 0.06)',      // Input background
    },
    accent: {
      primary: '#b45571',        // Rose button
      contrast: '#fdf4f6',       // Light for check/icon on rose
    },
    chart: {
      c1: '#b45571',
      c2: '#d07a92',
      c3: '#e2a6b6',
      c4: '#f0c6d2',
      c5: '#9b3f5c',
      c6: '#f6dbe3',
      c7: '#7c2944',
      c8: '#fbecef',
    },
  },
  'midnight-rose': {
    name: 'midnight-rose',
    label: 'Negro y Rosa',
    bg: {
      primary: '#090709',
      secondary: '#171118',
      tertiary: '#120d13',
    },
    text: {
      primary: '#f7e7ef',
      secondary: 'rgba(247, 231, 239, 0.68)',
      tertiary: 'rgba(247, 231, 239, 0.38)',
    },
    ui: {
      border: 'rgba(244, 196, 214, 0.14)',
      hover: 'rgba(244, 196, 214, 0.08)',
      input: 'rgba(244, 196, 214, 0.07)',
    },
    accent: {
      primary: '#e7a9c1',
      contrast: '#1a1116',
    },
    chart: {
      c1: '#e7a9c1',
      c2: '#f1bfd0',
      c3: '#c97a99',
      c4: '#f6d7e3',
      c5: '#a94d71',
      c6: '#d88aa8',
      c7: '#8a3658',
      c8: '#f9e8ef',
    },
  },
  'midnight-butter': {
    name: 'midnight-butter',
    label: 'Negro y Amarillo',
    bg: {
      primary: '#0b0a07',
      secondary: '#17150f',
      tertiary: '#12100b',
    },
    text: {
      primary: '#fff9d6',
      secondary: 'rgba(255, 249, 214, 0.68)',
      tertiary: 'rgba(255, 249, 214, 0.38)',
    },
    ui: {
      border: 'rgba(255, 246, 145, 0.16)',
      hover: 'rgba(255, 246, 145, 0.09)',
      input: 'rgba(255, 246, 145, 0.08)',
    },
    accent: {
      primary: '#ffef5c',
      contrast: '#1a1710',
    },
    chart: {
      c1: '#ffef5c',
      c2: '#ffd93d',
      c3: '#ffbf1f',
      c4: '#fff28a',
      c5: '#e5a900',
      c6: '#ffe96b',
      c7: '#bf8500',
      c8: '#fff7b0',
    },
  },
  'pastel-yellow': {
    name: 'pastel-yellow',
    label: 'Amarillos Pasteles',
    bg: {
      primary: '#fffef4',
      secondary: '#fff9cf',
      tertiary: '#fff19f',
    },
    text: {
      primary: '#5f4708',
      secondary: 'rgba(95, 71, 8, 0.6)',
      tertiary: 'rgba(95, 71, 8, 0.35)',
    },
    ui: {
      border: 'rgba(95, 71, 8, 0.12)',
      hover: 'rgba(95, 71, 8, 0.05)',
      input: 'rgba(95, 71, 8, 0.06)',
    },
    accent: {
      primary: '#f0d23f',
      contrast: '#fffdf1',
    },
    chart: {
      c1: '#f0d23f',
      c2: '#ffe160',
      c3: '#ffea84',
      c4: '#fff2a8',
      c5: '#d8b41f',
      c6: '#fff6c0',
      c7: '#aa8400',
      c8: '#fffbe0',
    },
  },
};

export const DEFAULT_THEME: ThemeName = 'dark';

/**
 * Applies a theme by updating CSS custom properties
 * This allows dynamic theme switching without page reload
 */
export function applyTheme(themeName: ThemeName) {
  const theme = THEMES[themeName];
  if (!theme) return;

  const root = document.documentElement;

  // Apply theme colors as CSS custom properties
  root.style.setProperty('--color-bg-primary', theme.bg.primary);
  root.style.setProperty('--color-bg-secondary', theme.bg.secondary);
  root.style.setProperty('--color-bg-tertiary', theme.bg.tertiary);

  root.style.setProperty('--color-text-primary', theme.text.primary);
  root.style.setProperty('--color-text-secondary', theme.text.secondary);
  root.style.setProperty('--color-text-tertiary', theme.text.tertiary);

  root.style.setProperty('--color-ui-border', theme.ui.border);
  root.style.setProperty('--color-ui-hover', theme.ui.hover);
  root.style.setProperty('--color-ui-input', theme.ui.input);

  root.style.setProperty('--color-accent-primary', theme.accent.primary);
  root.style.setProperty('--color-accent-contrast', theme.accent.contrast);

  root.style.setProperty('--color-chart-1', theme.chart.c1);
  root.style.setProperty('--color-chart-2', theme.chart.c2);
  root.style.setProperty('--color-chart-3', theme.chart.c3);
  root.style.setProperty('--color-chart-4', theme.chart.c4);
  root.style.setProperty('--color-chart-5', theme.chart.c5);
  root.style.setProperty('--color-chart-6', theme.chart.c6);
  root.style.setProperty('--color-chart-7', theme.chart.c7);
  root.style.setProperty('--color-chart-8', theme.chart.c8);
}
