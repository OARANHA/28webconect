'use client';

import { useEffect } from 'react';

interface MetaTagProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
  robots?: string;
}

const DynamicMetaTags: React.FC<MetaTagProps> = ({
  title,
  description,
  keywords,
  canonicalUrl,
  ogTitle,
  ogDescription,
  ogImage,
  twitterCard = 'summary_large_image',
  robots = 'index, follow',
}) => {
  useEffect(() => {
    // Update title
    if (title) {
      document.title = title;
    }

    // Remove existing meta tags
    const existingMetaTags = document.querySelectorAll('meta[data-dynamic]');
    existingMetaTags.forEach(tag => tag.remove());

    // Create and append new meta tags
    const metaTags = [
      { name: 'description', content: description },
      { name: 'keywords', content: keywords },
      { name: 'robots', content: robots },
      { property: 'og:title', content: ogTitle || title },
      { property: 'og:description', content: ogDescription || description },
      { property: 'og:image', content: ogImage },
      { name: 'twitter:card', content: twitterCard },
    ];

    metaTags.forEach(meta => {
      if (meta.content) {
        const tag = document.createElement('meta');
        tag.setAttribute(meta.name ? 'name' : 'property', meta.name || meta.property);
        tag.setAttribute('content', meta.content);
        tag.setAttribute('data-dynamic', 'true');
        document.head.appendChild(tag);
      }
    });

    // Add canonical URL if provided
    if (canonicalUrl) {
      const link = document.createElement('link');
      link.rel = 'canonical';
      link.href = canonicalUrl;
      link.setAttribute('data-dynamic', 'true');
      document.head.appendChild(link);
    }

    // Cleanup function
    return () => {
      const dynamicTags = document.querySelectorAll('[data-dynamic]');
      dynamicTags.forEach(tag => tag.remove());
    };
  }, [title, description, keywords, canonicalUrl, ogTitle, ogDescription, ogImage, twitterCard, robots]);

  return null;
};

export default DynamicMetaTags;