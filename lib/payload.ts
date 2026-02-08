// Simplified payload module - Payload CMS temporarily disabled due to v3 compatibility issues
// TODO: Re-enable Payload CMS when upgrading to v3 properly

import { unstable_cache } from 'next/cache';

// Mock data for posts
const mockPosts: any[] = [];

// Mock data for portfolio
const mockPortfolio: any[] = [];

// Get Payload client instance - disabled
export async function getPayloadClient() {
  console.warn('Payload CMS is temporarily disabled');
  return null;
}

// Get published posts with optional filtering
export const getPublishedPosts = unstable_cache(
  async (limit = 12, category?: string, page = 1, search?: string) => {
    return { docs: [], totalDocs: 0, totalPages: 0, page: 1, limit };
  },
  ['published-posts'],
  {
    revalidate: 3600,
    tags: ['posts'],
  }
);

// Get single post by slug
export const getPostBySlug = unstable_cache(
  async (slug: string) => {
    return null;
  },
  ['post-by-slug'],
  {
    revalidate: 3600,
    tags: ['posts'],
  }
);

// Get all post slugs for static generation
export async function getAllPostSlugs() {
  return [];
}

// Get portfolio projects with optional filtering
export const getPortfolioProjects = unstable_cache(
  async (category?: string, limit = 100, search?: string) => {
    return { docs: [], totalDocs: 0, totalPages: 0, page: 1, limit };
  },
  ['portfolio-projects'],
  {
    revalidate: 3600,
    tags: ['portfolio'],
  }
);

// Get featured projects
export const getFeaturedProjects = unstable_cache(
  async (limit = 6) => {
    return { docs: [], totalDocs: 0, totalPages: 0, page: 1, limit };
  },
  ['featured-projects'],
  {
    revalidate: 3600,
    tags: ['portfolio'],
  }
);

// Get single project by slug
export const getProjectBySlug = unstable_cache(
  async (slug: string) => {
    return null;
  },
  ['project-by-slug'],
  {
    revalidate: 3600,
    tags: ['portfolio'],
  }
);

// Get all project slugs for static generation
export async function getAllProjectSlugs() {
  return [];
}
