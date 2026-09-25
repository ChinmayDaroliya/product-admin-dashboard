'use client';

import { PaginationInfo } from '@/types';
import { getPageNumbers } from '@/lib/pagination';

interface PaginationProps {
  info: PaginationInfo;
  onPageChange: (page: number) => void;
}

export function Pagination({ info, onPageChange }: PaginationProps) {
  const { page, totalPages, total, startIndex, endIndex } = info;
  const pages = getPageNumbers(page, totalPages);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 sm:flex-row">
      <p className="text-sm text-ink-500">
        {total === 0 ? (
          'No results'
        ) : (
          <>
            Showing <span className="font-medium text-ink-700">{startIndex}–{endIndex}</span> of{' '}
            <span className="font-medium text-ink-700">{total}</span>
          </>
        )}
      </p>

      {totalPages > 1 && (
        <nav aria-label="Pagination" className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="rounded-md px-2.5 py-1.5 text-sm text-ink-700 hover:bg-bg disabled:text-ink-300"
          >
            Previous
          </button>

          {pages.map((p, i) =>
            p === '...' ? (
              <span key={`ellipsis-${i}`} className="px-2 text-sm text-ink-300">
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                aria-current={p === page ? 'page' : undefined}
                className={`min-w-[32px] rounded-md px-2.5 py-1.5 text-sm ${
                  p === page
                    ? 'bg-accent text-white'
                    : 'text-ink-700 hover:bg-bg'
                }`}
              >
                {p}
              </button>
            )
          )}

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="rounded-md px-2.5 py-1.5 text-sm text-ink-700 hover:bg-bg disabled:text-ink-300"
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
}
