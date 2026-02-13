import apiClient from './axios';
import { API_ENDPOINTS } from '../constants';
import type {
  BOMLine,
  QueryParams,
  PaginatedResponse,
  ProductionCalcResponse,
} from '../types';

export const getBOMLines = async (params?: QueryParams): Promise<BOMLine[]> => {
  const response = await apiClient.get<PaginatedResponse<BOMLine>>(API_ENDPOINTS.BOM, {
    params: { ...params, page: 1, page_size: 1000 },
  });
  return response.data?.items ?? [];
};

export const getBOMLinesPaginated = async (
  page: number = 1,
  pageSize: number = 25,
  params?: { search?: string; product_id?: number; raw_material_id?: number; variant?: string }
): Promise<PaginatedResponse<BOMLine>> => {
  const response = await apiClient.get<PaginatedResponse<BOMLine>>(API_ENDPOINTS.BOM, {
    params: { page, page_size: pageSize, ...params },
  });
  return response.data;
};

export const getBOMVariants = async (productId: number): Promise<string[]> => {
  const response = await apiClient.get<string[]>(API_ENDPOINTS.BOM_VARIANTS, {
    params: { product_id: productId },
  });
  return response.data;
};

export const getProductionCalc = async (
  productId: number,
  variant: string | undefined,
  quantity: number
): Promise<ProductionCalcResponse> => {
  const params: Record<string, unknown> = { product_id: productId, quantity };
  if (variant) params.variant = variant;
  const response = await apiClient.get<ProductionCalcResponse>(
    API_ENDPOINTS.BOM_PRODUCTION_CALC,
    { params }
  );
  return response.data;
};

export const getBOMLine = async (id: number): Promise<BOMLine> => {
  const response = await apiClient.get<BOMLine>(API_ENDPOINTS.BOM_LINE(id.toString()));
  return response.data;
};

export const createBOMLine = async (data: Partial<BOMLine>): Promise<BOMLine> => {
  const response = await apiClient.post<BOMLine>(API_ENDPOINTS.BOM, data);
  return response.data;
};

export const updateBOMLine = async (id: number, data: Partial<BOMLine>): Promise<BOMLine> => {
  const response = await apiClient.patch<BOMLine>(API_ENDPOINTS.BOM_LINE(id.toString()), data);
  return response.data;
};

export const deleteBOMLine = async (id: number): Promise<void> => {
  await apiClient.delete(API_ENDPOINTS.BOM_LINE(id.toString()));
};
