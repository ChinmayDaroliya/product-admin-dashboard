'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { productApi } from '@/api/productApi';
import { useProductStore } from '@/context/ProductStoreContext';
import { useToast } from '@/context/ToastContext';
import { ApiError, Category, Product, ProductFormData } from '@/types';
import { ProductForm } from '@/components/products/ProductForm';
import { DetailSkeleton } from '@/components/products/Skeletons';
import { EmptyState } from '@/components/products/EmptyState';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

function toFormData(product: Product): ProductFormData {
  return {
    title: product.title,
    description: product.description,
    category: product.category,
    price: String(product.price),
    stock: String(product.stock),
    thumbnail: product.thumbnail || '',
  };
}

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { recordEdit, applyOverlayToOne, getEditedOrAdded } = useProductStore();
  const { showToast } = useToast();

  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const numericId = Number(params.id);

  useEffect(() => {
    const controller = new AbortController();
    productApi.getCategories(controller.signal).then(setCategories).catch(() => {});
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!params.id || Number.isNaN(numericId) || numericId <= 0) {
      setProduct(null);
      return;
    }

    const locallyAdded = getEditedOrAdded(numericId);
    if (locallyAdded) {
      setProduct(locallyAdded);
      return;
    }

    const controller = new AbortController();
    productApi
      .getProduct(numericId, controller.signal)
      .then((data) => setProduct(applyOverlayToOne(data)))
      .catch((err: ApiError) => {
        if (err.message === 'Request cancelled.') return;
        setProduct(err.status === 404 ? null : null);
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function handleSubmit(data: ProductFormData) {
    if (!product || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const patch: Partial<Product> = {
        title: data.title.trim(),
        description: data.description.trim(),
        category: data.category,
        price: Number(data.price),
        stock: Number(data.stock),
        thumbnail: data.thumbnail || product.thumbnail,
      };

      const isLocalOnlyProduct = Boolean(getEditedOrAdded(product.id));

      // DummyJSON never persists locally created IDs, so a session-only product
      // should only update the overlay and not call the real PUT endpoint.
      if (!isLocalOnlyProduct) {
        await productApi.updateProduct(product.id, patch);
      }

      recordEdit(product.id, patch);
      showToast('Product updated.', 'success');
      router.push(`/products/${product.id}`);
    } catch (err) {
      showToast((err as ApiError).message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (product === undefined) return <DetailSkeleton />;

  if (product === null) {
    return (
      <EmptyState
        title="Product not found"
        description="We couldn't find a product with that ID to edit."
        action={
          <Link href="/products">
            <Button variant="secondary">Back to products</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-ink-900">Edit product</h1>
        <p className="mt-1 text-sm text-ink-500">{product.title}</p>
      </div>

      <div className="max-w-2xl rounded-lg border border-border bg-surface p-6">
        <ProductForm
          mode="edit"
          categories={categories}
          initialData={toFormData(product)}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          onCancel={() => router.push(`/products/${product.id}`)}
        />
      </div>
    </div>
  );
}
