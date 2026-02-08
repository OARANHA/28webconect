import type { MetadataRoute } from 'next';
import { getBaseUrl } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/*',
          '/admin/*',
          '/api/*',
          '/cadastro',
          '/login',
          '/recuperar-senha',
          '/verificar-email',
          '/redefinir-senha/*',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    // crawlDelay é opcional e pode ser adicionado se necessário
    // crawlDelay: 1,
  };
}
