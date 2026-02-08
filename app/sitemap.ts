import { MetadataRoute } from 'next';
import { getPayloadClient } from '@/lib/payload';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://28web.com.br';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/servicos`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/sobre`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contato`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/portfolio`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/politica-privacidade`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/termos-uso`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/politica-cookies`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Get posts for blog sitemap
  let blogPosts: MetadataRoute.Sitemap = [];
  let portfolioProjects: MetadataRoute.Sitemap = [];

  try {
    const payload = await getPayloadClient();

    // Payload CMS is disabled, skip dynamic content
    if (!payload) {
      return staticPages;
    }

    // Fetch published posts
    const postsResponse = await payload.find({
      collection: 'posts',
      where: {
        status: {
          equals: 'published',
        },
      },
      select: {
        slug: true,
        updatedAt: true,
      },
      limit: 1000,
    });

    blogPosts = postsResponse.docs.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt || Date.now()),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    // Fetch portfolio projects
    const projectsResponse = await payload.find({
      collection: 'portfolio',
      select: {
        slug: true,
        updatedAt: true,
      },
      limit: 1000,
    });

    portfolioProjects = projectsResponse.docs.map((project) => ({
      url: `${baseUrl}/portfolio/${project.slug}`,
      lastModified: new Date(project.updatedAt || Date.now()),
      changeFrequency: 'monthly',
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }

  return [...staticPages, ...blogPosts, ...portfolioProjects];
}
