import type { Metadata } from 'next';
import { ColorSchemeScript } from '@mantine/core';
import { Providers } from './providers';
import { BRAND_NAME } from '@/src/shared/constants/brand';
import './globals.css';

export const metadata: Metadata = {
  title: BRAND_NAME,
  description: 'Sistema genérico e configurável de listagem',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className="h-full"
      suppressHydrationWarning
    >
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>

      <body className="h-full flex flex-col font-sans overflow-hidden">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
