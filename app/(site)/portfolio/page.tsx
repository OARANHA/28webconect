import { Metadata } from 'next';
import { getPortfolioProjects, getFeaturedProjects } from '@/lib/payload';
import ProjectCard from '@/components/portfolio/ProjectCard';
import { projectCategories } from '@/lib/constants';
import { Briefcase, Star } from 'lucide-react';
import Link from 'next/link';
import { PortfolioFilters } from '@/components/portfolio/PortfolioFilters';

export const metadata: Metadata = {
  title: 'Portfólio | 28Web Connect',
  description:
    'Conheça nossos projetos de desenvolvimento web, sistemas ERP, e-commerce e soluções digitais personalizadas para nossos clientes.',
  openGraph: {
    title: 'Portfólio | 28Web Connect',
    description: 'Projetos de desenvolvimento web, sistemas ERP, e-commerce e soluções digitais.',
    type: 'website',
    url: '/portfolio',
  },
};

interface PortfolioPageProps {
  searchParams: {
    category?: string;
    search?: string;
  };
}

// Add dynamic export to allow search params
export const dynamic = 'force-dynamic';

export default async function PortfolioPage({ searchParams }: PortfolioPageProps) {
  const category = searchParams.category;
  const search = searchParams.search;

  const [projectsData, featuredData] = await Promise.all([
    getPortfolioProjects(category, 100, search),
    getFeaturedProjects(3),
  ]);

  const { docs: projects } = projectsData;
  const { docs: featuredProjects } = featuredData;

  // Filter out featured projects from the main list if no category filter
  const displayProjects = category || search ? projects : projects.filter((p) => !p.featured);

  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            <span className="text-[#ff6b35]">Portfólio</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Conheça nossos projetos de desenvolvimento web, sistemas ERP, e-commerce e soluções
            digitais personalizadas.
          </p>
        </div>

        {/* Filters - Client Component */}
        <PortfolioFilters
          initialCategory={category || 'all'}
          initialSearch={search || ''}
          categories={projectCategories}
        />

        {/* Featured Projects Section */}
        {!category && !search && featuredProjects.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <Star className="w-6 h-6 text-[#ff6b35]" />
              <h2 className="text-2xl font-bold text-white">Projetos em Destaque</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} featured />
              ))}
            </div>
          </section>
        )}

        {/* All Projects */}
        <section>
          {(category || search) && (
            <h2 className="text-2xl font-bold text-white mb-8">
              {search ? `Resultados para "${search}"` : 'Todos os Projetos'}
            </h2>
          )}
          {displayProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Briefcase className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Nenhum projeto encontrado</h3>
              <p className="text-gray-400">
                {search
                  ? 'Nenhum projeto corresponde à sua busca.'
                  : category
                    ? 'Não há projetos nesta categoria.'
                    : 'Nosso portfólio está sendo atualizado. Volte em breve!'}
              </p>
              {(search || category) && (
                <Link
                  href="/portfolio"
                  className="inline-block mt-4 text-[#ff6b35] hover:underline"
                >
                  Limpar filtros
                </Link>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
