import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://v2.ncrsarkarishaadi.workers.dev'),
  title: 'NCRSarkariShaadi — Free Verified Matrimony for Government Officers in Delhi NCR',
  description:
    'A free, privacy-first matrimony platform exclusively for CSS, DANICS, IPS, IFS & allied government professionals posted in Delhi NCR (National Capital Region). Verified profiles, hidden-photo options, and free two-way messaging.',
  keywords: [
    'government matrimony Delhi',
    'CSS matrimony',
    'DANICS marriage',
    'NCR sarkari shaadi',
    'verified government matrimonial',
    'free govt officer matrimony',
  ],
  openGraph: {
    title: 'NCRSarkariShaadi — Free Verified Matrimony for Government Officers in Delhi NCR',
    description:
      'Two government careers, one shared life in Delhi NCR. Verified, privacy-first, and free two-way messaging — built for CSS, DANICS, IPS, IFS and allied services.',
    url: 'https://v2.ncrsarkarishaadi.workers.dev',
    siteName: 'NCRSarkariShaadi',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NCRSarkariShaadi — Free Verified Matrimony for Government Officers in Delhi NCR',
    description:
      'Two government careers, one shared life in Delhi NCR. Verified, privacy-first, free two-way messaging.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#43121f',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {/* React 19 hoists these into <head>. Fraunces (variable: opsz/SOFT/WONK) + Satoshi (Fontshare). */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,300..900,0..100,0..1;1,9..144,300..900,0..100,0..1&display=swap"
        />
        <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap" />
        {children}
      </body>
    </html>
  );
}
