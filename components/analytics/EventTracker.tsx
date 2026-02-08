'use client';

import { useEffect, useRef } from 'react';
import { trackEvent, AnalyticsEvent } from '@/lib/analytics';

interface EventTrackerProps {
  event: AnalyticsEvent;
  data?: Record<string, unknown>;
  trigger?: 'mount' | 'click' | 'custom';
  onTrack?: () => void;
}

/**
 * Componente para rastrear eventos customizados
 *
 * @example
 * // Rastrear quando componente montar
 * <EventTracker event="cadastro_iniciado" trigger="mount" />
 *
 * @example
 * // Rastrear com dados
 * <EventTracker event="servico_visualizado" data={{ servico: 'ERP' }} trigger="mount" />
 */
export default function EventTracker({
  event,
  data,
  trigger = 'mount',
  onTrack,
}: EventTrackerProps) {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (trigger === 'mount' && !hasTracked.current) {
      trackEvent(event, data);
      onTrack?.();
      hasTracked.current = true;
    }
  }, [event, trigger]);

  return null;
}
