import apiClient from './axios';
import { API_ENDPOINTS } from '../constants';
import type { WorkLog, PaginatedResponse } from '../types';

export interface WorkLogsParams {
  user_id?: number;
  product_id?: number;
  job_rate_id?: number;
  work_date_from?: string;
  work_date_to?: string;
  search?: string;
  page?: number;
  page_size?: number;
}

export const getWorkLogsPaginated = async (
  page: number = 1,
  pageSize: number = 25,
  params?: Omit<WorkLogsParams, 'page' | 'page_size'>
): Promise<PaginatedResponse<WorkLog>> => {
  const response = await apiClient.get<PaginatedResponse<WorkLog>>(
    API_ENDPOINTS.WORK_LOGS,
    {
      params: { page, page_size: pageSize, ...params },
    }
  );
  return response.data;
};

export const getWorkLog = async (id: number): Promise<WorkLog> => {
  const response = await apiClient.get<WorkLog>(API_ENDPOINTS.WORK_LOG(id.toString()));
  return response.data;
};

export const createWorkLog = async (data: Partial<WorkLog>): Promise<WorkLog> => {
  const response = await apiClient.post<WorkLog>(API_ENDPOINTS.WORK_LOGS, data);
  return response.data;
};

export const updateWorkLog = async (
  id: number,
  data: Partial<WorkLog>
): Promise<WorkLog> => {
  const response = await apiClient.patch<WorkLog>(
    API_ENDPOINTS.WORK_LOG(id.toString()),
    data
  );
  return response.data;
};

export const deleteWorkLog = async (id: number): Promise<void> => {
  await apiClient.delete(API_ENDPOINTS.WORK_LOG(id.toString()));
};

export interface WorkLogBulkItem {
  work_date: string;
  start_time: string;
  end_time: string;
  quantity: number;
  notes?: string;
}

export interface WorkLogBulkPayload {
  user_id: number;
  job_rate_id: number;
  items: WorkLogBulkItem[];
}

export const bulkCreateWorkLogs = async (data: WorkLogBulkPayload): Promise<WorkLog[]> => {
  const response = await apiClient.post<WorkLog[]>(`${API_ENDPOINTS.WORK_LOGS}/bulk`, data);
  return response.data;
};
