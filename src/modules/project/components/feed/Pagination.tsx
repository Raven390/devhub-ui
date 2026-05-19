import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  isLoading: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export const Pagination = ({
  page,
  totalPages,
  isLoading,
  onPrevious,
  onNext,
}: PaginationProps) => {
  const canGoBack = page > 0 && !isLoading;
  const canGoForward = page + 1 < totalPages && !isLoading;

  return (
    <nav className="mt-6 flex items-center justify-center gap-5" aria-label="Пагинация проектов">
      <button
        type="button"
        disabled={!canGoBack}
        onClick={onPrevious}
        className="inline-flex min-h-8 items-center gap-1.5 rounded-md border-0 bg-transparent px-2.5 py-1.5 text-[13px] font-normal text-[var(--text-secondary)] transition duration-200 hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/25"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Предыдущая
      </button>

      <span className="text-[13px] text-[var(--text-muted)]">
        Страница {page + 1} из {totalPages}
      </span>

      <button
        type="button"
        disabled={!canGoForward}
        onClick={onNext}
        className="inline-flex min-h-8 items-center gap-1.5 rounded-md border-0 bg-transparent px-2.5 py-1.5 text-[13px] font-normal text-[var(--text-secondary)] transition duration-200 hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/25"
      >
        Следующая
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </nav>
  );
};
