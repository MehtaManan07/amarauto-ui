import apiClient from './axios';
import { API_ENDPOINTS } from '../constants';
import type {
  RawMaterial,
  QueryParams,
  PaginatedResponse,
  InventoryLog,
  BulkUploadResponse,
} from '../types';

export const getRawMaterials = async (params?: QueryParams): Promise<RawMaterial[]> => {
  const response = await apiClient.get<PaginatedResponse<RawMaterial>>(
    API_ENDPOINTS.RAW_MATERIALS,
    { params: { ...params, page: 1, page_size: 200 } }
  );
  return response.data?.items ?? [];
};

export const getRawMaterialsPaginated = async (
  page: number = 1,
  pageSize: number = 25,
  search?: string
): Promise<PaginatedResponse<RawMaterial>> => {
  const params: Record<string, unknown> = { page, page_size: pageSize };
  if (search?.trim()) params.search = search.trim();
  const response = await apiClient.get<PaginatedResponse<RawMaterial>>(
    API_ENDPOINTS.RAW_MATERIALS,
    { params }
  );
  return response.data;
};

export const getRawMaterial = async (id: number): Promise<RawMaterial> => {
  const response = await apiClient.get<RawMaterial>(API_ENDPOINTS.RAW_MATERIAL(id.toString()));
  return response.data;
};

export const createRawMaterial = async (data: Partial<RawMaterial>): Promise<RawMaterial> => {
  const response = await apiClient.post<RawMaterial>(API_ENDPOINTS.RAW_MATERIALS, data);
  return response.data;
};

export const updateRawMaterial = async (id: number, data: Partial<RawMaterial>): Promise<RawMaterial> => {
  const response = await apiClient.patch<RawMaterial>(API_ENDPOINTS.RAW_MATERIAL(id.toString()), data);
  return response.data;
};

export const deleteRawMaterial = async (id: number): Promise<void> => {
  await apiClient.delete(API_ENDPOINTS.RAW_MATERIAL(id.toString()));
};

export const adjustStock = async (
  id: number,
  quantityDelta: number,
  notes?: string
): Promise<RawMaterial> => {
  const response = await apiClient.post<RawMaterial>(
    API_ENDPOINTS.ADJUST_STOCK(id.toString()),
    { quantity_delta: quantityDelta, notes }
  );
  return response.data;
};

export const getInventoryLogs = async (
  rawMaterialId: number,
  page: number = 1,
  pageSize: number = 25,
): Promise<PaginatedResponse<InventoryLog>> => {
  const response = await apiClient.get<PaginatedResponse<InventoryLog>>(
    API_ENDPOINTS.INVENTORY_LOGS(rawMaterialId),
    { params: { page, page_size: pageSize } }
  );
  return response.data;
};

export const bulkCreateRawMaterials = async (
  items: Partial<RawMaterial>[]
): Promise<BulkUploadResponse> => {
  const response = await apiClient.post<BulkUploadResponse>(
    `${API_ENDPOINTS.RAW_MATERIALS}/bulk`,
    items
  );
  return response.data;
};

export const checkStock = async (belowMinOnly?: boolean): Promise<RawMaterial[]> => {
  const response = await apiClient.get<RawMaterial[]>(API_ENDPOINTS.CHECK_STOCK, {
    params: { below_min_only: belowMinOnly },
  });
  return response.data;
};

export const getFieldOptions = async (fields: string): Promise<{ [key: string]: string[] }> => {
  const response = await apiClient.get<{ [key: string]: string[] }>(API_ENDPOINTS.FIELD_OPTIONS, {
    params: { fields },
  });
  return response.data;
};
