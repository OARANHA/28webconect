'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

/**
 * Componente reutilizável para renderizar conteúdo Markdown
 * Com suporte a GitHub Flavored Markdown (tabelas, task lists, strikethrough)
 * Estilizado para dark theme
 */
export default function MarkdownContent({ content, className }: MarkdownContentProps) {
  return (
    <div
      className={cn(
        'prose prose-invert prose-sm max-w-none',
        // Headings
        'prose-headings:text-neutral-white prose-headings:font-semibold',
        'prose-h1:text-lg prose-h2:text-base prose-h3:text-sm',
        // Links
        'prose-a:text-accent-primary prose-a:no-underline hover:prose-a:underline',
        // Code
        'prose-code:bg-neutral-gray/20 prose-code:text-accent-secondary prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs',
        'prose-pre:bg-dark-bg-primary prose-pre:border prose-pre:border-neutral-gray/10 prose-pre:rounded-lg prose-pre:p-3',
        // Blockquotes
        'prose-blockquote:border-l-4 prose-blockquote:border-accent-primary/50 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-neutral-gray',
        // Lists
        'prose-ul:list-disc prose-ul:ml-4 prose-ol:list-decimal prose-ol:ml-4',
        'prose-li:marker:text-neutral-gray',
        // Tables
        'prose-table:border-collapse prose-table:w-full',
        'prose-th:border prose-th:border-neutral-gray/20 prose-th:p-2 prose-th:bg-dark-bg-primary prose-th:text-neutral-white prose-th:font-semibold',
        'prose-td:border prose-td:border-neutral-gray/20 prose-td:p-2 prose-td:text-neutral-gray',
        // Paragraphs
        'prose-p:text-neutral-gray prose-p:leading-relaxed',
        // Strikethrough
        'prose-del:text-neutral-gray/60',
        // Horizontal rule
        'prose-hr:border-neutral-gray/20',
        className
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
