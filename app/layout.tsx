import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Qri Trader // Autonomous Multi-Agent Trading Swarm',
  description: 'Qri Trader - Autonomous multi-agent trading intelligence featuring Technical Analyst, Fundamental Analyst, Forex Market Analyst, News Analyst, and Risk Manager roles with 1,050+ rule institutional knowledge base.',
  keywords: ['Qri Trader', 'Forex', 'NSE', 'Trading Swarm', 'Multi-Agent AI', 'Risk Management', 'Algorithmic Trading', 'Technical Analysis'],
  authors: [{ name: 'Qri Trader' }],
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('qri_theme') || localStorage.getItem('apex_theme');
                  var theme = saved === 'light' ? 'light' : 'dark';
                  document.documentElement.classList.remove('light', 'dark');
                  document.documentElement.classList.add(theme);
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-terminal-950 text-slate-100 antialiased selection:bg-cyan-500/30 selection:text-cyan-200 transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}
