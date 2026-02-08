'use client';

/**
 * Indicador de digitação animado (três pontos)
 */
export function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 bg-dark-bg-secondary rounded-2xl px-4 py-3 border-2 border-neutral-gray/10 max-w-[200px]">
      <span className="text-sm text-neutral-gray">Digitando</span>
      <div className="flex gap-1">
        <span
          className="w-1.5 h-1.5 bg-accent-primary rounded-full animate-bounce"
          style={{ animationDelay: '0ms' }}
        />
        <span
          className="w-1.5 h-1.5 bg-accent-primary rounded-full animate-bounce"
          style={{ animationDelay: '150ms' }}
        />
        <span
          className="w-1.5 h-1.5 bg-accent-primary rounded-full animate-bounce"
          style={{ animationDelay: '300ms' }}
        />
      </div>
    </div>
  );
}
