import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NCRSarkariShaadi — Career-compatible matrimony for NCR government professionals',
  description:
    'A verified, privacy-first matrimony platform for government professionals building their careers in the Delhi NCR.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
