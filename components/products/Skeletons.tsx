export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <table className="w-full text-sm">
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="border-b border-border last:border-0">
              <td className="w-16 px-4 py-3">
                <div className="skeleton h-10 w-10 rounded-md" />
              </td>
              <td className="px-4 py-3">
                <div className="skeleton h-4 w-40 rounded" />
              </td>
              <td className="px-4 py-3">
                <div className="skeleton h-4 w-20 rounded" />
              </td>
              <td className="px-4 py-3">
                <div className="skeleton h-4 w-14 rounded" />
              </td>
              <td className="px-4 py-3">
                <div className="skeleton h-4 w-10 rounded" />
              </td>
              <td className="px-4 py-3">
                <div className="skeleton h-4 w-10 rounded" />
              </td>
              <td className="px-4 py-3">
                <div className="skeleton h-8 w-20 rounded" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CardListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-3 rounded-lg border border-border bg-surface p-3">
          <div className="skeleton h-16 w-16 shrink-0 rounded-md" />
          <div className="flex flex-1 flex-col gap-2 py-1">
            <div className="skeleton h-4 w-3/4 rounded" />
            <div className="skeleton h-3 w-1/2 rounded" />
            <div className="skeleton h-3 w-1/3 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div className="skeleton aspect-square rounded-lg" />
      <div className="flex flex-col gap-3">
        <div className="skeleton h-6 w-2/3 rounded" />
        <div className="skeleton h-4 w-1/3 rounded" />
        <div className="skeleton h-20 w-full rounded" />
        <div className="skeleton h-8 w-1/4 rounded" />
      </div>
    </div>
  );
}
