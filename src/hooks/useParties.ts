import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as partiesApi from '../api/parties.api';
import { useNotificationStore } from '../stores/notificationStore';
import { QUERY_KEYS } from '../constants';
import type { Party } from '../types';

export interface PartiesParams {
  search?: string;
  state?: string;
  party_type?: string;
  page?: number;
  pageSize?: number;
}

export const usePartiesPaginated = (
  page: number = 1,
  pageSize: number = 25,
  params?: Omit<PartiesParams, 'page' | 'pageSize'>
) => {
  return useQuery({
    queryKey: [
      QUERY_KEYS.PARTIES,
      page,
      pageSize,
      params?.search,
      params?.state,
      params?.party_type,
    ],
    queryFn: () =>
      partiesApi.getPartiesPaginated(page, pageSize, {
        search: params?.search,
        state: params?.state,
        party_type: params?.party_type,
      }),
  });
};

export const useParty = (id: number | string) => {
  return useQuery({
    queryKey: QUERY_KEYS.PARTY(id.toString()),
    queryFn: () =>
      partiesApi.getParty(typeof id === 'string' ? parseInt(id) : id),
    enabled: !!id,
  });
};

export const useCreateParty = () => {
  const queryClient = useQueryClient();
  const { success, error } = useNotificationStore();

  return useMutation({
    mutationFn: (data: Partial<Party>) => partiesApi.createParty(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PARTIES] });
      success('Party created successfully');
    },
    onError: (err: Error) => {
      error(err.message || 'Failed to create party');
    },
  });
};

export const useUpdateParty = () => {
  const queryClient = useQueryClient();
  const { success, error } = useNotificationStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Party> }) =>
      partiesApi.updateParty(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PARTIES] });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PARTY(variables.id.toString()),
      });
      success('Party updated successfully');
    },
    onError: (err: Error) => {
      error(err.message || 'Failed to update party');
    },
  });
};

export const useDeleteParty = () => {
  const queryClient = useQueryClient();
  const { success, error } = useNotificationStore();

  return useMutation({
    mutationFn: (id: number) => partiesApi.deleteParty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PARTIES] });
      success('Party deleted successfully');
    },
    onError: (err: Error) => {
      error(err.message || 'Failed to delete party');
    },
  });
};

export const usePartyFieldOptions = (fields?: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.PARTIES_FIELD_OPTIONS(fields ?? 'state,party_type'),
    queryFn: () => partiesApi.getPartyFieldOptions(fields),
  });
};
