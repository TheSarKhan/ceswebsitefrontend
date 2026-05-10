import type { ReactNode } from 'react';

// Root layout is intentionally minimal — html/body are rendered by [locale]/layout.tsx
// because the lang attribute depends on the URL locale.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
