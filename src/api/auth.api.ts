import apiClient from './axios';
import { API_ENDPOINTS } from '../constants';
import type { LoginCredentials, LoginResponse, User } from '../types';

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>(API_ENDPOINTS.LOGIN, credentials);
  return response.data;
};

export const register = async (data: Partial<User> & { password: string }): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>(API_ENDPOINTS.REGISTER, data);
  return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<User>(API_ENDPOINTS.ME);
  return response.data;
};
