import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Apex // Multi-Agent Trading Swarm (Vercel Ready)',
  description: 'Autonomous multi-agent trading intelligence featuring Technical Analyst, Fundamental Analyst, Forex Market Analyst, and Risk Manager roles.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-terminal-950 text-slate-100 antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        {children}
      </body>
    </html>
  );
}
