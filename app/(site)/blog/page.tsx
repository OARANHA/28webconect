import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublishedPosts } from '@/lib/payload';
import PostCard from '@/components/blog/PostCard';
import Button from '@/components/ui/Button';
import { blogCategories } from '@/lib/constants';
import { BookOpen } from 'lucide-react';
import Link from 'next/link';
import { BlogFilters } from '@/components/blog/BlogFilters';

export const metadata: Metadata = {
  title: 'Blog | 28Web Connect',
  description:
    'Artigos sobre tecnologia, desenvolvimento web, negócios digitais e inovação. Fique por dentro das últimas tendências e novidades do mercado.',
  openGraph: {
    title: 'Blog | 28Web Connect',
    description: 'Artigos sobre tecnologia, desenvolvimento web, negócios digitais e inovação.',
    type: 'website',
    url: '/blog',
  },
};

// Add dynamic export to allow search params
export const dynamic = 'force-dynamic';

interface BlogPageProps {
  searchParams: {
    page?: string;
    category?: string;
    search?: string;
  };
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const page = parseInt(searchParams.page || '1', 10);
  const category = searchParams.category;
  const search = searchParams.search;

  const postsData = await getPublishedPosts(12, category, page, search);
  const { docs: posts, totalPages, hasNextPage, hasPrevPage } = postsData;

  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            <span className="text-[#ff6b35]">Blog</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Artigos sobre tecnologia, desenvolvimento web, negócios digitais e inovação. Fique por
            dentro das últimas tendências e novidades do mercado.
          </p>
        </div>

        {/* Filters - Client Component */}
        <BlogFilters
          initialCategory={category || 'all'}
          initialSearch={search || ''}
          categories={blogCategories}
        />

        {/* Posts Grid */}
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Nenhum artigo encontrado</h3>
            <p className="text-gray-400">
              {search
                ? 'Nenhum artigo corresponde à sua busca.'
                : category
                  ? 'Não há artigos nesta categoria ainda.'
                  : 'Nosso blog está em construção. Volte em brece!'}
            </p>
            {(search || category) && (
              <Link href="/blog" className="inline-block mt-4 text-[#ff6b35] hover:underline">
                Limpar filtros
              </Link>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-12">
            {hasPrevPage && (
              <Button
                variant="outline"
                asChild
                className="border-[#ff6b35] text-[#ff6b35] hover:bg-[#ff6b35] hover:text-white"
              >
                <Link
                  href={`/blog?page=${page - 1}${category ? `&category=${category}` : ''}${search ? `&search=${encodeURIComponent(search)}` : ''}`}
                >
                  Anterior
                </Link>
              </Button>
            )}
            <span className="text-gray-400">
              Página {page} de {totalPages}
            </span>
            {hasNextPage && (
              <Button
                variant="outline"
                asChild
                className="border-[#ff6b35] text-[#ff6b35] hover:bg-[#ff6b35] hover:text-white"
              >
                <Link
                  href={`/blog?page=${page + 1}${category ? `&category=${category}` : ''}${search ? `&search=${encodeURIComponent(search)}` : ''}`}
                >
                  Próxima
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
