import RedefinirSenhaForm from './RedefinirSenhaForm';
import { generateMetadata } from '@/lib/seo';

interface ResetPasswordPageProps {
  params: {
    token: string;
  };
}

export const metadata = generateMetadata({
  title: 'Redefinir Senha',
  description: 'Crie uma nova senha para sua conta',
  path: 'redefinir-senha/{token}',
  robots: {
    index: false,
    follow: false,
  },
});

export default function RedefinirSenhaPage({ params }: ResetPasswordPageProps) {
  return <RedefinirSenhaForm token={params.token} />;
}
