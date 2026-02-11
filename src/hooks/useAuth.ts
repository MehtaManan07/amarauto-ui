import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as authApi from '../api/auth.api';
import { useAuthStore } from '../stores/authStore';
import { useNotificationStore } from '../stores/notificationStore';
import { QUERY_KEYS } from '../constants';
import type { LoginCredentials, User } from '../types';

export const useCurrentUser = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: [QUERY_KEYS.CURRENT_USER],
    queryFn: authApi.getCurrentUser,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
};

export const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const queryClient = useQueryClient();
  const { error: showError } = useNotificationStore();

  return useMutation({
    mutationFn: (data: LoginCredentials) => authApi.login(data),
    onSuccess: (response) => {
      setAuth(response.token.access_token, response.user);
      queryClient.setQueryData([QUERY_KEYS.CURRENT_USER], response.user);
    },
    onError: (err: Error) => {
      showError(err.message || 'Login failed');
    },
  });
};

export const useRegister = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const queryClient = useQueryClient();
  const { error: showError } = useNotificationStore();

  return useMutation({
    mutationFn: (data: Partial<User> & { password: string }) => authApi.register(data),
    onSuccess: (response) => {
      setAuth(response.token.access_token, response.user);
      queryClient.setQueryData([QUERY_KEYS.CURRENT_USER], response.user);
    },
    onError: (err: Error) => {
      showError(err.message || 'Registration failed');
    },
  });
};

export const useLogout = () => {
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();

  return () => {
    logout();
    queryClient.clear();
  };
};
