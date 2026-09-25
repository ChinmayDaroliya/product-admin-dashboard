'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { productApi } from '@/api/productApi';
import { useProductStore } from '@/context/ProductStoreContext';
import { useToast } from '@/context/ToastContext';
import { ApiError, Category, Product, ProductFormData } from '@/types';
import { ProductForm } from '@/components/products/ProductForm';

const EMPTY_FORM: ProductFormData = {
  title: '',
  description: '',
  category: '',
  price: '',
  stock: '',
  thumbnail: '',
};

export default function AddProductPage() {
  const router = useRouter();
  const { recordAdd } = useProductStore();
  const { showToast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    productApi.getCategories(controller.signal).then(setCategories).catch(() => {});
    return () => controller.abort();
  }, []);

  async function handleSubmit(data: ProductFormData) {
    if (isSubmitting) return; // belt-and-suspenders duplicate-submit guard
    setIsSubmitting(true);
    try {
      const payload = {
        title: data.title.trim(),
        description: data.description.trim(),
        category: data.category,
        price: Number(data.price),
        stock: Number(data.stock),
        thumbnail: data.thumbnail || 'https://cdn.dummyjson.com/products/images/placeholder.jpg',
        images: data.thumbnail ? [data.thumbnail] : [],
        rating: 0,
        discountPercentage: 0,
        tags: [] as string[],
      };
      const created = await productApi.addProduct(payload);

      // DummyJSON always echoes back id 101 for /products/add regardless of
      // how many products already exist, which would collide with a real
      // product id. We replace it with a clearly-local id so links to this
      // product's detail/edit page stay unique for the rest of the session.
      const localProduct: Product = {
        ...created,
        id: Date.now(),
        reviews: [],
        images: payload.images.length ? payload.images : [payload.thumbnail],
      };

      recordAdd(localProduct);
      showToast('Product added.', 'success');
      router.push('/products');
    } catch (err) {
      showToast((err as ApiError).message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-ink-900">Add product</h1>
        <p className="mt-1 text-sm text-ink-500">
          Create a new catalog entry. Changes are reflected in this session (see the CRUD note in
          the README).
        </p>
      </div>

      <div className="max-w-2xl rounded-lg border border-border bg-surface p-6">
        <ProductForm
          mode="add"
          categories={categories}
          initialData={EMPTY_FORM}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          onCancel={() => router.push('/products')}
        />
      </div>
    </div>
  );
}
