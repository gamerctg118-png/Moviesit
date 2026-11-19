import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationBarProps {
  page: number;
  totalPages: number;
  onPageChange: (nextPage: number) => void;
  loading?: boolean;
}

export function PaginationBar({
  page,
  totalPages,
  onPageChange,
  loading = false,
}: PaginationBarProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Pagination"
      className="mt-8 flex items-center justify-between gap-4 border-t border-zinc-800/80 pt-6"
    >
      <button
        type="button"
        disabled={page <= 1 || loading}
        onClick={() => onPageChange(page - 1)}
        className="flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded-lg border border-zinc-800 bg-zinc-950 px-4 text-sm font-medium text-zinc-200 transition-colors hover:border-zinc-700 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e50914]"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        <span>Previous</span>
      </button>

      <span className="text-xs font-medium text-zinc-400 tabular-nums sm:text-sm">
        Page {page} of {totalPages}
      </span>

      <button
        type="button"
        disabled={page >= totalPages || loading}
        onClick={() => onPageChange(page + 1)}
        className="flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded-lg border border-zinc-800 bg-zinc-950 px-4 text-sm font-medium text-zinc-200 transition-colors hover:border-zinc-700 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e50914]"
      >
        <span>Next</span>
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </nav>
  );
}
