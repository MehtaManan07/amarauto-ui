import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as workLogsApi from '../api/work-logs.api';
import { useNotificationStore } from '../stores/notificationStore';
import { QUERY_KEYS } from '../constants';
import type { WorkLog } from '../types';

export interface WorkLogsParams {
  userId?: number;
  productId?: number;
  jobRateId?: number;
  workDateFrom?: string;
  workDateTo?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export const useWorkLogs = (
  page: number = 1,
  pageSize: number = 25,
  params?: Omit<WorkLogsParams, 'page' | 'pageSize'>
) => {
  return useQuery({
    queryKey: [
      QUERY_KEYS.WORK_LOGS,
      page,
      pageSize,
      params?.userId,
      params?.productId,
      params?.jobRateId,
      params?.workDateFrom,
      params?.workDateTo,
      params?.search,
    ],
    queryFn: () =>
      workLogsApi.getWorkLogsPaginated(page, pageSize, {
        user_id: params?.userId,
        product_id: params?.productId,
        job_rate_id: params?.jobRateId,
        work_date_from: params?.workDateFrom,
        work_date_to: params?.workDateTo,
        search: params?.search,
      }),
  });
};

export const useWorkLog = (id: number | string) => {
  return useQuery({
    queryKey: QUERY_KEYS.WORK_LOG(id.toString()),
    queryFn: () =>
      workLogsApi.getWorkLog(typeof id === 'string' ? parseInt(id) : id),
    enabled: !!id,
  });
};

export const useCreateWorkLog = () => {
  const queryClient = useQueryClient();
  const { success, error } = useNotificationStore();

  return useMutation({
    mutationFn: (data: Partial<WorkLog>) => workLogsApi.createWorkLog(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WORK_LOGS] });
      success('Work log created successfully');
    },
    onError: (err: Error) => {
      error(err.message || 'Failed to create work log');
    },
  });
};

export const useUpdateWorkLog = () => {
  const queryClient = useQueryClient();
  const { success, error } = useNotificationStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<WorkLog> }) =>
      workLogsApi.updateWorkLog(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WORK_LOGS] });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.WORK_LOG(variables.id.toString()),
      });
      success('Work log updated successfully');
    },
    onError: (err: Error) => {
      error(err.message || 'Failed to update work log');
    },
  });
};

export const useDeleteWorkLog = () => {
  const queryClient = useQueryClient();
  const { success, error } = useNotificationStore();

  return useMutation({
    mutationFn: (id: number) => workLogsApi.deleteWorkLog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WORK_LOGS] });
      success('Work log deleted successfully');
    },
    onError: (err: Error) => {
      error(err.message || 'Failed to delete work log');
    },
  });
};
