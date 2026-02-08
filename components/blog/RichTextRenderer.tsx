'use client';

import { cn } from '@/lib/utils';
import { RichTextContent } from '@/types/payload';

interface RichTextRendererProps {
  content: RichTextContent;
  className?: string;
}

export default function RichTextRenderer({ content, className }: RichTextRendererProps) {
  if (!content || !Array.isArray(content)) {
    return null;
  }

  const renderNode = (node: any, index: number): React.ReactNode => {
    // Text node
    if (node.text !== undefined) {
      let text = node.text;

      if (node.bold) {
        text = <strong key={index}>{text}</strong>;
      }
      if (node.italic) {
        text = <em key={index}>{text}</em>;
      }
      if (node.underline) {
        text = <u key={index}>{text}</u>;
      }
      if (node.strikethrough) {
        text = <del key={index}>{text}</del>;
      }
      if (node.code) {
        text = (
          <code key={index} className="bg-white/10 px-1.5 py-0.5 rounded text-sm font-mono">
            {text}
          </code>
        );
      }

      return text;
    }

    // Element node
    const children = node.children?.map((child: any, i: number) => renderNode(child, i));

    switch (node.type) {
      case 'h1':
        return (
          <h1 key={index} className="text-4xl font-bold text-white mt-8 mb-4">
            {children}
          </h1>
        );
      case 'h2':
        return (
          <h2 key={index} className="text-3xl font-bold text-white mt-8 mb-4">
            {children}
          </h2>
        );
      case 'h3':
        return (
          <h3 key={index} className="text-2xl font-bold text-white mt-6 mb-3">
            {children}
          </h3>
        );
      case 'h4':
        return (
          <h4 key={index} className="text-xl font-bold text-white mt-6 mb-3">
            {children}
          </h4>
        );
      case 'blockquote':
        return (
          <blockquote
            key={index}
            className="border-l-4 border-[#ff6b35] pl-4 my-6 text-gray-300 italic"
          >
            {children}
          </blockquote>
        );
      case 'ul':
        return (
          <ul key={index} className="list-disc list-inside my-4 space-y-2 text-gray-300">
            {children}
          </ul>
        );
      case 'ol':
        return (
          <ol key={index} className="list-decimal list-inside my-4 space-y-2 text-gray-300">
            {children}
          </ol>
        );
      case 'li':
        return <li key={index}>{children}</li>;
      case 'link':
        return (
          <a
            key={index}
            href={node.url}
            className="text-[#ff6b35] hover:underline"
            target={node.url?.startsWith('http') ? '_blank' : undefined}
            rel={node.url?.startsWith('http') ? 'noopener noreferrer' : undefined}
          >
            {children}
          </a>
        );
      case 'upload':
        if (node.value?.mimeType?.startsWith('image/')) {
          return (
            <figure key={index} className="my-8">
              <img src={node.value.url} alt={node.value.alt || ''} className="rounded-lg w-full" />
              {node.value.caption && (
                <figcaption className="text-center text-sm text-gray-500 mt-2">
                  {node.value.caption}
                </figcaption>
              )}
            </figure>
          );
        }
        return null;
      case 'code':
        return (
          <pre
            key={index}
            className="bg-[#1a1a1a] border border-white/10 rounded-lg p-4 my-6 overflow-x-auto"
          >
            <code className="text-sm font-mono text-gray-300">{children}</code>
          </pre>
        );
      default:
        return (
          <p key={index} className="text-gray-300 leading-relaxed mb-4">
            {children}
          </p>
        );
    }
  };

  return (
    <div className={cn('rich-text-content', className)}>
      {content.map((node, index) => renderNode(node, index))}
    </div>
  );
}
