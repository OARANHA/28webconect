'use client';

import { useEffect } from 'react';
import { trackPageView } from '@/lib/analytics';

interface PageViewTrackerProps {
  url?: string;
}

/**
 * Componente para rastrear visualização de página
 * Deve ser usado em páginas onde queremos tracking manual
 *
 * O Umami já faz tracking automático de pageviews, mas este componente
 * é útil para casos especiais ou debugging
 */
export default function PageViewTracker({ url }: PageViewTrackerProps) {
  useEffect(() => {
    trackPageView(url);
  }, [url]);

  return null;
}
