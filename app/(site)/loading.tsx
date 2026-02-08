import { HomePageSkeleton } from '@/components/ui/Skeleton';

/**
 * Loading state para as páginas do site
 * Usa skeleton com animação shimmer para melhor perceived performance
 */
export default function SiteLoading() {
  return <HomePageSkeleton />;
}
