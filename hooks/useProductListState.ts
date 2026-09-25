import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { buildProductListQuery, parseProductListParams } from '@/lib/urlParams';
import { ProductListState } from '@/types';

/**
 * The URL is the single source of truth for list state (requirement #6).
 * This hook reads it (through the normalizer, so malformed values are
 * already safe) and exposes an `update` function that writes back to the
 * URL via router.replace - never local React state for these fields. That
 * means there's exactly one place a page/search/filter/sort value lives,
 * so it can't drift out of sync with what's shown in the address bar.
 */
export function useProductListState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const state = useMemo(() => parseProductListParams(searchParams), [searchParams]);

  const update = useCallback(
    (patch: Partial<ProductListState>, options?: { resetPage?: boolean }) => {
      const next: ProductListState = {
        ...state,
        ...patch,
        page: options?.resetPage ? 1 : patch.page ?? state.page,
      };
      router.replace(`${pathname}${buildProductListQuery(next)}`, { scroll: false });
    },
    [router, pathname, state]
  );

  return { state, update };
}
