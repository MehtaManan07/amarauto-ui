import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as usersApi from '../api/users.api';
import { useNotificationStore } from '../stores/notificationStore';
import { QUERY_KEYS } from '../constants';
import type { User, QueryParams } from '../types';

export const useUsers = (params?: QueryParams) => {
  return useQuery({
    queryKey: [QUERY_KEYS.USERS, params],
    queryFn: () => usersApi.getUsers(params),
  });
};

export const useUser = (id: number | string) => {
  return useQuery({
    queryKey: QUERY_KEYS.USER(id.toString()),
    queryFn: () => usersApi.getUser(typeof id === 'string' ? parseInt(id) : id),
    enabled: !!id,
  });
};

export const useUsersByRole = (roles: string[]) => {
  return useQuery({
    queryKey: QUERY_KEYS.USERS_BY_ROLE(roles),
    queryFn: () => usersApi.getUsersByRole(roles),
    enabled: roles.length > 0,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  const { success, error } = useNotificationStore();

  return useMutation({
    mutationFn: (data: Partial<User> & { password: string }) => usersApi.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] });
      success('User created successfully');
    },
    onError: (err: Error) => {
      error(err.message || 'Failed to create user');
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const { success, error } = useNotificationStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<User> & { password?: string } }) =>
      usersApi.updateUser(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER(variables.id.toString()) });
      success('User updated successfully');
    },
    onError: (err: Error) => {
      error(err.message || 'Failed to update user');
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  const { success, error } = useNotificationStore();

  return useMutation({
    mutationFn: (id: number) => usersApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] });
      success('User deleted successfully');
    },
    onError: (err: Error) => {
      error(err.message || 'Failed to delete user');
    },
  });
};
