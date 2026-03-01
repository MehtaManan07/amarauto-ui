import { useMutation, useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import * as bomApi from '../api/bom.api';
import type { BulkBOMLineItem } from '../api/bom.api';
import { useNotificationStore } from '../stores/notificationStore';
import { QUERY_KEYS } from '../constants';
import type { BOMLine, QueryParams } from '../types';

export const useBOMLines = (params?: QueryParams) => {
  return useQuery({
    queryKey: [QUERY_KEYS.BOM_LINES, params],
    queryFn: () => bomApi.getBOMLines(params),
  });
};

export const useBOMLinesByRawMaterial = (rawMaterialId: number | undefined) => {
  return useQuery({
    queryKey: [QUERY_KEYS.BOM_LINES, 'by-raw-material', rawMaterialId],
    queryFn: () => bomApi.getBOMLines({ raw_material_id: rawMaterialId!, page_size: 200 }),
    enabled: !!rawMaterialId,
  });
};

export const useBOMLinesInfinite = (params?: {
  search?: string;
  productId?: number;
  rawMaterialId?: number;
  variant?: string;
}) => {
  const normalizedSearch = params?.search?.trim() || undefined;
  const productId = params?.productId;
  const rawMaterialId = params?.rawMaterialId;
  const variant = params?.variant;
  return useInfiniteQuery({
    queryKey: [
      QUERY_KEYS.BOM_LINES,
      'infinite',
      normalizedSearch,
      productId,
      rawMaterialId,
      variant,
    ],
    queryFn: ({ pageParam = 1 }) =>
      bomApi.getBOMLinesPaginated(pageParam, 25, {
        search: normalizedSearch,
        product_id: productId,
        raw_material_id: rawMaterialId,
        variant,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.has_more ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  });
};

export const useBOMVariants = (productId: number | undefined) => {
  return useQuery({
    queryKey: [QUERY_KEYS.BOM_LINES, 'variants', productId],
    queryFn: () => bomApi.getBOMVariants(productId!),
    enabled: !!productId,
  });
};

export const useProductionCalc = (
  productId: number | undefined,
  variant: string | undefined,
  quantity: number
) => {
  return useQuery({
    queryKey: [
      QUERY_KEYS.BOM_LINES,
      'production-calc',
      productId,
      variant,
      quantity,
    ],
    queryFn: () => bomApi.getProductionCalc(productId!, variant, quantity),
    enabled: !!productId && quantity > 0,
  });
};

export const useBOMLine = (id: number | string) => {
  return useQuery({
    queryKey: QUERY_KEYS.BOM_LINE(id.toString()),
    queryFn: () => bomApi.getBOMLine(typeof id === 'string' ? parseInt(id) : id),
    enabled: !!id,
  });
};

export const useBulkCreateBOMLines = () => {
  const queryClient = useQueryClient();
  const { success, error } = useNotificationStore();

  return useMutation({
    mutationFn: ({ productId, lines }: { productId: number; lines: BulkBOMLineItem[] }) =>
      bomApi.bulkCreateBOMLines(productId, lines),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BOM_LINES] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCT(variables.productId.toString()) });
      const msg =
        data.failure_count > 0
          ? `${data.success_count} added, ${data.failure_count} failed`
          : `${data.success_count} BOM line(s) added`;
      success(msg);
    },
    onError: (err: Error) => {
      error(err.message || 'Failed to add BOM lines');
    },
  });
};

export const useCreateBOMLine = () => {
  const queryClient = useQueryClient();
  const { success, error } = useNotificationStore();

  return useMutation({
    mutationFn: (data: Partial<BOMLine>) => bomApi.createBOMLine(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BOM_LINES] });
      if (variables.product_id) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCT(variables.product_id.toString()) });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCT_BOM(variables.product_id.toString(), variables.variant) });
      }
      success('BOM line created successfully');
    },
    onError: (err: Error) => {
      error(err.message || 'Failed to create BOM line');
    },
  });
};

export const useUpdateBOMLine = () => {
  const queryClient = useQueryClient();
  const { success, error } = useNotificationStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<BOMLine> }) =>
      bomApi.updateBOMLine(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BOM_LINES] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOM_LINE(variables.id.toString()) });
      if (variables.data.product_id) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCT(variables.data.product_id.toString()) });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCT_BOM(variables.data.product_id.toString(), variables.data.variant) });
      }
      success('BOM line updated successfully');
    },
    onError: (err: Error) => {
      error(err.message || 'Failed to update BOM line');
    },
  });
};

export const useDeleteBOMLine = () => {
  const queryClient = useQueryClient();
  const { success, error } = useNotificationStore();

  return useMutation({
    mutationFn: (id: number) => bomApi.deleteBOMLine(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BOM_LINES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS] });
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey[0];
          return key === 'product' || key === 'product-bom';
        },
      });
      success('BOM line deleted successfully');
    },
    onError: (err: Error) => {
      error(err.message || 'Failed to delete BOM line');
    },
  });
};
