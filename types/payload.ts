import { Post, Portfolio, Media, User } from '../payload-types';

// Re-export generated types
export type { Post, Portfolio, Media, User };

// Post status types
export type PostStatus = 'draft' | 'published' | 'archived';

// Project category types
export type ProjectCategory =
  | 'erp'
  | 'ecommerce'
  | 'landing-page'
  | 'sistema-customizado'
  | 'app-mobile'
  | 'integracao';

// Blog category types
export type BlogCategory = 'tecnologia' | 'negocios' | 'tutoriais' | 'novidades' | 'cases';

// SEO Group type
export interface SEOGroup {
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string | Media;
}

// Extended Post type with typed fields
export interface PostWithAuthor extends Omit<Post, 'author'> {
  author?: User | null;
}

// Extended Portfolio type with typed fields
export interface PortfolioWithImages extends Omit<Portfolio, 'images'> {
  images?: Array<{
    image: Media;
    caption?: string;
    id?: string;
  }>;
}

// Payload API Response types
export interface PaginatedResponse<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

// RichText content type
export interface RichTextNode {
  type?: string;
  text?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  children?: RichTextNode[];
  url?: string;
  [key: string]: unknown;
}

export type RichTextContent = RichTextNode[];
