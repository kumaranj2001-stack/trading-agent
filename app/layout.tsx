import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Apex // Multi-Agent Institutional Trading Swarm',
  description: 'Autonomous multi-agent trading intelligence featuring Technical Analyst, Fundamental Analyst, Forex Market Analyst, and Risk Manager roles with 1,050+ rule institutional knowledge base.',
  keywords: ['Forex', 'NSE', 'Trading Swarm', 'Multi-Agent AI', 'Risk Management', 'Algorithmic Trading', 'Technical Analysis'],
  authors: [{ name: 'Apex Algorithmic Intelligence' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#090d16',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-terminal-950 text-slate-100 antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        {children}
      </body>
    </html>
  );
}
