import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TruckSaathi — Fleet Operating System for India Logistics',
  description: 'AI-powered Smart Fleet Safety & Logistics Intelligence Platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#090d16] text-slate-100">{children}</body>
    </html>
  );
}
