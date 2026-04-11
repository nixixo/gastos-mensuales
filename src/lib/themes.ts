export type ThemeName = 'dark' | 'pastel-gray' | 'pastel-pink';

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

  root.style.setProperty('--color-chart-1', theme.chart.c1);
  root.style.setProperty('--color-chart-2', theme.chart.c2);
  root.style.setProperty('--color-chart-3', theme.chart.c3);
  root.style.setProperty('--color-chart-4', theme.chart.c4);
  root.style.setProperty('--color-chart-5', theme.chart.c5);
  root.style.setProperty('--color-chart-6', theme.chart.c6);
  root.style.setProperty('--color-chart-7', theme.chart.c7);
  root.style.setProperty('--color-chart-8', theme.chart.c8);
}
