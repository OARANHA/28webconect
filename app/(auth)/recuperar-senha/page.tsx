import type { Metadata } from 'next';
import RecuperarSenhaForm from './RecuperarSenhaForm';
import { generateMetadata } from '@/lib/seo';

export const metadata: Metadata = generateMetadata({
  title: 'Recuperar Senha',
  description: 'Recupere sua senha da 28Web Connect',
  path: 'recuperar-senha',
  robots: { index: false, follow: false },
});

export default function RecuperarSenhaPage() {
  return <RecuperarSenhaForm />;
}
