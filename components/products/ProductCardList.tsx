'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import { RatingDisplay, StockBadge, formatPrice } from './ProductBits';
import { Button } from '@/components/ui/Button';

interface ProductCardListProps {
  products: Product[];
  onDeleteRequest: (product: Product) => void;
}

export function ProductCardList({ products, onDeleteRequest }: ProductCardListProps) {
  return (
    <div className="flex flex-col gap-3 md:hidden">
      {products.map((product) => (
        <div key={product.id} className="rounded-lg border border-border bg-surface p-3 shadow-card">
          <div className="flex gap-3">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-border bg-bg">
              <Image
                src={product.thumbnail}
                alt=""
                fill
                sizes="64px"
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="min-w-0 flex-1">
              <Link
                href={`/products/${product.id}`}
                className="line-clamp-2 text-sm font-medium text-ink-900 hover:text-accent-hover hover:underline"
              >
                {product.title}
              </Link>
              <p className="mt-0.5 text-xs capitalize text-ink-500">
                {product.category.replace(/-/g, ' ')}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm font-semibold text-ink-900">
                  {formatPrice(product.price)}
                </span>
                <RatingDisplay rating={product.rating} />
                <StockBadge stock={product.stock} />
              </div>
            </div>
          </div>
          <div className="mt-3 flex gap-2 border-t border-border pt-3">
            <Link href={`/products/${product.id}/edit`} className="flex-1">
              <Button variant="secondary" className="w-full">
                Edit
              </Button>
            </Link>
            <Button variant="danger" className="flex-1" onClick={() => onDeleteRequest(product)}>
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
