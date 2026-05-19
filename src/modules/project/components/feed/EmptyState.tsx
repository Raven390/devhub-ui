import { SearchX } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({ title, description, actionLabel, onAction }: EmptyStateProps) => (
  <div className="flex min-h-[360px] flex-col items-center justify-center rounded-lg border border-[var(--border-dim)] bg-[var(--bg-elevated)] px-6 text-center">
    <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border-dim)] bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
      <SearchX className="h-5 w-5" aria-hidden="true" />
    </span>
    <h2 className="mt-4 text-[18px] font-medium text-[var(--text-primary)]">{title}</h2>
    <p className="mt-2 max-w-md text-[13px] leading-6 text-[var(--text-secondary)]">
      {description}
    </p>
    {actionLabel && onAction ? (
      <button
        type="button"
        onClick={onAction}
        className="mt-5 inline-flex items-center rounded-md bg-white px-4 py-2 text-[13px] font-medium text-black transition duration-200 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/30"
      >
        {actionLabel}
      </button>
    ) : null}
  </div>
);
