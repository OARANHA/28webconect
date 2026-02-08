// Schema functions for structured data - Server-safe

// Organization schema
export function createOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '28Web Connect',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://28web.com.br',
    logo: {
      '@type': 'ImageObject',
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://28web.com.br'}/logo.png`,
    },
    description:
      'Especialistas em desenvolvimento web, lojas online, sistemas ERP, agentes de IA e social media.',
    sameAs: [
      'https://facebook.com/28webconnect',
      'https://instagram.com/28webconnect',
      'https://linkedin.com/company/28webconnect',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['Portuguese'],
    },
  };
}

// Website schema
export function createWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '28Web Connect',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://28web.com.br',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://28web.com.br'}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}
