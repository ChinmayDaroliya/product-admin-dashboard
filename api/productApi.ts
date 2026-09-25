import axiosClient from './axiosClient';
import { Category, Product, ProductListResponse } from '@/types';

export interface FetchProductsParams {
  limit: number;
  skip: number;
  search: string; // when non-empty, /products/search is used instead
  category: string; // when non-empty (and search is empty), category endpoint is used
  signal?: AbortSignal;
}

/**
 * Single entry point for reading a page of products. Encapsulates the
 * "search XOR category" decision (see README > Search + Category Decision)
 * so every caller gets consistent behavior without re-implementing it.
 */
function getProducts({ limit, skip, search, category, signal }: FetchProductsParams) {
  if (search) {
    return axiosClient
      .get<ProductListResponse>('/products/search', {
        params: { q: search, limit, skip },
        signal,
      })
      .then((res) => res.data);
  }

  if (category) {
    return axiosClient
      .get<ProductListResponse>(`/products/category/${encodeURIComponent(category)}`, {
        params: { limit, skip },
        signal,
      })
      .then((res) => res.data);
  }

  return axiosClient
    .get<ProductListResponse>('/products', { params: { limit, skip }, signal })
    .then((res) => res.data);
}

function getCategories(signal?: AbortSignal) {
  return axiosClient
    .get<Category[]>('/products/categories', { signal })
    .then((res) => res.data);
}

function getProduct(id: number | string, signal?: AbortSignal) {
  return axiosClient.get<Product>(`/products/${id}`, { signal }).then((res) => res.data);
}

function addProduct(payload: Partial<Product>) {
  return axiosClient.post<Product>('/products/add', payload).then((res) => res.data);
}

function updateProduct(id: number, payload: Partial<Product>) {
  return axiosClient.put<Product>(`/products/${id}`, payload).then((res) => res.data);
}

function deleteProduct(id: number) {
  return axiosClient.delete<Product>(`/products/${id}`).then((res) => res.data);
}

export const productApi = {
  getProducts,
  getCategories,
  getProduct,
  addProduct,
  updateProduct,
  deleteProduct,
};
