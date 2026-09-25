'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useProductListState } from '@/hooks/useProductListState';
import { useProducts } from '@/hooks/useProducts';
import { useProductStore } from '@/context/ProductStoreContext';
import { useToast } from '@/context/ToastContext';
import { productApi } from '@/api/productApi';
import { computePagination } from '@/lib/pagination';
import { Category, Product } from '@/types';
import { ApiError } from '@/types';

import { ProductFilters } from '@/components/products/ProductFilters';
import { ProductStats } from '@/components/products/ProductStats';
import { ProductTable } from '@/components/products/ProductTable';
import { ProductCardList } from '@/components/products/ProductCardList';
import { Pagination } from '@/components/products/Pagination';
import { EmptyState } from '@/components/products/EmptyState';
import { ErrorState } from '@/components/products/ErrorState';
import { TableSkeleton, CardListSkeleton } from '@/components/products/Skeletons';
import { DeleteConfirmModal } from '@/components/products/DeleteConfirmModal';
import { Button } from '@/components/ui/Button';

export default function ProductsPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <ProductsPageContent />
    </Suspense>
  );
}

function ProductsPageContent() {
  const { state, update } = useProductListState();
  const { products, total, isLoading, error, retry } = useProducts(state);
  const { recordDelete } = useProductStore();
  const { showToast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    productApi
      .getCategories(controller.signal)
      .then(setCategories)
      .catch(() => {
        /* Category dropdown just stays empty; not critical enough for a page-level error. */
      });
    return () => controller.abort();
  }, []);

  const pagination = computePagination(state.page, state.limit, total);

  async function handleConfirmDelete() {
    if (!deleteTarget || isDeleting) return;
    setIsDeleting(true);
    try {
      await productApi.deleteProduct(deleteTarget.id);
      recordDelete(deleteTarget.id);
      showToast(`"${deleteTarget.title}" was deleted.`, 'success');
      setDeleteTarget(null);
      retry();
    } catch (err) {
      showToast((err as ApiError).message, 'error');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink-900">Products</h1>
          <p className="mt-1 text-sm text-ink-500">Manage your product catalog.</p>
        </div>
        <Link href="/products/add">
          <Button>+ Add Product</Button>
        </Link>
      </div>

      <ProductStats products={products} total={total} />

      <ProductFilters state={state} categories={categories} onChange={update} />

      {error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : isLoading ? (
        <>
          <TableSkeleton />
          <CardListSkeleton />
        </>
      ) : products.length === 0 ? (
        <EmptyState
          title="No products found"
          description="Try changing your search or filters."
        />
      ) : (
        <div className="flex flex-col">
          <ProductTable products={products} onDeleteRequest={setDeleteTarget} />
          <ProductCardList products={products} onDeleteRequest={setDeleteTarget} />
          <div className="mt-3 rounded-lg border border-border bg-surface">
            <Pagination info={pagination} onPageChange={(page) => update({ page })} />
          </div>
        </div>
      )}

      <DeleteConfirmModal
        product={deleteTarget}
        isDeleting={isDeleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
