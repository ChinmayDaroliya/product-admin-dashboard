import { PaginationInfo } from '@/types';

export function computePagination(page: number, limit: number, total: number): PaginationInfo {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);
  const startIndex = total === 0 ? 0 : (safePage - 1) * limit + 1;
  const endIndex = total === 0 ? 0 : Math.min(safePage * limit, total);
  return { page: safePage, limit, total, totalPages, startIndex, endIndex };
}

/**
 * Builds a compact page-number list with ellipses, e.g.
 * [1, '...', 4, 5, 6, '...', 20] instead of rendering every page button.
 */
export function getPageNumbers(current: number, totalPages: number): (number | '...')[] {
  const delta = 1;
  const range: (number | '...')[] = [];
  const left = Math.max(2, current - delta);
  const right = Math.min(totalPages - 1, current + delta);

  range.push(1);
  if (left > 2) range.push('...');
  for (let i = left; i <= right; i++) range.push(i);
  if (right < totalPages - 1) range.push('...');
  if (totalPages > 1) range.push(totalPages);

  return range;
}
