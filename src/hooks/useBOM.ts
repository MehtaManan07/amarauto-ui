import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as bomApi from '../api/bom.api';
import { useNotificationStore } from '../stores/notificationStore';
import { QUERY_KEYS } from '../constants';
import type { BOMLine, QueryParams } from '../types';

export const useBOMLines = (params?: QueryParams) => {
  return useQuery({
    queryKey: [QUERY_KEYS.BOM_LINES, params],
    queryFn: () => bomApi.getBOMLines(params),
  });
};

export const useBOMLine = (id: number | string) => {
  return useQuery({
    queryKey: QUERY_KEYS.BOM_LINE(id.toString()),
    queryFn: () => bomApi.getBOMLine(typeof id === 'string' ? parseInt(id) : id),
    enabled: !!id,
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
      success('BOM line deleted successfully');
    },
    onError: (err: Error) => {
      error(err.message || 'Failed to delete BOM line');
    },
  });
};
