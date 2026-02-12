import apiClient from './axios';
import { API_ENDPOINTS } from '../constants';
import type { Product, QueryParams, PaginatedResponse } from '../types';

export const getProducts = async (params?: QueryParams): Promise<Product[]> => {
  const response = await apiClient.get<PaginatedResponse<Product>>(API_ENDPOINTS.PRODUCTS, {
    params: { ...params, page: 1, page_size: 1000 },
  });
  return response.data?.items ?? [];
};

export const getProductsPaginated = async (
  page: number = 1,
  pageSize: number = 25,
  search?: string
): Promise<PaginatedResponse<Product>> => {
  const params: Record<string, unknown> = { page, page_size: pageSize };
  if (search?.trim()) params.search = search.trim();
  const response = await apiClient.get<PaginatedResponse<Product>>(
    API_ENDPOINTS.PRODUCTS,
    { params }
  );
  return response.data;
};

export const getProduct = async (id: number): Promise<Product> => {
  const response = await apiClient.get<Product>(API_ENDPOINTS.PRODUCT(id.toString()));
  return response.data;
};

export const createProduct = async (data: Partial<Product>): Promise<Product> => {
  const response = await apiClient.post<Product>(API_ENDPOINTS.PRODUCTS, data);
  return response.data;
};

export const updateProduct = async (id: number, data: Partial<Product>): Promise<Product> => {
  const response = await apiClient.patch<Product>(API_ENDPOINTS.PRODUCT(id.toString()), data);
  return response.data;
};

export const deleteProduct = async (id: number): Promise<void> => {
  await apiClient.delete(API_ENDPOINTS.PRODUCT(id.toString()));
};

export const getProductBOM = async (id: number, variant?: string) => {
  const response = await apiClient.get(API_ENDPOINTS.PRODUCT_BOM(id.toString(), variant));
  return response.data;
};

export const getProductFieldOptions = async (
  fields: string
): Promise<Record<string, string[]>> => {
  const response = await apiClient.get<Record<string, string[]>>(
    API_ENDPOINTS.PRODUCT_FIELD_OPTIONS,
    { params: { fields } }
  );
  return response.data;
};

export interface BulkCreateProductItem {
  part_no: string;
  name: string;
  category?: string;
  group?: string;
  mrp?: number;
  qty?: number;
  gst?: string;
  hsn?: string;
  model_name?: string;
  is_active?: boolean;
  product_image?: string;
  distributor_price?: number;
  dealer_price?: number;
  retail_price?: number;
  unit_of_measure?: string;
}

export interface BulkCreateResponse {
  added: number;
  skipped: number;
  errors: number;
  details: Array<{
    index: number;
    status: string;
    part_no?: string;
    message: string;
  }>;
}

export const bulkCreateProducts = async (
  items: BulkCreateProductItem[]
): Promise<BulkCreateResponse> => {
  const response = await apiClient.post<BulkCreateResponse>(
    API_ENDPOINTS.PRODUCTS_BULK,
    items
  );
  return response.data;
};
