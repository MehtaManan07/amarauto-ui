import { useMutation, useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import * as rawMaterialsApi from '../api/raw-materials.api';
import { useNotificationStore } from '../stores/notificationStore';
import { QUERY_KEYS } from '../constants';
import type { RawMaterial, QueryParams } from '../types';

export const useRawMaterials = (params?: QueryParams) => {
  return useQuery({
    queryKey: [QUERY_KEYS.RAW_MATERIALS, params],
    queryFn: () => rawMaterialsApi.getRawMaterials(params),
  });
};

export const useRawMaterialsInfinite = (search?: string) => {
  const normalizedSearch = search?.trim() || undefined;
  return useInfiniteQuery({
    queryKey: normalizedSearch
      ? [QUERY_KEYS.RAW_MATERIALS, 'infinite', normalizedSearch]
      : [QUERY_KEYS.RAW_MATERIALS, 'infinite'],
    queryFn: ({ pageParam = 1 }) =>
      rawMaterialsApi.getRawMaterialsPaginated(pageParam, 25, normalizedSearch),
    getNextPageParam: (lastPage) =>
      lastPage.has_more ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  });
};

export const useInventoryLogs = (rawMaterialId: number | string) => {
  const id = typeof rawMaterialId === 'string' ? parseInt(rawMaterialId) : rawMaterialId;
  return useQuery({
    queryKey: QUERY_KEYS.INVENTORY_LOGS(id),
    queryFn: () => rawMaterialsApi.getInventoryLogs(id),
    enabled: !!id && !Number.isNaN(id),
  });
};

export const useRawMaterial = (id: number | string) => {
  return useQuery({
    queryKey: QUERY_KEYS.RAW_MATERIAL(id.toString()),
    queryFn: () => rawMaterialsApi.getRawMaterial(typeof id === 'string' ? parseInt(id) : id),
    enabled: !!id,
  });
};

export const useStockCheck = (belowMinOnly?: boolean) => {
  return useQuery({
    queryKey: [QUERY_KEYS.STOCK_CHECK, belowMinOnly],
    queryFn: () => rawMaterialsApi.checkStock(belowMinOnly),
  });
};

export const useFieldOptions = (fields: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.FIELD_OPTIONS(fields),
    queryFn: () => rawMaterialsApi.getFieldOptions(fields),
    enabled: !!fields,
  });
};

export const useCreateRawMaterial = () => {
  const queryClient = useQueryClient();
  const { success, error } = useNotificationStore();

  return useMutation({
    mutationFn: (data: Partial<RawMaterial>) => rawMaterialsApi.createRawMaterial(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RAW_MATERIALS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STOCK_CHECK] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD_STATS] });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.FIELD_OPTIONS('unit_type,material_type,group'),
      });
      success('Raw material created successfully');
    },
    onError: (err: Error) => {
      error(err.message || 'Failed to create raw material');
    },
  });
};

export const useUpdateRawMaterial = () => {
  const queryClient = useQueryClient();
  const { success, error } = useNotificationStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<RawMaterial> }) =>
      rawMaterialsApi.updateRawMaterial(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RAW_MATERIALS] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RAW_MATERIAL(variables.id.toString()) });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STOCK_CHECK] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD_STATS] });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.FIELD_OPTIONS('unit_type,material_type,group'),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.INVENTORY_LOGS(variables.id),
      });
      success('Raw material updated successfully');
    },
    onError: (err: Error) => {
      error(err.message || 'Failed to update raw material');
    },
  });
};

export const useAdjustStock = () => {
  const queryClient = useQueryClient();
  const { success, error } = useNotificationStore();

  return useMutation({
    mutationFn: ({
      id,
      quantityDelta,
      notes,
    }: {
      id: number;
      quantityDelta: number;
      notes?: string;
    }) => rawMaterialsApi.adjustStock(id, quantityDelta, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RAW_MATERIALS] });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.RAW_MATERIAL(variables.id.toString()),
      });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STOCK_CHECK] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD_STATS] });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.INVENTORY_LOGS(variables.id),
      });
      success('Stock adjusted successfully');
    },
    onError: (err: Error) => {
      error(err.message || 'Failed to adjust stock');
    },
  });
};

export const useBulkCreateRawMaterials = () => {
  const queryClient = useQueryClient();
  const { success, error } = useNotificationStore();

  return useMutation({
    mutationFn: (items: Partial<RawMaterial>[]) =>
      rawMaterialsApi.bulkCreateRawMaterials(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RAW_MATERIALS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STOCK_CHECK] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD_STATS] });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.FIELD_OPTIONS('unit_type,material_type,group'),
      });
      success('Bulk upload completed');
    },
    onError: (err: Error) => {
      error(err.message || 'Bulk upload failed');
    },
  });
};

export const useDeleteRawMaterial = () => {
  const queryClient = useQueryClient();
  const { success, error } = useNotificationStore();

  return useMutation({
    mutationFn: (id: number) => rawMaterialsApi.deleteRawMaterial(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RAW_MATERIALS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STOCK_CHECK] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD_STATS] });
      success('Raw material deleted successfully');
    },
    onError: (err: Error) => {
      error(err.message || 'Failed to delete raw material');
    },
  });
};
