'use client';

import { useEffect, useState } from 'react';
import { Category, ProductListState, SortOption } from '@/types';
import { PAGE_SIZE_OPTIONS, SORT_OPTIONS } from '@/lib/constants';
import { useDebounce } from '@/hooks/useDebounce';
import { Select } from '@/components/ui/Select';

interface ProductFiltersProps {
  state: ProductListState;
  categories: Category[];
  onChange: (patch: Partial<ProductListState>, options?: { resetPage?: boolean }) => void;
}

export function ProductFilters({ state, categories, onChange }: ProductFiltersProps) {
  // Local, un-debounced input value so typing feels instant, while the
  // actual fetch waits for the debounced value (requirement #7).
  const [searchInput, setSearchInput] = useState(state.search);
  const debouncedSearch = useDebounce(searchInput, 400);

  useEffect(() => {
    setSearchInput(state.search);
    // Only re-sync from the URL (e.g. back/forward navigation) - not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.search]);

  useEffect(() => {
    if (debouncedSearch !== state.search) {
      onChange({ search: debouncedSearch }, { resetPage: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const searchActive = debouncedSearch.trim().length > 0;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:flex-wrap">
        <div className="flex min-w-[220px] flex-1 flex-col gap-1.5">
          <label htmlFor="search" className="text-sm font-medium text-ink-700">
            Search
          </label>
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
            <input
              id="search"
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products…"
              className="w-full rounded-md border border-border bg-surface py-2 pl-9 pr-3 text-sm text-ink-900 placeholder:text-ink-300 focus-visible:border-accent"
            />
          </div>
        </div>

        <Select
          label="Category"
          value={state.category}
          disabled={searchActive}
          onChange={(e) => onChange({ category: e.target.value }, { resetPage: true })}
          options={[
            { value: '', label: 'All Categories' },
            ...categories.map((c) => ({ value: c.slug, label: c.name })),
          ]}
          hint={searchActive ? 'Disabled while searching' : undefined}
        />

        <Select
          label="Sort by"
          value={state.sort}
          onChange={(e) => onChange({ sort: e.target.value as SortOption })}
          options={SORT_OPTIONS}
        />

        <Select
          label="Per page"
          value={String(state.limit)}
          onChange={(e) => onChange({ limit: Number(e.target.value) }, { resetPage: true })}
          options={PAGE_SIZE_OPTIONS.map((n) => ({ value: String(n), label: `${n} / page` }))}
        />
      </div>

      {searchActive && (
        <p className="text-xs text-ink-500">
          Searching for <span className="font-medium text-ink-700">&ldquo;{debouncedSearch}&rdquo;</span> across all
          categories. Clear the search to filter by category again.
        </p>
      )}
    </div>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
      <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
