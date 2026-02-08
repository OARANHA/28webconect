import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getPostBySlug, getAllPostSlugs } from '@/lib/payload';
import RichTextRenderer from '@/components/blog/RichTextRenderer';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, User, Share2, Twitter, Linkedin, Facebook } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { Post, Media, User as UserType } from '@/payload-types';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

// Generate static params for all posts
export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return {
      title: 'Post não encontrado | 28Web Connect',
    };
  }

  const seo = post.seo || {};
  const featuredImage = post.featuredImage as Media;

  return {
    title: `${seo.metaTitle || post.title} | 28Web Connect Blog`,
    description: seo.metaDescription || post.excerpt,
    openGraph: {
      title: seo.metaTitle || post.title,
      description: seo.metaDescription || post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: post.author
        ? [(post.author as UserType).name || (post.author as UserType).email]
        : undefined,
      images: featuredImage
        ? [
            {
              url: featuredImage.url || '',
              width: 1200,
              height: 630,
              alt: featuredImage.alt || post.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.metaTitle || post.title,
      description: seo.metaDescription || post.excerpt,
      images: featuredImage ? [featuredImage.url || ''] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const featuredImage = post.featuredImage as Media;
  const author = post.author as UserType;

  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link href="/" className="hover:text-[#ff6b35] transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-[#ff6b35] transition-colors">
            Blog
          </Link>
          <span>/</span>
          <span className="text-white truncate">{post.title}</span>
        </nav>

        {/* Back Button */}
        <Button
          variant="ghost"
          asChild
          className="mb-6 text-gray-400 hover:text-white hover:bg-white/5"
        >
          <Link href="/blog">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para o Blog
          </Link>
        </Button>

        {/* Post Header */}
        <header className="mb-10">
          {post.category && (
            <Badge variant="outline" className="mb-4 border-[#ff6b35] text-[#ff6b35]">
              {post.category}
            </Badge>
          )}

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-gray-400 text-sm">
            {author && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{author.name || author.email}</span>
              </div>
            )}
            {post.publishedAt && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <time dateTime={post.publishedAt}>{formatDate(new Date(post.publishedAt))}</time>
              </div>
            )}
          </div>
        </header>

        {/* Featured Image */}
        {featuredImage && (
          <div className="relative aspect-video mb-10 rounded-lg overflow-hidden border border-white/10">
            <Image
              src={featuredImage.url || ''}
              alt={featuredImage.alt || post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Post Content */}
        <article className="prose prose-invert prose-lg max-w-none mb-12">
          <RichTextRenderer content={post.content} />
        </article>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            {post.tags.map((tagItem, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-white/10 text-gray-300 hover:bg-white/20"
              >
                {(tagItem as { tag: string }).tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Share Buttons */}
        <div className="border-t border-white/10 pt-8">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Compartilhar
          </h3>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="icon"
              asChild
              className="border-white/10 hover:bg-[#1DA1F2] hover:border-[#1DA1F2] hover:text-white"
            >
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Compartilhar no Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </Button>
            <Button
              variant="outline"
              size="icon"
              asChild
              className="border-white/10 hover:bg-[#0A66C2] hover:border-[#0A66C2] hover:text-white"
            >
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Compartilhar no LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </Button>
            <Button
              variant="outline"
              size="icon"
              asChild
              className="border-white/10 hover:bg-[#1877F2] hover:border-[#1877F2] hover:text-white"
            >
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Compartilhar no Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
