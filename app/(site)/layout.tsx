import type { Metadata } from 'next';
import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import dynamic from 'next/dynamic';
import { generateMetadata } from '@/lib/seo';

// Dynamic import do CookieBanner com SSR desabilitado
const CookieBanner = dynamic(() => import('@/components/site/CookieBanner'), {
  ssr: false,
  loading: () => null,
});

export const metadata: Metadata = generateMetadata({
  title: '28Web Connect - Desenvolvimento Web, ERP e IA',
  description:
    'Especialistas em desenvolvimento web, lojas online, sistemas ERP, agentes de IA e social media. Transforme sua presença digital.',
  path: '',
  keywords: [
    'desenvolvimento web',
    'ERP',
    'e-commerce',
    'IA',
    'agentes inteligentes',
    'social media',
  ],
  type: 'website',
});

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CookieBanner />
    </div>
  );
}
