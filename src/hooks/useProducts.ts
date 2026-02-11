import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as productsApi from '../api/products.api';
import { useNotificationStore } from '../stores/notificationStore';
import { QUERY_KEYS } from '../constants';
import type { Product, QueryParams } from '../types';

export const useProducts = (params?: QueryParams) => {
  return useQuery({
    queryKey: [QUERY_KEYS.PRODUCTS, params],
    queryFn: () => productsApi.getProducts(params),
  });
};

export const useProduct = (id: number | string) => {
  return useQuery({
    queryKey: QUERY_KEYS.PRODUCT(id.toString()),
    queryFn: () => productsApi.getProduct(typeof id === 'string' ? parseInt(id) : id),
    enabled: !!id,
  });
};

export const useProductBOM = (id: number | string, variant?: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.PRODUCT_BOM(id.toString(), variant),
    queryFn: () => productsApi.getProductBOM(typeof id === 'string' ? parseInt(id) : id, variant),
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  const { success, error } = useNotificationStore();

  return useMutation({
    mutationFn: (data: Partial<Product>) => productsApi.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS] });
      success('Product created successfully');
    },
    onError: (err: Error) => {
      error(err.message || 'Failed to create product');
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  const { success, error } = useNotificationStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Product> }) =>
      productsApi.updateProduct(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCT(variables.id.toString()) });
      success('Product updated successfully');
    },
    onError: (err: Error) => {
      error(err.message || 'Failed to update product');
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  const { success, error } = useNotificationStore();

  return useMutation({
    mutationFn: (id: number) => productsApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS] });
      success('Product deleted successfully');
    },
    onError: (err: Error) => {
      error(err.message || 'Failed to delete product');
    },
  });
};
