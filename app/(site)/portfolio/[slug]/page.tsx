import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getProjectBySlug, getAllProjectSlugs } from '@/lib/payload';
import RichTextRenderer from '@/components/blog/RichTextRenderer';
import ImageGallery from '@/components/portfolio/ImageGallery';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ExternalLink, Calendar, Building2, Code2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { Portfolio, Media } from '@/payload-types';

interface PortfolioProjectPageProps {
  params: {
    slug: string;
  };
}

// Generate static params for all projects
export async function generateStaticParams() {
  const slugs = await getAllProjectSlugs();
  return slugs;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PortfolioProjectPageProps): Promise<Metadata> {
  const project = await getProjectBySlug(params.slug);

  if (!project) {
    return {
      title: 'Projeto não encontrado | 28Web Connect',
    };
  }

  const seo = project.seo || {};
  const images = project.images as Array<{ image: Media; caption?: string }>;
  const firstImage = images?.[0]?.image;

  return {
    title: `${seo.metaTitle || project.title} | 28Web Connect Portfólio`,
    description: seo.metaDescription || project.shortDescription,
    openGraph: {
      title: seo.metaTitle || project.title,
      description: seo.metaDescription || project.shortDescription,
      type: 'article',
      images: firstImage
        ? [
            {
              url: firstImage.url || '',
              width: 1200,
              height: 630,
              alt: firstImage.alt || project.title,
            },
          ]
        : undefined,
    },
  };
}

export default async function PortfolioProjectPage({ params }: PortfolioProjectPageProps) {
  const project = await getProjectBySlug(params.slug);

  if (!project) {
    notFound();
  }

  const images = (project.images as Array<{ image: Media; caption?: string }>) || [];
  const imageUrls = images.map((img) => ({
    url: img.image.url || '',
    alt: img.image.alt || project.title,
    caption: img.caption,
  }));

  const technologies = (project.technologies as Array<{ technology: string }>) || [];

  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link href="/" className="hover:text-[#ff6b35] transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/portfolio" className="hover:text-[#ff6b35] transition-colors">
            Portfólio
          </Link>
          <span>/</span>
          <span className="text-white truncate">{project.title}</span>
        </nav>

        {/* Back Button */}
        <Button
          variant="ghost"
          asChild
          className="mb-6 text-gray-400 hover:text-white hover:bg-white/5"
        >
          <Link href="/portfolio">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para o Portfólio
          </Link>
        </Button>

        {/* Project Header */}
        <header className="mb-10">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            {project.category && (
              <Badge variant="outline" className="border-[#ff6b35] text-[#ff6b35]">
                {projectCategories.find((c) => c.value === project.category)?.label ||
                  project.category}
              </Badge>
            )}
            {project.featured && <Badge className="bg-[#ff6b35] text-white">Destaque</Badge>}
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            {project.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-gray-400">
            {project.client && (
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>Cliente: {project.client}</span>
              </div>
            )}
            {project.completedAt && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <time dateTime={project.completedAt}>
                  Concluído em {formatDate(new Date(project.completedAt))}
                </time>
              </div>
            )}
          </div>
        </header>

        {/* Image Gallery */}
        {imageUrls.length > 0 && (
          <section className="mb-12">
            <ImageGallery images={imageUrls} />
          </section>
        )}

        {/* Project Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-white mb-6">Sobre o Projeto</h2>
            <article className="prose prose-invert prose-lg max-w-none">
              <RichTextRenderer content={project.description} />
            </article>
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            {/* Technologies */}
            {technologies.length > 0 && (
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <Code2 className="w-5 h-5 text-[#ff6b35]" />
                  <h3 className="text-white font-semibold">Tecnologias</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {technologies.map((tech, index) => (
                    <Badge key={index} variant="secondary" className="bg-white/10 text-gray-300">
                      {tech.technology}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Project URL */}
            {project.projectUrl && (
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-white font-semibold mb-4">Visitar Projeto</h3>
                <Button asChild className="w-full bg-[#ff6b35] hover:bg-[#ff6b35]/90 text-white">
                  <a href={project.projectUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Ver projeto ao vivo
                  </a>
                </Button>
              </div>
            )}

            {/* CTA */}
            <div className="bg-gradient-to-br from-[#ff6b35]/20 to-transparent rounded-lg p-6 border border-[#ff6b35]/30">
              <h3 className="text-white font-semibold mb-2">Quer um projeto similar?</h3>
              <p className="text-gray-400 text-sm mb-4">
                Entre em contato e vamos discutir como podemos ajudar seu negócio.
              </p>
              <Button
                asChild
                variant="outline"
                className="w-full border-[#ff6b35] text-[#ff6b35] hover:bg-[#ff6b35] hover:text-white"
              >
                <Link href="/contato">Fale Conosco</Link>
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

// Project categories for display
const projectCategories = [
  { value: 'erp', label: 'ERP' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'landing-page', label: 'Landing Page' },
  { value: 'sistema-customizado', label: 'Sistema Customizado' },
  { value: 'app-mobile', label: 'Aplicativo Mobile' },
  { value: 'integracao', label: 'Integração' },
];
