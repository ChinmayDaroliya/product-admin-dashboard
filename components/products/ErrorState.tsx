import { Button } from '@/components/ui/Button';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-lg border border-danger/20 bg-danger-soft px-6 py-16 text-center"
    >
      <h3 className="text-sm font-semibold text-danger">Something went wrong</h3>
      <p className="mt-1 max-w-xs text-sm text-danger/80">{message}</p>
      <Button variant="secondary" onClick={onRetry} className="mt-4">
        Retry
      </Button>
    </div>
  );
}
