import apiClient from './axios';
import { API_ENDPOINTS } from '../constants';
import type { BOMLine, QueryParams } from '../types';

export const getBOMLines = async (params?: QueryParams): Promise<BOMLine[]> => {
  const response = await apiClient.get<BOMLine[]>(API_ENDPOINTS.BOM, { params });
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
