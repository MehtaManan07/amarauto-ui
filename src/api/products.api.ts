import apiClient from './axios';
import { API_ENDPOINTS } from '../constants';
import type { Product, QueryParams } from '../types';

export const getProducts = async (params?: QueryParams): Promise<Product[]> => {
  const response = await apiClient.get<Product[]>(API_ENDPOINTS.PRODUCTS, { params });
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
