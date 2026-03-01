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
    params: { ...params, page: 1, page_size: 200 },
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

export interface BulkBOMLineItem {
  raw_material_id: number;
  variant?: string;
  stage_number?: number;
  batch_qty?: number;
  raw_qty: number;
}

export interface BulkCreateBOMResult {
  success_count: number;
  failure_count: number;
  results: Array<{ raw_material_id: number; success: boolean; error?: string }>;
}

export const bulkCreateBOMLines = async (
  productId: number,
  lines: BulkBOMLineItem[]
): Promise<BulkCreateBOMResult> => {
  const results: BulkCreateBOMResult['results'] = [];
  let success_count = 0;
  let failure_count = 0;

  for (const line of lines) {
    try {
      await createBOMLine({
        product_id: productId,
        raw_material_id: line.raw_material_id,
        variant: line.variant?.trim() || undefined,
        stage_number: line.stage_number ?? 1,
        batch_qty: line.batch_qty ?? 1,
        raw_qty: line.raw_qty,
      });
      results.push({ raw_material_id: line.raw_material_id, success: true });
      success_count += 1;
    } catch (err) {
      results.push({
        raw_material_id: line.raw_material_id,
        success: false,
        error: err instanceof Error ? err.message : String(err),
      });
      failure_count += 1;
    }
  }

  return { success_count, failure_count, results };
};
