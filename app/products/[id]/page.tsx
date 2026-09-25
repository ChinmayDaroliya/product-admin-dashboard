'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { productApi } from '@/api/productApi';
import { useProductStore } from '@/context/ProductStoreContext';
import { ApiError, Product } from '@/types';
import { ImageGallery } from '@/components/products/ImageGallery';
import { ReviewCard } from '@/components/products/ReviewCard';
import { RatingDisplay, StockBadge, formatPrice } from '@/components/products/ProductBits';
import { DetailSkeleton } from '@/components/products/Skeletons';
import { ErrorState } from '@/components/products/ErrorState';
import { EmptyState } from '@/components/products/EmptyState';
import { Button } from '@/components/ui/Button';

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const { applyOverlayToOne, getEditedOrAdded } = useProductStore();

  const [product, setProduct] = useState<Product | null | undefined>(undefined); // undefined = loading, null = not found
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    const idParam = params.id;
    const numericId = Number(idParam);

    // Invalid id in the URL (e.g. /products/abc) -> show "not found"
    // immediately instead of sending a doomed request.
    if (!idParam || Number.isNaN(numericId) || numericId <= 0) {
      setProduct(null);
      return;
    }

    // A product created locally this session has a fake id the real API
    // doesn't know about - short-circuit and read it straight from the
    // overlay store instead of hitting the network.
    const locallyAdded = getEditedOrAdded(numericId);
    if (locallyAdded) {
      setProduct(locallyAdded);
      return;
    }

    const controller = new AbortController();
    setProduct(undefined);
    setError(null);

    productApi
      .getProduct(numericId, controller.signal)
      .then((data) => setProduct(applyOverlayToOne(data)))
      .catch((err: ApiError) => {
        if (err.message === 'Request cancelled.') return;
        if (err.status === 404) {
          setProduct(null);
        } else {
          setError(err.message);
        }
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, retryToken]);

  if (error) {
    return <ErrorState message={error} onRetry={() => setRetryToken((t) => t + 1)} />;
  }

  if (product === undefined) {
    return <DetailSkeleton />;
  }

  if (product === null) {
    return (
      <EmptyState
        title="Product not found"
        description="We couldn't find a product with that ID. It may have been removed."
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
      <Link href="/products" className="inline-flex w-fit items-center gap-1 text-sm text-ink-500 hover:text-accent-hover">
        <BackIcon /> Back to products
      </Link>

      <div className="grid grid-cols-1 gap-8 rounded-lg border border-border bg-surface p-6 lg:grid-cols-2">
        <ImageGallery images={product.images} title={product.title} />

        <div className="flex flex-col gap-4">
          <div>
            <span className="text-xs font-medium uppercase tracking-wide text-accent-hover">
              {product.category.replace(/-/g, ' ')}
            </span>
            <h1 className="mt-1 text-2xl font-semibold text-ink-900">{product.title}</h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-2xl font-semibold text-ink-900">
              {formatPrice(product.price)}
            </span>
            <RatingDisplay rating={product.rating} />
            <StockBadge stock={product.stock} />
          </div>

          <p className="text-sm leading-relaxed text-ink-700">{product.description}</p>

          <dl className="grid grid-cols-2 gap-4 border-t border-border pt-4 text-sm">
            <div>
              <dt className="text-ink-500">Stock</dt>
              <dd className="font-mono text-ink-900">{product.stock} units</dd>
            </div>
            {product.brand && (
              <div>
                <dt className="text-ink-500">Brand</dt>
                <dd className="text-ink-900">{product.brand}</dd>
              </div>
            )}
            {product.sku && (
              <div>
                <dt className="text-ink-500">SKU</dt>
                <dd className="font-mono text-ink-900">{product.sku}</dd>
              </div>
            )}
            {product.warrantyInformation && (
              <div>
                <dt className="text-ink-500">Warranty</dt>
                <dd className="text-ink-900">{product.warrantyInformation}</dd>
              </div>
            )}
          </dl>

          <div className="flex gap-2 border-t border-border pt-4">
            <Link href={`/products/${product.id}/edit`}>
              <Button variant="secondary">Edit product</Button>
            </Link>
          </div>
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-base font-semibold text-ink-900">
          Reviews {product.reviews?.length ? `(${product.reviews.length})` : ''}
        </h2>
        {product.reviews && product.reviews.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {product.reviews.map((review, i) => (
              <ReviewCard key={i} review={review} />
            ))}
          </div>
        ) : (
          <EmptyState title="No reviews yet" description="This product hasn't been reviewed." />
        )}
      </section>
    </div>
  );
}

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
