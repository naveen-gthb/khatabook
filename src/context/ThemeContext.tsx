'use client';

import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';

export function ThemeProvider({ children, ...props }: { children: React.ReactNode; [key: string]: any; }) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

export { useTheme };
