import type { Metadata } from 'next';
import { Outfit, JetBrains_Mono } from 'next/font/google';
import { ColorSchemeScript } from '@mantine/core';
import { Providers } from './providers';
import { BRAND_NAME } from '@/src/shared/constants/brand';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-outfit',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jbmono',
});

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
      className={`h-full antialiased ${outfit.variable} ${jetbrainsMono.variable}`}
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
