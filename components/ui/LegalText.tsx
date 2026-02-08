'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LegalTextProps {
  children: React.ReactNode;
  className?: string;
}

interface LegalSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  index?: number;
}

interface LegalSubsectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

interface LegalListProps {
  children: React.ReactNode;
  ordered?: boolean;
  className?: string;
}

interface LegalListItemProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Componente base para formatação de textos legais
 */
export function LegalText({ children, className }: LegalTextProps) {
  return <div className={cn('space-y-8', className)}>{children}</div>;
}

/**
 * Seção principal de documento legal (H2)
 */
export function LegalSection({ title, children, className, index }: LegalSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: (index || 0) * 0.1 }}
      className={cn('border-b border-dashed border-neutral-gray/20 pb-8 last:border-0', className)}
    >
      <h2 className="text-2xl md:text-3xl font-bold text-neutral-white mb-4 flex items-center gap-3">
        <span className="w-8 h-8 bg-accent-primary/20 rounded-lg flex items-center justify-center text-accent-primary text-lg">
          {index || '•'}
        </span>
        {title}
      </h2>
      <div className="text-neutral-gray leading-relaxed">{children}</div>
    </motion.section>
  );
}

/**
 * Subseção de documento legal (H3)
 */
export function LegalSubsection({ title, children, className }: LegalSubsectionProps) {
  return (
    <div className={cn('mt-6 mb-4', className)}>
      <h3 className="text-lg md:text-xl font-semibold text-accent-primary mb-3">{title}</h3>
      <div className="text-neutral-gray">{children}</div>
    </div>
  );
}

/**
 * Lista de itens legais (ul ou ol)
 */
export function LegalList({ children, ordered = false, className }: LegalListProps) {
  const ListTag = ordered ? 'ol' : 'ul';

  return (
    <ListTag
      className={cn(
        'space-y-2 my-4',
        ordered ? 'list-decimal list-inside' : 'list-none',
        className
      )}
    >
      {children}
    </ListTag>
  );
}

/**
 * Item de lista legal
 */
export function LegalListItem({ children, className }: LegalListItemProps) {
  return (
    <motion.li
      whileHover={{ x: 4 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex items-start gap-3 text-neutral-gray',
        'pl-4 border-l-2 border-accent-primary/30 hover:border-accent-primary',
        'transition-colors duration-200',
        className
      )}
    >
      <span className="w-1.5 h-1.5 bg-accent-primary rounded-full mt-2 flex-shrink-0" />
      <span>{children}</span>
    </motion.li>
  );
}

/**
 * Parágrafo de texto legal
 */
export function LegalParagraph({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={cn('mb-4 text-neutral-gray leading-relaxed', className)}>{children}</p>;
}

/**
 * Destaque de texto legal (importante)
 */
export function LegalHighlight({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'bg-accent-primary/10 border-l-4 border-accent-primary p-4 rounded-r-lg my-6',
        className
      )}
    >
      <p className="text-neutral-light font-medium">{children}</p>
    </div>
  );
}

/**
 * Tabela de informações legais
 */
export function LegalTable({
  headers,
  rows,
  className,
}: {
  headers: string[];
  rows: (string | React.ReactNode)[][];
  className?: string;
}) {
  return (
    <div className={cn('overflow-x-auto my-6', className)}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-accent-primary/30">
            {headers.map((header, i) => (
              <th
                key={i}
                className="text-left py-3 px-4 text-neutral-white font-semibold bg-dark-bg-secondary"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-b border-neutral-gray/10 hover:bg-dark-bg-secondary/50 transition-colors"
            >
              {row.map((cell, j) => (
                <td key={j} className="py-3 px-4 text-neutral-gray text-sm">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
