import { Product } from '@/types';

export function StockBadge({ stock }: { stock: number }) {
  let classes = 'bg-accent-soft text-accent-hover';
  let label = 'In stock';
  if (stock === 0) {
    classes = 'bg-danger-soft text-danger';
    label = 'Out of stock';
  } else if (stock <= 10) {
    classes = 'bg-warn-soft text-warn';
    label = 'Low stock';
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${classes}`}>
      {label}
    </span>
  );
}

export function RatingDisplay({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-1 font-mono text-sm text-ink-700">
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 text-warn" aria-hidden="true">
        <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1 1 5.8L10 14.9l-5.21 2.74 1-5.8-4.21-4.1 5.82-.85L10 1.5z" />
      </svg>
      {rating.toFixed(1)}
    </span>
  );
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
}

export function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

export type { Product };
