import { useEffect, useRef, useState } from 'react';
import { productApi } from '@/api/productApi';
import { useProductStore } from '@/context/ProductStoreContext';
import { ApiError, Product, ProductListState } from '@/types';

interface UseProductsResult {
  products: Product[];
  total: number;
  isLoading: boolean;
  error: string | null;
  retry: () => void;
}

function sortProducts(products: Product[], sort: ProductListState['sort']): Product[] {
  if (sort === 'default') return products;
  const [field, dir] = sort.split('-') as [
    'price' | 'rating' | 'title',
    'asc' | 'desc'
  ];
  const sorted = [...products].sort((a, b) => {
    const av = a[field];
    const bv = b[field];
    if (typeof av === 'string' && typeof bv === 'string') return av.localeCompare(bv);
    return (av as number) - (bv as number);
  });
  return dir === 'desc' ? sorted.reverse() : sorted;
}

/**
 * Fetches one page of products for the given (already-normalized) list
 * state and keeps it in sync as the state changes.
 *
 * Stale-response protection (requirement #8) is layered two ways:
 *  1. AbortController cancels the in-flight request as soon as a new one
 *     starts, so slow responses (e.g. `&delay=2000`) are cut off at the
 *     network level whenever possible.
 *  2. A monotonically increasing `requestId` ref is the backstop: even if
 *     a cancelled request's promise still resolves (some browsers/axios
 *     versions surface this as a resolved response rather than a thrown
 *     cancel error), we compare the id captured at request-start time
 *     against the latest id before committing the response to state. An
 *     older response is silently discarded.
 */
export function useProducts(state: ProductListState): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  const requestIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const { applyOverlay } = useProductStore();

  useEffect(() => {
    const thisRequestId = ++requestIdRef.current;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);

    const fillCurrentPage = async (): Promise<{ products: Product[]; total: number }> => {
      const skip = (state.page - 1) * state.limit;
      const firstResponse = await productApi.getProducts({
        limit: state.limit,
        skip,
        search: state.search,
        category: state.category,
        signal: controller.signal,
      });

      if (thisRequestId !== requestIdRef.current) return { products: [], total: 0 };

      const firstOverlaid = applyOverlay(firstResponse, state.page);
      const visibleProducts = [...firstOverlaid.products];
      const seenIds = new Set(visibleProducts.map((product) => product.id));
      let nextSkip = skip + state.limit;
      let nextPage = state.page + 1;

      while (visibleProducts.length < state.limit && nextSkip < (firstOverlaid.total ?? 0) + state.limit) {
        const nextResponse = await productApi.getProducts({
          limit: state.limit,
          skip: nextSkip,
          search: state.search,
          category: state.category,
          signal: controller.signal,
        });

        if (thisRequestId !== requestIdRef.current) return { products: [], total: 0 };

        const nextOverlaid = applyOverlay(nextResponse, nextPage);

        for (const product of nextOverlaid.products) {
          if (seenIds.has(product.id)) continue;
          visibleProducts.push(product);
          seenIds.add(product.id);
          if (visibleProducts.length >= state.limit) break;
        }

        if (nextOverlaid.products.length === 0) break;
        nextSkip += state.limit;
        nextPage += 1;
      }

      return { products: visibleProducts, total: firstOverlaid.total };
    };

    fillCurrentPage()
      .then((result) => {
        if (thisRequestId !== requestIdRef.current) return; // stale, ignore
        setProducts(sortProducts(result.products, state.sort));
        setTotal(result.total);
        setIsLoading(false);
      })
      .catch((err: ApiError) => {
        if (thisRequestId !== requestIdRef.current) return; // stale, ignore
        if (err.message === 'Request cancelled.') return; // expected on rapid typing
        setError(err.message);
        setIsLoading(false);
      });

    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.page, state.limit, state.search, state.category, state.sort, retryToken]);

  return {
    products,
    total,
    isLoading,
    error,
    retry: () => setRetryToken((t) => t + 1),
  };
}
