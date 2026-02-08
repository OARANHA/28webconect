import { Metadata } from 'next';
import type { Post, Portfolio, Media, User } from '@/payload-types';

// Get base URL for the application
export function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://28web.com.br';
}

// Interface para opções de geração de metadata
interface GenerateMetadataOptions {
  title: string;
  description?: string;
  path?: string;
  keywords?: string[];
  type?: 'website' | 'article';
  image?: string;
}

// Generate base metadata helper
export function generateMetadata(options: GenerateMetadataOptions): Metadata {
  const baseUrl = getBaseUrl();
  const { title, description, path = '', keywords, type = 'website', image } = options;

  const url = `${baseUrl}/${path}`.replace(/\/$/, '');

  return {
    title,
    description,
    keywords,
    metadataBase: new URL(baseUrl),
    openGraph: {
      title,
      description,
      type,
      url,
      images: image ? [{ url: image, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
    alternates: {
      canonical: url,
    },
  };
}

// Generate metadata for blog posts
export function generateBlogPostMetadata(post: Post): Metadata {
  const seo = post.seo || {};
  const featuredImage = post.featuredImage as Media;
  const author = post.author as User;

  const title = seo.metaTitle || post.title;
  const description = seo.metaDescription || post.excerpt;
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}`;

  return {
    title: `${title} | 28Web Connect Blog`,
    description,
    authors: author ? [{ name: author.name || author.email }] : undefined,
    openGraph: {
      title,
      description,
      type: 'article',
      url,
      publishedTime: post.publishedAt || undefined,
      modifiedTime: post.updatedAt || undefined,
      authors: author ? [author.name || author.email] : undefined,
      section: post.category || undefined,
      tags: post.tags?.map((tag: any) => tag.tag) || undefined,
      images: featuredImage
        ? [
            {
              url: featuredImage.url || '',
              width: 1200,
              height: 630,
              alt: featuredImage.alt || title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: featuredImage ? [featuredImage.url || ''] : undefined,
    },
    alternates: {
      canonical: url,
    },
    robots: {
      index: post.status === 'published',
      follow: post.status === 'published',
    },
  };
}

// Generate metadata for portfolio projects
export function generatePortfolioMetadata(project: Portfolio): Metadata {
  const seo = project.seo || {};
  const images = project.images as Array<{ image: Media; caption?: string }>;
  const firstImage = images?.[0]?.image;

  const title = seo.metaTitle || project.title;
  const description = seo.metaDescription || project.shortDescription;
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/portfolio/${project.slug}`;

  return {
    title: `${title} | 28Web Connect Portfólio`,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url,
      images: firstImage
        ? [
            {
              url: firstImage.url || '',
              width: 1200,
              height: 630,
              alt: firstImage.alt || title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: firstImage ? [firstImage.url || ''] : undefined,
    },
    alternates: {
      canonical: url,
    },
  };
}

// Generate blog listing metadata
export function generateBlogListingMetadata(page?: number, category?: string): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://28web.com.br';
  const pageNum = page && page > 1 ? ` - Página ${page}` : '';
  const categoryLabel = category ? ` - ${category}` : '';

  return {
    title: `Blog${categoryLabel}${pageNum} | 28Web Connect`,
    description:
      'Artigos sobre tecnologia, desenvolvimento web, negócios digitais e inovação. Fique por dentro das últimas tendências.',
    openGraph: {
      title: `Blog 28Web Connect${categoryLabel}`,
      description: 'Artigos sobre tecnologia, desenvolvimento web, negócios digitais e inovação.',
      type: 'website',
      url: `${baseUrl}/blog${page && page > 1 ? `?page=${page}` : ''}`,
    },
    alternates: {
      canonical: `${baseUrl}/blog`,
    },
  };
}

// Generate portfolio listing metadata
export function generatePortfolioListingMetadata(category?: string): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://28web.com.br';
  const categoryLabel = category ? ` - ${category}` : '';

  return {
    title: `Portfólio${categoryLabel} | 28Web Connect`,
    description:
      'Conheça nossos projetos de desenvolvimento web, sistemas ERP, e-commerce e soluções digitais personalizadas.',
    openGraph: {
      title: `Portfólio 28Web Connect${categoryLabel}`,
      description: 'Projetos de desenvolvimento web, sistemas ERP, e-commerce e soluções digitais.',
      type: 'website',
      url: `${baseUrl}/portfolio`,
    },
    alternates: {
      canonical: `${baseUrl}/portfolio`,
    },
  };
}

// Generate JSON-LD structured data for blog post
export function generateBlogPostJsonLd(post: Post) {
  const featuredImage = post.featuredImage as Media;
  const author = post.author as User;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || post.seo?.metaDescription,
    image: featuredImage?.url,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: author
      ? {
          '@type': 'Person',
          name: author.name || author.email,
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/blog?author=${author.id}`,
        }
      : undefined,
    publisher: {
      '@type': 'Organization',
      name: '28Web Connect',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}`,
    },
    keywords: post.tags?.map((tag: any) => tag.tag).join(', '),
    articleSection: post.category,
  };
}

// Generate JSON-LD structured data for portfolio project
export function generatePortfolioJsonLd(project: Portfolio) {
  const images = project.images as Array<{ image: Media; caption?: string }>;

  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.shortDescription || project.seo?.metaDescription,
    image: images?.[0]?.image?.url,
    dateCreated: project.completedAt,
    creator: {
      '@type': 'Organization',
      name: '28Web Connect',
    },
    client: project.client
      ? {
          '@type': 'Organization',
          name: project.client,
        }
      : undefined,
    url: project.projectUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/portfolio/${project.slug}`,
  };
}

// Generate breadcrumb JSON-LD
export function generateBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// FAQ item interface
export interface FAQItem {
  category: string;
  question: string;
  answer: string;
}

// Generate FAQ page JSON-LD structured data
export function createFAQPageSchema(faqs: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
