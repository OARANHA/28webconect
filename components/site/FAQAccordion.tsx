'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

interface FAQAccordionProps {
  faqs: FAQ[];
}

/**
 * Accordion interativo para perguntas frequentes
 */
export default function FAQAccordion({ faqs }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Group FAQs by category
  const groupedFaqs = faqs.reduce(
    (acc, faq) => {
      if (!acc[faq.category]) {
        acc[faq.category] = [];
      }
      acc[faq.category].push(faq);
      return acc;
    },
    {} as Record<string, FAQ[]>
  );

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  let globalIndex = 0;

  return (
    <div className="space-y-8">
      {Object.entries(groupedFaqs).map(([category, categoryFaqs]) => (
        <div key={category}>
          <h3 className="text-xl font-semibold text-neutral-white mb-4">{category}</h3>
          <div className="space-y-3">
            {categoryFaqs.map((faq) => {
              const currentIndex = globalIndex++;
              const isOpen = openIndex === currentIndex;

              return (
                <div
                  key={currentIndex}
                  className={cn(
                    'border-2 rounded-xl overflow-hidden transition-colors duration-200',
                    isOpen
                      ? 'border-accent-primary/50 bg-accent-primary/5'
                      : 'border-neutral-gray/10 hover:border-accent-primary/30'
                  )}
                >
                  <button
                    onClick={() => toggleItem(currentIndex)}
                    className="w-full flex items-center justify-between p-4 md:p-6 text-left"
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${currentIndex}`}
                  >
                    <span className="font-medium text-neutral-white pr-4">{faq.question}</span>
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex-shrink-0 text-accent-primary"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`faq-answer-${currentIndex}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="px-4 pb-4 md:px-6 md:pb-6">
                          <p className="text-neutral-gray leading-relaxed">{faq.answer}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
