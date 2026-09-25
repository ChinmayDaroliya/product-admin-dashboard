'use client';

import { FormEvent, useState } from 'react';
import { Category, FormMode, ProductFormData, ProductFormErrors } from '@/types';
import { Input, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

interface ProductFormProps {
  mode: FormMode;
  categories: Category[];
  initialData: ProductFormData;
  isSubmitting: boolean;
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
}

function validate(data: ProductFormData): ProductFormErrors {
  const errors: ProductFormErrors = {};

  if (!data.title.trim()) errors.title = 'Title is required.';
  else if (data.title.trim().length < 3) errors.title = 'Title must be at least 3 characters.';
  else if (data.title.trim().length > 120) errors.title = 'Title must be under 120 characters.';

  if (!data.description.trim()) errors.description = 'Description is required.';
  else if (data.description.trim().length < 10)
    errors.description = 'Description must be at least 10 characters.';
  else if (data.description.trim().length > 2000)
    errors.description = 'Description must be under 2000 characters.';

  if (!data.category) errors.category = 'Please select a category.';

  const price = Number(data.price);
  if (!data.price.trim()) errors.price = 'Price is required.';
  else if (Number.isNaN(price) || price <= 0) errors.price = 'Enter a valid price greater than 0.';
  else if (price > 1000000) errors.price = 'Price seems too high - check the value.';

  const stock = Number(data.stock);
  if (!data.stock.trim()) errors.stock = 'Stock is required.';
  else if (!Number.isInteger(stock) || stock < 0)
    errors.stock = 'Enter a valid whole number of units (0 or more).';

  if (data.thumbnail && !isPlausibleUrl(data.thumbnail)) {
    errors.thumbnail = 'Enter a valid image URL, or leave this blank.';
  }

  return errors;
}

function isPlausibleUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function ProductForm({
  mode,
  categories,
  initialData,
  isSubmitting,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const [data, setData] = useState<ProductFormData>(initialData);
  const [errors, setErrors] = useState<ProductFormErrors>({});

  function setField<K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (isSubmitting) return; // duplicate-submit guard
    const validationErrors = validate(data);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    onSubmit(data);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <Input
        label="Title"
        value={data.title}
        onChange={(e) => setField('title', e.target.value)}
        error={errors.title}
        disabled={isSubmitting}
        maxLength={120}
      />

      <Textarea
        label="Description"
        value={data.description}
        onChange={(e) => setField('description', e.target.value)}
        error={errors.description}
        disabled={isSubmitting}
        rows={4}
        maxLength={2000}
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Select
          label="Category"
          value={data.category}
          onChange={(e) => setField('category', e.target.value)}
          error={errors.category}
          disabled={isSubmitting}
          options={[
            { value: '', label: 'Select a category' },
            ...categories.map((c) => ({ value: c.slug, label: c.name })),
          ]}
        />

        <Input
          label="Image URL"
          value={data.thumbnail}
          onChange={(e) => setField('thumbnail', e.target.value)}
          error={errors.thumbnail}
          disabled={isSubmitting}
          placeholder="https://…"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Input
          label="Price (USD)"
          type="number"
          min="0"
          step="0.01"
          value={data.price}
          onChange={(e) => setField('price', e.target.value)}
          error={errors.price}
          disabled={isSubmitting}
        />
        <Input
          label="Stock"
          type="number"
          min="0"
          step="1"
          value={data.stock}
          onChange={(e) => setField('stock', e.target.value)}
          error={errors.stock}
          disabled={isSubmitting}
        />
      </div>

      <div className="flex justify-end gap-2 border-t border-border pt-5">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {mode === 'add' ? 'Add product' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
