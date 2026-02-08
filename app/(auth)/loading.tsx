import { AuthFormSkeleton } from '@/components/ui/Skeleton';

/**
 * Loading state para páginas de autenticação
 */
export default function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <AuthFormSkeleton />
    </div>
  );
}
