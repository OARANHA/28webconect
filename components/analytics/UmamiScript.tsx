'use client';

import { useEffect } from 'react';
import { shouldLoadAnalytics } from '@/lib/cookies';

/**
 * Componente que carrega o script do Umami Analytics condicionalmente
 * Só carrega se o usuário tiver consentido com cookies de analytics
 */
export default function UmamiScript() {
  useEffect(() => {
    // Verificar se deve carregar analytics
    if (!shouldLoadAnalytics()) {
      return;
    }

    // Verificar se já existe um script do Umami
    if (document.querySelector('script[data-website-id]')) {
      return;
    }

    // Obter variáveis de ambiente
    const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
    const umamiUrl = process.env.NEXT_PUBLIC_UMAMI_URL;

    // Verificar se variáveis estão configuradas
    if (!websiteId || !umamiUrl) {
      console.warn('Umami: Website ID ou URL não configurados');
      return;
    }

    // Criar e injetar script
    const script = document.createElement('script');
    script.async = true;
    script.src = `${umamiUrl}/script.js`;
    script.setAttribute('data-website-id', websiteId);
    script.setAttribute('data-host-url', umamiUrl);
    script.setAttribute('data-auto-track', 'true');
    script.defer = true;

    // Adicionar ao head
    document.head.appendChild(script);

    // Cleanup não necessário pois queremos manter o script carregado
    // mesmo se o componente for desmontado
  }, []);

  // Este componente não renderiza nada visível
  return null;
}
