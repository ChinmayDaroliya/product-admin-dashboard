import { TableSkeleton, CardListSkeleton } from '@/components/products/Skeletons';

export default function ProductsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="skeleton h-8 w-40 rounded" />
      <TableSkeleton />
      <CardListSkeleton />
    </div>
  );
}
