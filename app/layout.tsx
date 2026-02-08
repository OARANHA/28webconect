import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { auth } from '@/lib/auth';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: true,
});

// Dynamic import do ChatWidget com SSR desabilitado
const ChatWidget = dynamic(
  () => import('@/components/chat/ChatWidget').then((mod) => ({ default: mod.ChatWidget })),
  {
    ssr: false,
    loading: () => null,
  }
);

export const metadata: Metadata = {
  title: {
    default: '28Web Connect - Desenvolvimento Web, ERP e IA',
    template: '%s | 28Web Connect',
  },
  description:
    'Especialistas em desenvolvimento web, lojas online, sistemas ERP, agentes de IA e social media.',
  keywords: ['desenvolvimento web', 'ERP', 'e-commerce', 'IA', 'agentes inteligentes'],
  authors: [{ name: '28Web Connect' }],
  creator: '28Web Connect',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://28webconnect.com',
    siteName: '28Web Connect',
    title: '28Web Connect - Desenvolvimento Web, ERP e IA',
    description:
      'Especialistas em desenvolvimento web, lojas online, sistemas ERP, agentes de IA e social media.',
  },
};

export const viewport = {
  themeColor: '#ff6b35',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="antialiased">
        <AuthProvider session={session}>
          {children}
          <Suspense fallback={null}>
            <ChatWidget />
          </Suspense>
          <Toaster
            position="top-right"
            richColors
            theme="dark"
            toastOptions={{
              style: {
                background: '#1a1a1a',
                border: '2px solid rgba(255, 107, 53, 0.3)',
                color: '#ffffff',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
