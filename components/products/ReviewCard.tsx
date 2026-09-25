import { ProductReview } from '@/types';
import { RatingDisplay } from './ProductBits';

export function ReviewCard({ review }: { review: ProductReview }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-ink-900">{review.reviewerName}</span>
        <RatingDisplay rating={review.rating} />
      </div>
      <p className="mt-2 text-sm text-ink-700">{review.comment}</p>
      <p className="mt-2 text-xs text-ink-300">
        {new Date(review.date).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })}
      </p>
    </div>
  );
}
