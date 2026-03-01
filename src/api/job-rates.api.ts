import apiClient from './axios';
import { API_ENDPOINTS } from '../constants';
import type { JobRate, PaginatedResponse } from '../types';

export interface JobRatesParams {
  search?: string;
  product_id?: number;
}

export const getJobRates = async (params?: JobRatesParams): Promise<JobRate[]> => {
  const response = await apiClient.get<PaginatedResponse<JobRate>>(API_ENDPOINTS.JOB_RATES, {
    params: { ...params, page: 1, page_size: 200 },
  });
  return response.data?.items ?? [];
};

export const getJobRatesPaginated = async (
  page: number = 1,
  pageSize: number = 25,
  params?: JobRatesParams
): Promise<PaginatedResponse<JobRate>> => {
  const response = await apiClient.get<PaginatedResponse<JobRate>>(API_ENDPOINTS.JOB_RATES, {
    params: { page, page_size: pageSize, ...params },
  });
  return response.data;
};

export const getJobRate = async (id: number): Promise<JobRate> => {
  const response = await apiClient.get<JobRate>(API_ENDPOINTS.JOB_RATE(id.toString()));
  return response.data;
};

export const createJobRate = async (data: Partial<JobRate>): Promise<JobRate> => {
  const response = await apiClient.post<JobRate>(API_ENDPOINTS.JOB_RATES, data);
  return response.data;
};

export const updateJobRate = async (id: number, data: Partial<JobRate>): Promise<JobRate> => {
  const response = await apiClient.patch<JobRate>(API_ENDPOINTS.JOB_RATE(id.toString()), data);
  return response.data;
};

export const deleteJobRate = async (id: number): Promise<void> => {
  await apiClient.delete(API_ENDPOINTS.JOB_RATE(id.toString()));
};
