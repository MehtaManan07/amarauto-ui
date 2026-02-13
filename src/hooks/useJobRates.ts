import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as jobRatesApi from '../api/job-rates.api';
import { useNotificationStore } from '../stores/notificationStore';
import { QUERY_KEYS } from '../constants';
import type { JobRate } from '../types';

export interface JobRatesParams {
  search?: string;
  productId?: number;
}

export const useJobRates = (params?: JobRatesParams) => {
  const normalizedSearch = params?.search?.trim() || undefined;
  const productId = params?.productId;
  return useQuery({
    queryKey: [QUERY_KEYS.JOB_RATES, normalizedSearch, productId],
    queryFn: () =>
      jobRatesApi.getJobRates({
        search: normalizedSearch,
        product_id: productId,
      }),
  });
};

export const useJobRatesByProduct = (productId: number | undefined) => {
  return useQuery({
    queryKey: [QUERY_KEYS.JOB_RATES, 'by-product', productId],
    queryFn: () =>
      jobRatesApi.getJobRates({ product_id: productId! }),
    enabled: !!productId,
  });
};

export const useJobRate = (id: number | string) => {
  return useQuery({
    queryKey: QUERY_KEYS.JOB_RATE(id.toString()),
    queryFn: () =>
      jobRatesApi.getJobRate(typeof id === 'string' ? parseInt(id) : id),
    enabled: !!id,
  });
};

export const useCreateJobRate = () => {
  const queryClient = useQueryClient();
  const { success, error } = useNotificationStore();

  return useMutation({
    mutationFn: (data: Partial<JobRate>) => jobRatesApi.createJobRate(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOB_RATES] });
      if (variables.product_id) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.PRODUCT(variables.product_id.toString()),
        });
      }
      success('Job rate created successfully');
    },
    onError: (err: Error) => {
      error(err.message || 'Failed to create job rate');
    },
  });
};

export const useUpdateJobRate = () => {
  const queryClient = useQueryClient();
  const { success, error } = useNotificationStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<JobRate> }) =>
      jobRatesApi.updateJobRate(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOB_RATES] });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.JOB_RATE(variables.id.toString()),
      });
      if (variables.data.product_id) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.PRODUCT(variables.data.product_id.toString()),
        });
      }
      success('Job rate updated successfully');
    },
    onError: (err: Error) => {
      error(err.message || 'Failed to update job rate');
    },
  });
};

export const useDeleteJobRate = () => {
  const queryClient = useQueryClient();
  const { success, error } = useNotificationStore();

  return useMutation({
    mutationFn: (id: number) => jobRatesApi.deleteJobRate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOB_RATES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS] });
      success('Job rate deleted successfully');
    },
    onError: (err: Error) => {
      error(err.message || 'Failed to delete job rate');
    },
  });
};
