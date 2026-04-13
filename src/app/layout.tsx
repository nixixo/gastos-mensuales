import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import { DEFAULT_THEME, THEMES } from "@/lib/themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gastetes",
  description: "Controla tus gastos facilmente",
};

const THEME_INIT_SCRIPT = `
(() => {
  try {
    const key = "gastos-theme";
    const themes = ${JSON.stringify(THEMES)};
    const fallback = "${DEFAULT_THEME}";
    const stored = localStorage.getItem(key);
    const themeName = stored && themes[stored] ? stored : fallback;
    const theme = themes[themeName];
    const root = document.documentElement;

    root.style.setProperty("--color-bg-primary", theme.bg.primary);
    root.style.setProperty("--color-bg-secondary", theme.bg.secondary);
    root.style.setProperty("--color-bg-tertiary", theme.bg.tertiary);
    root.style.setProperty("--color-text-primary", theme.text.primary);
    root.style.setProperty("--color-text-secondary", theme.text.secondary);
    root.style.setProperty("--color-text-tertiary", theme.text.tertiary);
    root.style.setProperty("--color-ui-border", theme.ui.border);
    root.style.setProperty("--color-ui-hover", theme.ui.hover);
    root.style.setProperty("--color-ui-input", theme.ui.input);
    root.style.setProperty("--color-accent-primary", theme.accent.primary);
    root.style.setProperty("--color-accent-contrast", theme.accent.contrast);
    root.style.setProperty("--color-chart-1", theme.chart.c1);
    root.style.setProperty("--color-chart-2", theme.chart.c2);
    root.style.setProperty("--color-chart-3", theme.chart.c3);
    root.style.setProperty("--color-chart-4", theme.chart.c4);
    root.style.setProperty("--color-chart-5", theme.chart.c5);
    root.style.setProperty("--color-chart-6", theme.chart.c6);
    root.style.setProperty("--color-chart-7", theme.chart.c7);
    root.style.setProperty("--color-chart-8", theme.chart.c8);
  } catch {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
