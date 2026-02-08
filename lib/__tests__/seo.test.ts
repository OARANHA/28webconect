/**
 * Unit Tests: SEO Utilities
 *
 * Tests for SEO-related functions:
 * - generateBlogPostMetadata
 * - generatePortfolioMetadata
 * - generateBlogListingMetadata
 * - generatePortfolioListingMetadata
 * - generateBlogPostJsonLd
 * - generatePortfolioJsonLd
 * - generateBreadcrumbJsonLd
 */

import { describe, it, expect } from 'vitest';
import {
  generateBlogPostMetadata,
  generatePortfolioMetadata,
  generateBlogListingMetadata,
  generatePortfolioListingMetadata,
  generateBlogPostJsonLd,
  generatePortfolioJsonLd,
  generateBreadcrumbJsonLd,
} from '../seo';

describe('SEO Utilities', () => {
  const mockPost = {
    id: 'post-1',
    title: 'Test Post Title',
    slug: 'test-post',
    excerpt: 'Test excerpt for the blog post',
    content: 'Full content here',
    status: 'published',
    publishedAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
    seo: {
      metaTitle: 'Custom SEO Title',
      metaDescription: 'Custom SEO Description',
    },
    featuredImage: {
      id: 'img-1',
      url: 'https://example.com/image.jpg',
      alt: 'Featured image alt',
    },
    author: {
      id: 'author-1',
      name: 'John Doe',
      email: 'john@example.com',
    },
    category: 'Technology',
    tags: [{ tag: 'Next.js' }, { tag: 'React' }],
  };

  const mockPortfolio = {
    id: 'portfolio-1',
    title: 'Project Title',
    slug: 'project-slug',
    shortDescription: 'Short project description',
    description: 'Full project description',
    status: 'published',
    client: 'Client Name',
    projectUrl: 'https://project.com',
    completedAt: '2024-01-15',
    seo: {
      metaTitle: 'Custom Project Title',
      metaDescription: 'Custom Project Description',
    },
    images: [
      {
        image: {
          id: 'img-1',
          url: 'https://example.com/project-image.jpg',
          alt: 'Project screenshot',
        },
        caption: 'Main screenshot',
      },
    ],
  };

  // ============================================================================
  // BLOG POST METADATA
  // ============================================================================

  describe('generateBlogPostMetadata', () => {
    it('should generate complete metadata for blog post', () => {
      // Act
      const result = generateBlogPostMetadata(mockPost as any);

      // Assert
      expect(result.title).toContain('Custom SEO Title');
      expect(result.description).toBe('Custom SEO Description');
      expect(result.openGraph).toBeDefined();
      expect(result.openGraph?.title).toBe('Custom SEO Title');
      expect(result.openGraph?.type).toBe('article');
    });

    it('should use fallback values when SEO fields are empty', () => {
      // Arrange
      const postWithoutSeo = {
        ...mockPost,
        seo: {},
      };

      // Act
      const result = generateBlogPostMetadata(postWithoutSeo as any);

      // Assert
      expect(result.title).toContain('Test Post Title');
      expect(result.description).toBe('Test excerpt for the blog post');
    });

    it('should not index unpublished posts', () => {
      // Arrange
      const unpublishedPost = {
        ...mockPost,
        status: 'draft',
      };

      // Act
      const result = generateBlogPostMetadata(unpublishedPost as any);

      // Assert
      expect(result.robots).toEqual({
        index: false,
        follow: false,
      });
    });
  });

  // ============================================================================
  // PORTFOLIO METADATA
  // ============================================================================

  describe('generatePortfolioMetadata', () => {
    it('should generate complete metadata for portfolio project', () => {
      // Act
      const result = generatePortfolioMetadata(mockPortfolio as any);

      // Assert
      expect(result.title).toContain('Custom Project Title');
      expect(result.description).toBe('Custom Project Description');
      expect(result.openGraph?.images).toBeDefined();
    });

    it('should use fallback values when SEO fields are empty', () => {
      // Arrange
      const portfolioWithoutSeo = {
        ...mockPortfolio,
        seo: {},
      };

      // Act
      const result = generatePortfolioMetadata(portfolioWithoutSeo as any);

      // Assert
      expect(result.title).toContain('Project Title');
      expect(result.description).toBe('Short project description');
    });
  });

  // ============================================================================
  // LISTING METADATA
  // ============================================================================

  describe('generateBlogListingMetadata', () => {
    it('should generate metadata for blog listing page', () => {
      // Act
      const result = generateBlogListingMetadata();

      // Assert
      expect(result.title).toContain('Blog');
      expect(result.openGraph?.type).toBe('website');
    });

    it('should include page number in title', () => {
      // Act
      const result = generateBlogListingMetadata(2);

      // Assert
      expect(result.title).toContain('Página 2');
    });

    it('should include category in title', () => {
      // Act
      const result = generateBlogListingMetadata(1, 'Technology');

      // Assert
      expect(result.title).toContain('Technology');
    });
  });

  describe('generatePortfolioListingMetadata', () => {
    it('should generate metadata for portfolio listing page', () => {
      // Act
      const result = generatePortfolioListingMetadata();

      // Assert
      expect(result.title).toContain('Portfólio');
      expect(result.description).toContain('Projetos');
    });

    it('should include category in title', () => {
      // Act
      const result = generatePortfolioListingMetadata('E-commerce');

      // Assert
      expect(result.title).toContain('E-commerce');
    });
  });

  // ============================================================================
  // JSON-LD STRUCTURED DATA
  // ============================================================================

  describe('generateBlogPostJsonLd', () => {
    it('should generate valid BlogPosting schema', () => {
      // Act
      const result = generateBlogPostJsonLd(mockPost as any);

      // Assert
      expect(result['@context']).toBe('https://schema.org');
      expect(result['@type']).toBe('BlogPosting');
      expect(result.headline).toBe('Test Post Title');
      expect(result.author).toBeDefined();
      expect(result.publisher).toBeDefined();
    });

    it('should include keywords from tags', () => {
      // Act
      const result = generateBlogPostJsonLd(mockPost as any);

      // Assert
      expect(result.keywords).toBe('Next.js, React');
    });
  });

  describe('generatePortfolioJsonLd', () => {
    it('should generate valid CreativeWork schema', () => {
      // Act
      const result = generatePortfolioJsonLd(mockPortfolio as any);

      // Assert
      expect(result['@context']).toBe('https://schema.org');
      expect(result['@type']).toBe('CreativeWork');
      expect(result.name).toBe('Project Title');
      expect(result.creator).toBeDefined();
    });

    it('should include client information', () => {
      // Act
      const result = generatePortfolioJsonLd(mockPortfolio as any);

      // Assert
      expect(result.client).toEqual({
        '@type': 'Organization',
        name: 'Client Name',
      });
    });
  });

  describe('generateBreadcrumbJsonLd', () => {
    it('should generate valid BreadcrumbList schema', () => {
      // Arrange
      const items = [
        { name: 'Home', url: 'https://example.com' },
        { name: 'Blog', url: 'https://example.com/blog' },
        { name: 'Post Title', url: 'https://example.com/blog/post' },
      ];

      // Act
      const result = generateBreadcrumbJsonLd(items);

      // Assert
      expect(result['@context']).toBe('https://schema.org');
      expect(result['@type']).toBe('BreadcrumbList');
      expect(result.itemListElement).toHaveLength(3);
      expect(result.itemListElement[0]).toEqual({
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://example.com',
      });
    });
  });
});
