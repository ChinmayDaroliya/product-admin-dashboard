'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Product, ProductListResponse } from '@/types';

/**
 * DummyJSON's add/edit/delete endpoints are simulated: they return a
 * plausible response but never actually change server-side data (see
 * README > CRUD Persistence Limitation). This store is the single place
 * that compensates for that, so the rest of the app can treat products as
 * if writes really landed.
 *
 * Strategy: keep three small overlays in memory (added / edited / deleted)
 * and apply them to whatever the API returns before it reaches the UI.
 * Overlays live in sessionStorage so a refresh during the same browser
 * session doesn't lose the illusion of persistence - closing the tab does,
 * which matches "current session" in the assignment brief.
 */

interface ProductStoreValue {
  applyOverlay: (response: ProductListResponse, page: number) => ProductListResponse;
  applyOverlayToOne: (product: Product) => Product;
  recordAdd: (product: Product) => void;
  recordEdit: (id: number, patch: Partial<Product>) => void;
  recordDelete: (id: number) => void;
  getEditedOrAdded: (id: number) => Product | undefined;
  isLocalOnlyProduct: (id: number) => boolean;
}

const ProductStoreContext = createContext<ProductStoreValue | undefined>(undefined);

const STORAGE_KEY = 'pad_product_overlay';

interface OverlayState {
  added: Product[];
  edited: Record<number, Partial<Product>>;
  deleted: number[];
}

function loadOverlay(): OverlayState {
  if (typeof window === 'undefined') return { added: [], edited: {}, deleted: [] };
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return { added: [], edited: {}, deleted: [] };
    return JSON.parse(raw);
  } catch {
    return { added: [], edited: {}, deleted: [] };
  }
}

function saveOverlay(state: OverlayState) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function ProductStoreProvider({ children }: { children: React.ReactNode }) {
  const [overlay, setOverlay] = useState<OverlayState>(() => loadOverlay());

  const persist = useCallback((next: OverlayState) => {
    setOverlay(next);
    saveOverlay(next);
  }, []);

  const recordAdd = useCallback(
    (product: Product) => {
      persist({ ...overlay, added: [product, ...overlay.added] });
    },
    [overlay, persist]
  );

  const recordEdit = useCallback(
    (id: number, patch: Partial<Product>) => {
      persist({
        ...overlay,
        edited: { ...overlay.edited, [id]: { ...overlay.edited[id], ...patch } },
      });
    },
    [overlay, persist]
  );

  const recordDelete = useCallback(
    (id: number) => {
      persist({
        ...overlay,
        deleted: [...overlay.deleted, id],
        added: overlay.added.filter((p) => p.id !== id),
      });
    },
    [overlay, persist]
  );

  const mergeEdit = useCallback(
    (product: Product): Product => {
      const patch = overlay.edited[product.id];
      return patch ? { ...product, ...patch } : product;
    },
    [overlay]
  );

  const applyOverlayToOne = useCallback(
    (product: Product): Product => mergeEdit(product),
    [mergeEdit]
  );

  const getEditedOrAdded = useCallback(
    (id: number): Product | undefined => {
      const added = overlay.added.find((p) => p.id === id);
      if (added) return mergeEdit(added);
      return undefined;
    },
    [overlay, mergeEdit]
  );

  const isLocalOnlyProduct = useCallback(
    (id: number): boolean => overlay.added.some((product) => product.id === id),
    [overlay]
  );

  const applyOverlay = useCallback(
    (response: ProductListResponse, page: number): ProductListResponse => {
      const deletedSet = new Set(overlay.deleted);
      let products = response.products
        .filter((p) => !deletedSet.has(p.id))
        .map(mergeEdit);

      // Local deletions are session-only and should not shrink the underlying
      // catalog total. Doing so causes page counts to collapse even though the
      // backend never mutated this item. We still filter the deleted ids out of
      // the current page so the user doesn't see removed products.
      let total = response.total;

      // Locally-added products are session-only fabrications, so we only
      // surface them on page 1 of the unfiltered/default view - injecting
      // them into arbitrary pages would make the skip/limit math lie.
      if (page === 1 && overlay.added.length > 0) {
        products = [...overlay.added.map(mergeEdit), ...products];
        total += overlay.added.length;
      }

      return { ...response, products, total };
    },
    [overlay, mergeEdit]
  );

  const value = useMemo(
    () => ({
      applyOverlay,
      applyOverlayToOne,
      recordAdd,
      recordEdit,
      recordDelete,
      getEditedOrAdded,
      isLocalOnlyProduct,
    }),
    [applyOverlay, applyOverlayToOne, recordAdd, recordEdit, recordDelete, getEditedOrAdded, isLocalOnlyProduct]
  );

  return (
    <ProductStoreContext.Provider value={value}>{children}</ProductStoreContext.Provider>
  );
}

export function useProductStore() {
  const ctx = useContext(ProductStoreContext);
  if (!ctx) throw new Error('useProductStore must be used within ProductStoreProvider');
  return ctx;
}
