import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests and log API calls
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('access_token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(`📡 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  return config;
});

// Handle responses and token expiration
api.interceptors.response.use(
  (response) => {
    console.log(`📡 API Response: ${response.status} from ${response.config.url}`);
    
    // Backend wraps responses with: { statusCode, timestamp, path, message: [] }
    // Extract the actual data from the message field if it's an array with one item
    if (response.data && Array.isArray(response.data.message)) {
      // If message is an array with single item that's an object, return it
      if (response.data.message.length === 1 && typeof response.data.message[0] === 'object') {
        response.data = response.data.message[0];
      } else if (response.data.message.length === 1) {
        // If message is an array with a single string, keep it
        response.data = response.data.message[0];
      }
    }
    
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.log('🔐 Unauthorized (401) - clearing token and redirecting to login');
      typeof window !== 'undefined' && sessionStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types for Marketplace Categories
export interface MarketplaceCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  level: number;
  sortOrder: number;
  isActive: boolean;
  children?: MarketplaceCategory[];
  _count?: {
    products: number;
    children: number;
  };
}

export interface CategoryAttribute {
  id: string;
  categoryId: string;
  attributeId: string;
  required: boolean;
  filterable: boolean;
  variantAllowed: boolean;
  searchable: boolean;
  sortOrder: number;
  options?: string[];
  attribute: Attribute;
}

export interface Attribute {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'date';
}

export interface SellerCollection {
  id: string;
  sellerId: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  _count?: {
    products: number;
  };
}

export interface SellerTag {
  id: string;
  sellerId: string;
  name: string;
  slug: string;
  color?: string;
  _count?: {
    products: number;
  };
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  thumbnailUrl?: string;
  marketplaceCategoryId: string;
  marketplaceCategory: MarketplaceCategory;
  shopId: string;
  createdAt: string;
  attributeValues?: Array<{ attributeId: string; value: string }>;
  collections?: Array<{ collectionId: string }>;
  tags?: Array<{ tagId: string }>;
}

// Marketplace Categories API
export const categoriesAPI = {
  getAll: (tree?: boolean) =>
    api.get<MarketplaceCategory[]>('/marketplace-categories', {
      params: { tree: tree ? 'true' : undefined },
    }),

  getById: (id: string) =>
    api.get<MarketplaceCategory>(`/marketplace-categories/${id}`),

  getBySlug: (slug: string) =>
    api.get<MarketplaceCategory>(`/marketplace-categories/slug/${slug}`),

  getBreadcrumb: (id: string) =>
    api.get<MarketplaceCategory[]>(`/marketplace-categories/${id}/breadcrumb`),

  getProducts: (id: string, includeChildren?: boolean) =>
    api.get<Product[]>(`/marketplace-categories/${id}/products`, {
      params: { includeChildren: includeChildren ? 'true' : undefined },
    }),

  create: (data: {
    name: string;
    slug: string;
    description?: string;
    parentId?: string;
    sortOrder?: number;
  }) => api.post<MarketplaceCategory>('/marketplace-categories', data),

  update: (id: string, data: Partial<any>) =>
    api.patch<MarketplaceCategory>(`/marketplace-categories/${id}`, data),

  deactivate: (id: string) =>
    api.post<MarketplaceCategory>(`/marketplace-categories/${id}/deactivate`),

  activate: (id: string) =>
    api.post<MarketplaceCategory>(`/marketplace-categories/${id}/activate`),

  reorder: (categoryIds: string[]) =>
    api.post('/marketplace-categories/reorder', { categoryIds }),
};

// Attributes API
export const attributesAPI = {
  getAll: () => api.get<Attribute[]>('/attributes'),

  getById: (id: string) => api.get<Attribute>(`/attributes/${id}`),

  getByType: (type: string) =>
    api.get<Attribute[]>(`/attributes/type/${type}`),

  getCategoryUsage: (id: string) =>
    api.get(`/attributes/${id}/categories`),

  create: (data: {
    name: string;
    slug: string;
    type: string;
    description?: string;
  }) => api.post<Attribute>('/attributes', data),

  update: (id: string, data: Partial<any>) =>
    api.patch<Attribute>(`/attributes/${id}`, data),

  delete: (id: string) => api.delete(`/attributes/${id}`),
};

// Seller Collections API
export const collectionsAPI = {
  getAll: (includeInactive?: boolean) =>
    api.get<SellerCollection[]>('/seller/collections', {
      params: { includeInactive: includeInactive ? 'true' : undefined },
    }),

  getById: (id: string) =>
    api.get<SellerCollection>(`/seller/collections/${id}`),

  getBySlug: (slug: string) =>
    api.get<SellerCollection>(`/seller/collections/slug/${slug}`),

  getProducts: (id: string) =>
    api.get<any[]>(`/seller/collections/${id}/products`),

  create: (data: {
    name: string;
    slug: string;
    description?: string;
    sortOrder?: number;
  }) => api.post<SellerCollection>('/seller/collections', data),

  update: (id: string, data: Partial<any>) =>
    api.patch<SellerCollection>(`/seller/collections/${id}`, data),

  deactivate: (id: string) =>
    api.post<SellerCollection>(`/seller/collections/${id}/deactivate`),

  activate: (id: string) =>
    api.post<SellerCollection>(`/seller/collections/${id}/activate`),

  delete: (id: string) => api.delete(`/seller/collections/${id}`),

  addProduct: (collectionId: string, productId: string) =>
    api.post(`/seller/collections/${collectionId}/products/${productId}`),

  removeProduct: (collectionId: string, productId: string) =>
    api.delete(`/seller/collections/${collectionId}/products/${productId}`),

  reorder: (collectionIds: string[]) =>
    api.post('/seller/collections/reorder', { collectionIds }),
};

// Seller Tags API
export const tagsAPI = {
  getAll: () => api.get<SellerTag[]>('/seller/tags'),

  getById: (id: string) => api.get<SellerTag>(`/seller/tags/${id}`),

  getBySlug: (slug: string) =>
    api.get<SellerTag>(`/seller/tags/slug/${slug}`),

  search: (query: string) =>
    api.get<SellerTag[]>('/seller/tags/search', { params: { q: query } }),

  getTaggedProducts: (id: string) =>
    api.get<any[]>(`/seller/tags/${id}/products`),

  getProductTags: (productId: string) =>
    api.get<any[]>(`/seller/tags/products/${productId}`),

  create: (data: { name: string; slug: string; color?: string }) =>
    api.post<SellerTag>('/seller/tags', data),

  update: (id: string, data: Partial<any>) =>
    api.patch<SellerTag>(`/seller/tags/${id}`, data),

  delete: (id: string) => api.delete(`/seller/tags/${id}`),

  addToProduct: (tagId: string, productId: string) =>
    api.post(`/seller/tags/${tagId}/products/${productId}`),

  removeFromProduct: (tagId: string, productId: string) =>
    api.delete(`/seller/tags/${tagId}/products/${productId}`),

  bulkAddToProduct: (productId: string, tagIds: string[]) =>
    api.post(`/seller/tags/products/${productId}/bulk-add`, { tagIds }),

  addTagsToProduct: (productId: string, tagIds: string[]) =>
    api.post(`/seller/tags/products/${productId}/bulk-add`, { tagIds }),
};

// Products API
export const productsAPI = {
  getAll: () => api.get<Product[]>('/products'),

  getMine: () => api.get<Product[]>('/products/mine'),

  getById: (id: string) => api.get<Product>(`/products/${id}`),

  create: (data: any) => api.post<Product>('/products', data),

  update: (id: string, data: any) => api.put<Product>(`/products/${id}`, data),

  delete: (id: string) => api.delete(`/products/${id}`),
};

export default api;
