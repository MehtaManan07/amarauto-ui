import { useMemo } from 'react';
import { useMutation, useQuery, useInfiniteQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import * as productsApi from '../api/products.api';
import { useNotificationStore } from '../stores/notificationStore';
import { QUERY_KEYS } from '../constants';
import { useDebouncedValue } from './useDebouncedValue';
import type { Product, QueryParams } from '../types';
import type { BulkCreateProductItem } from '../api/products.api';

export const useProducts = (params?: QueryParams) => {
  return useQuery({
    queryKey: [QUERY_KEYS.PRODUCTS, params],
    queryFn: () => productsApi.getProducts(params),
  });
};

export const useProductsPaginated = (page: number, pageSize: number, search?: string) => {
  const normalizedSearch = search?.trim() || undefined;
  return useQuery({
    queryKey: [QUERY_KEYS.PRODUCTS, 'paginated', page, pageSize, normalizedSearch],
    queryFn: () => productsApi.getProductsPaginated(page, pageSize, normalizedSearch),
  });
};

export const useProductsInfinite = (search?: string) => {
  const normalizedSearch = search?.trim() || undefined;
  return useInfiniteQuery({
    queryKey: normalizedSearch
      ? [QUERY_KEYS.PRODUCTS, 'infinite', normalizedSearch]
      : [QUERY_KEYS.PRODUCTS, 'infinite'],
    queryFn: ({ pageParam = 1 }) =>
      productsApi.getProductsPaginated(pageParam, 25, normalizedSearch),
    getNextPageParam: (lastPage) =>
      lastPage.has_more ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
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

export const useProductFieldOptions = (fields: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.PRODUCT_FIELD_OPTIONS(fields),
    queryFn: () => productsApi.getProductFieldOptions(fields),
    enabled: !!fields,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  const { success, error } = useNotificationStore();

  return useMutation({
    mutationFn: (data: Partial<Product>) => productsApi.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS] });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PRODUCT_FIELD_OPTIONS('category,group,unit_of_measure'),
      });
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
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PRODUCT_FIELD_OPTIONS('category,group,unit_of_measure'),
      });
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

export const useBulkCreateProducts = () => {
  const queryClient = useQueryClient();
  const { success, error } = useNotificationStore();

  return useMutation({
    mutationFn: (items: BulkCreateProductItem[]) =>
      productsApi.bulkCreateProducts(items),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS] });
      success(
        `Bulk create complete: ${data.added} added, ${data.skipped} skipped, ${data.errors} errors`
      );
    },
    onError: (err: Error) => {
      error(err.message || 'Failed to bulk create products');
    },
  });
};

export const useProductSearch = (search: string, selectedId?: number) => {
  const debouncedSearch = useDebouncedValue(search, 300);

  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: [QUERY_KEYS.PRODUCTS, 'search', debouncedSearch],
    queryFn: () => productsApi.getProductsPaginated(1, 50, debouncedSearch || undefined),
    placeholderData: keepPreviousData,
  });

  const { data: selectedProduct } = useQuery({
    queryKey: QUERY_KEYS.PRODUCT(selectedId?.toString() ?? ''),
    queryFn: () => productsApi.getProduct(selectedId!),
    enabled: !!selectedId,
    staleTime: 5 * 60 * 1000,
  });

  const options = useMemo(() => {
    const items = searchResults?.items ?? [];
    if (selectedProduct && !items.some((p) => p.id === selectedProduct.id)) {
      return [selectedProduct, ...items];
    }
    return items;
  }, [searchResults?.items, selectedProduct]);

  return { options, isLoading: searchLoading };
};
