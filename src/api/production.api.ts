import apiClient from './axios';
import { API_ENDPOINTS } from '../constants';
import type {
  StageInventory,
  StageCompletionData,
  StageCompletionResponse,
  MaterialsPreviewResponse,
} from '../types';

export interface StageInventoryParams {
  product_id?: number;
  variant?: string;
  stage_number?: number;
}

export const getStageInventory = async (
  params?: StageInventoryParams
): Promise<StageInventory[]> => {
  const response = await apiClient.get<StageInventory[]>(
    API_ENDPOINTS.PRODUCTION_STAGE_INVENTORY,
    { params }
  );
  return response.data;
};

export const completeStage = async (
  data: StageCompletionData
): Promise<StageCompletionResponse> => {
  const response = await apiClient.post<StageCompletionResponse>(
    API_ENDPOINTS.PRODUCTION_COMPLETE_STAGE,
    data
  );
  return response.data;
};

export const getMaterialsPreview = async (
  productId: number,
  variant: string | undefined,
  stageNumber: number,
  quantity: number
): Promise<MaterialsPreviewResponse> => {
  const response = await apiClient.get<MaterialsPreviewResponse>(
    API_ENDPOINTS.PRODUCTION_MATERIALS_PREVIEW,
    {
      params: {
        product_id: productId,
        variant: variant || undefined,
        stage_number: stageNumber,
        quantity,
      },
    }
  );
  return response.data;
};
