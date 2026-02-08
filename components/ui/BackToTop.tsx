'use client';

interface BackToTopProps {
  className?: string;
}

export default function BackToTop({ className = '' }: BackToTopProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`w-12 h-12 bg-accent-primary hover:bg-accent-secondary text-white rounded-full shadow-lg flex items-center justify-center transition-colors ${className}`}
      aria-label="Voltar ao topo"
    >
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
    </button>
  );
}
