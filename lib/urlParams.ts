import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  DEFAULT_SORT,
  PAGE_SIZE_OPTIONS,
  VALID_SORTS,
} from './constants';
import { ProductListState, SortOption } from '@/types';

/**
 * Why this file exists: requirement #19 says the app must never crash or
 * misbehave for malformed URLs like ?page=abc or ?limit=hello. Rather than
 * scattering defensive checks across components, every raw search param is
 * funneled through this single normalizer. Components only ever see clean,
 * safe values - they never read `searchParams` directly.
 */

function normalizePage(raw: string | null): number {
  const n = Number(raw);
  if (!raw || Number.isNaN(n) || !Number.isInteger(n) || n < 1) {
    return DEFAULT_PAGE;
  }
  // Deliberately no upper clamp here (e.g. page=999999): we let the fetch
  // layer request it, get an empty result, and show the "no products"
  // empty state rather than guessing at a "real" last page. This avoids
  // silently rewriting a page number the user may have bookmarked once
  // the catalog grows back to that size.
  return n;
}

function normalizeLimit(raw: string | null): number {
  const n = Number(raw);
  if (!raw || Number.isNaN(n) || !PAGE_SIZE_OPTIONS.includes(n as any)) {
    return DEFAULT_PAGE_SIZE;
  }
  return n;
}

function normalizeSort(raw: string | null): SortOption {
  if (!raw || !VALID_SORTS.includes(raw)) return DEFAULT_SORT as SortOption;
  return raw as SortOption;
}

function normalizeText(raw: string | null): string {
  if (!raw) return '';
  return raw.trim().slice(0, 200); // guard against absurd query strings
}

export function parseProductListParams(
  searchParams: URLSearchParams
): ProductListState {
  return {
    page: normalizePage(searchParams.get('page')),
    limit: normalizeLimit(searchParams.get('limit')),
    search: normalizeText(searchParams.get('search')),
    category: normalizeText(searchParams.get('category')),
    sort: normalizeSort(searchParams.get('sort')),
  };
}

/**
 * Builds a clean query string from state, omitting keys at their default
 * value so URLs stay tidy (e.g. /products instead of
 * /products?page=1&limit=10&search=&category=&sort=default).
 */
export function buildProductListQuery(state: ProductListState): string {
  const params = new URLSearchParams();
  if (state.page !== DEFAULT_PAGE) params.set('page', String(state.page));
  if (state.limit !== DEFAULT_PAGE_SIZE)
    params.set('limit', String(state.limit));
  if (state.search) params.set('search', state.search);
  if (state.category) params.set('category', state.category);
  if (state.sort !== DEFAULT_SORT) params.set('sort', state.sort);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}
