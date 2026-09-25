export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://dummyjson.com';

export const AUTH_COOKIE_NAME = 'pad_token';

export const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE = 1;
export const DEFAULT_SORT = 'default';

export const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating-asc', label: 'Rating: Low to High' },
  { value: 'rating-desc', label: 'Rating: High to Low' },
  { value: 'title-asc', label: 'Title: A to Z' },
  { value: 'title-desc', label: 'Title: Z to A' },
];

export const VALID_SORTS = SORT_OPTIONS.map((s) => s.value);

export const SEARCH_DEBOUNCE_MS = 400;
