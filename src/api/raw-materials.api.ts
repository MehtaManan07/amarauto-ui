import apiClient from './axios';
import { API_ENDPOINTS } from '../constants';
import type { RawMaterial, QueryParams } from '../types';

export const getRawMaterials = async (params?: QueryParams): Promise<RawMaterial[]> => {
  const response = await apiClient.get<RawMaterial[]>(API_ENDPOINTS.RAW_MATERIALS, { params });
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
