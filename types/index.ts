// Central type definitions. Keeping these in one place avoids re-declaring
// shapes for the same API resources in multiple files.

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  image: string;
}

// DummyJSON's /auth/login response embeds the user fields alongside the
// token fields, so this extends User rather than nesting it.
export interface AuthResponse extends User {
  accessToken: string;
  refreshToken?: string;
}

export interface ProductDimensions {
  width: number;
  height: number;
  depth: number;
}

export interface ProductReview {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  tags: string[];
  brand?: string;
  sku?: string;
  weight?: number;
  dimensions?: ProductDimensions;
  warrantyInformation?: string;
  shippingInformation?: string;
  availabilityStatus?: string;
  reviews?: ProductReview[];
  returnPolicy?: string;
  minimumOrderQuantity?: number;
  thumbnail: string;
  images: string[];
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export interface Category {
  slug: string;
  name: string;
  url: string;
}

// Normalized shape the UI works with. Parsed once from raw URL search
// params so every consumer trusts these values are already safe.
export interface ProductListState {
  page: number;
  limit: number;
  search: string;
  category: string; // '' means "All Categories"
  sort: SortOption;
}

export type SortOption =
  | 'default'
  | 'price-asc'
  | 'price-desc'
  | 'rating-asc'
  | 'rating-desc'
  | 'title-asc'
  | 'title-desc';

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  startIndex: number; // 1-based index of first item on this page
  endIndex: number; // 1-based index of last item on this page
}

// Normalized error shape surfaced to UI components. Never leak raw Axios
// error objects into components.
export interface ApiError {
  message: string;
  status?: number;
}

export type FormMode = 'add' | 'edit';

export interface ProductFormData {
  title: string;
  description: string;
  category: string;
  price: string; // kept as string while editing, parsed on submit
  stock: string;
  thumbnail: string;
}

export interface ProductFormErrors {
  title?: string;
  description?: string;
  category?: string;
  price?: string;
  stock?: string;
  thumbnail?: string;
}
