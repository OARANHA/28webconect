import type { MDXComponents } from 'mdx/types';
import { cn } from '@/lib/utils';

/**
 * Componentes customizados para MDX
 * Aplica estilos consistentes com o dark theme
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Headings
    h1: ({ className, ...props }) => (
      <h1
        className={cn('text-4xl md:text-5xl font-bold text-neutral-white mb-6', className)}
        {...props}
      />
    ),
    h2: ({ className, ...props }) => (
      <h2
        className={cn('text-3xl md:text-4xl font-bold text-neutral-white mt-12 mb-4', className)}
        {...props}
      />
    ),
    h3: ({ className, ...props }) => (
      <h3
        className={cn('text-2xl md:text-3xl font-semibold text-neutral-white mt-8 mb-3', className)}
        {...props}
      />
    ),

    // Paragraph
    p: ({ className, ...props }) => (
      <p className={cn('text-neutral-gray leading-relaxed mb-4', className)} {...props} />
    ),

    // Lists
    ul: ({ className, ...props }) => (
      <ul
        className={cn('list-disc list-inside text-neutral-gray space-y-2 mb-6 ml-4', className)}
        {...props}
      />
    ),
    ol: ({ className, ...props }) => (
      <ol
        className={cn('list-decimal list-inside text-neutral-gray space-y-2 mb-6 ml-4', className)}
        {...props}
      />
    ),
    li: ({ className, ...props }) => <li className={cn('leading-relaxed', className)} {...props} />,

    // Links
    a: ({ className, ...props }) => (
      <a
        className={cn(
          'text-accent-primary hover:text-accent-secondary underline transition-colors',
          className
        )}
        {...props}
      />
    ),

    // Blockquote
    blockquote: ({ className, ...props }) => (
      <blockquote
        className={cn(
          'border-l-4 border-accent-primary pl-4 my-6 italic text-neutral-gray',
          className
        )}
        {...props}
      />
    ),

    // Code
    code: ({ className, ...props }) => (
      <code
        className={cn(
          'bg-dark-bg-secondary text-accent-primary px-2 py-1 rounded text-sm font-mono',
          className
        )}
        {...props}
      />
    ),
    pre: ({ className, ...props }) => (
      <pre
        className={cn('bg-dark-bg-secondary p-4 rounded-lg overflow-x-auto my-6', className)}
        {...props}
      />
    ),

    // Horizontal rule
    hr: ({ className, ...props }) => (
      <hr className={cn('border-neutral-gray/20 my-8', className)} {...props} />
    ),

    // Strong
    strong: ({ className, ...props }) => (
      <strong className={cn('text-neutral-white font-semibold', className)} {...props} />
    ),

    // Emphasis
    em: ({ className, ...props }) => (
      <em className={cn('italic text-neutral-gray', className)} {...props} />
    ),

    ...components,
  };
}
