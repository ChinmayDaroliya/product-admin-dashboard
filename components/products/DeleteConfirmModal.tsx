'use client';

import { Product } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface DeleteConfirmModalProps {
  product: Product | null;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmModal({
  product,
  isDeleting,
  onCancel,
  onConfirm,
}: DeleteConfirmModalProps) {
  return (
    <Modal title="Delete product?" isOpen={!!product} onClose={onCancel}>
      <p className="text-sm text-ink-500">
        Are you sure you want to delete{' '}
        <span className="font-medium text-ink-900">{product?.title}</span>? This cannot be undone.
      </p>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel} disabled={isDeleting}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} isLoading={isDeleting}>
          Delete
        </Button>
      </div>
    </Modal>
  );
}
