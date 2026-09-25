import { Product } from '@/types';

interface ProductStatsProps {
  products: Product[];
  total: number;
}

// Computed from the current page only (clearly labeled as such) - fetching
// the entire catalog just to sum stats would defeat the point of paginating.
export function ProductStats({ products, total }: ProductStatsProps) {
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 10).length;
  const outOfStock = products.filter((p) => p.stock === 0).length;
  const avgRating = products.length
    ? (products.reduce((sum, p) => sum + p.rating, 0) / products.length).toFixed(1)
    : '—';

  const stats = [
    { label: 'Total products', value: total.toLocaleString() },
    { label: 'On this page', value: products.length },
    { label: 'Low stock (page)', value: lowStock },
    { label: 'Out of stock (page)', value: outOfStock },
    { label: 'Avg. rating (page)', value: avgRating },
  ];

  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {stats.map((s) => (
        <div key={s.label} className="rounded-lg border border-border bg-surface px-4 py-3">
          <dt className="text-xs text-ink-500">{s.label}</dt>
          <dd className="mt-1 font-mono text-lg font-semibold text-ink-900">{s.value}</dd>
        </div>
      ))}
    </dl>
  );
}
