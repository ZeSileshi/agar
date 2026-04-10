import type { Metadata, Viewport } from 'next';
import { Urbanist, Noto_Sans_Ethiopic } from 'next/font/google';
import './globals.css';

const urbanist = Urbanist({
  subsets: ['latin'],
  variable: '--font-urbanist',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

const notoEthiopic = Noto_Sans_Ethiopic({
  subsets: ['ethiopic'],
  variable: '--font-ethiopic',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Agar - አጋር | Find Your Perfect Match',
  description:
    'AI-powered matchmaking platform with cultural compatibility intelligence. Combining astrology, behavioral science, and modern dating.',
  keywords: [
    'dating', 'matchmaking', 'astrology', 'compatibility',
    'Ethiopian dating', 'agar', 'አጋር',
  ],
  openGraph: {
    title: 'Agar - አጋር',
    description: 'Where stars align and hearts connect',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#6c5ce7' },
    { media: '(prefers-color-scheme: dark)', color: '#0f0f23' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${urbanist.variable} ${notoEthiopic.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
