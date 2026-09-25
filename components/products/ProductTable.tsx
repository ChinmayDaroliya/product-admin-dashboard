'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import { RatingDisplay, StockBadge, formatPrice } from './ProductBits';
import { Button } from '@/components/ui/Button';

interface ProductTableProps {
  products: Product[];
  onDeleteRequest: (product: Product) => void;
}

export function ProductTable({ products, onDeleteRequest }: ProductTableProps) {
  return (
    <div className="hidden overflow-hidden rounded-lg border border-border bg-surface md:block">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-bg/60 text-xs uppercase tracking-wide text-ink-500">
            <th className="w-16 px-4 py-3 font-medium sr-only sm:not-sr-only">Image</th>
            <th className="px-4 py-3 font-medium">Product</th>
            <th className="px-4 py-3 font-medium">Category</th>
            <th className="px-4 py-3 font-medium">Price</th>
            <th className="px-4 py-3 font-medium">Rating</th>
            <th className="px-4 py-3 font-medium">Stock</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b border-border last:border-0 hover:bg-bg/50">
              <td className="px-4 py-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-md border border-border bg-bg">
                  <Image
                    src={product.thumbnail}
                    alt=""
                    fill
                    sizes="40px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </td>
              <td className="max-w-[260px] px-4 py-3">
                <Link
                  href={`/products/${product.id}`}
                  className="line-clamp-1 font-medium text-ink-900 hover:text-accent-hover hover:underline"
                >
                  {product.title}
                </Link>
              </td>
              <td className="px-4 py-3">
                <span className="line-clamp-1 max-w-[140px] text-ink-500 capitalize">
                  {product.category.replace(/-/g, ' ')}
                </span>
              </td>
              <td className="px-4 py-3 font-mono text-ink-900">{formatPrice(product.price)}</td>
              <td className="px-4 py-3">
                <RatingDisplay rating={product.rating} />
              </td>
              <td className="px-4 py-3">
                <StockBadge stock={product.stock} />
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Link href={`/products/${product.id}/edit`}>
                    <Button variant="secondary" className="px-3 py-1.5">
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="danger"
                    className="px-3 py-1.5"
                    onClick={() => onDeleteRequest(product)}
                  >
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
