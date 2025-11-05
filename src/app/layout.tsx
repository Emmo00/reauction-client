import type { Metadata } from 'next';

import '@/app/globals.css';
import { Providers } from '@/app/providers';
import { APP_NAME, APP_DESCRIPTION } from '@/lib/constants';
import { Geist as V0_Font_Geist, Geist_Mono as V0_Font_Geist_Mono, Source_Serif_4 as V0_Font_Source_Serif_4 } from 'next/font/google'

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
};

// Initialize fonts with fallbacks
const _geist = V0_Font_Geist({ 
  subsets: ['latin'], 
  weight: ["100","200","300","400","500","600","700","800","900"],
  fallback: ['system-ui', 'arial'],
  display: 'swap'
})
const _geistMono = V0_Font_Geist_Mono({ 
  subsets: ['latin'], 
  weight: ["100","200","300","400","500","600","700","800","900"],
  fallback: ['ui-monospace', 'SFMono-Regular', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
  display: 'swap'
})
const _sourceSerif_4 = V0_Font_Source_Serif_4({ 
  subsets: ['latin'], 
  weight: ["200","300","400","500","600","700","800","900"],
  fallback: ['Georgia', 'Times New Roman', 'serif'],
  display: 'swap'
})

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${_geist.className} ${_geistMono.className}`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
