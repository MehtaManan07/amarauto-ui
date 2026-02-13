import apiClient from './axios';
import { API_ENDPOINTS } from '../constants';
import type { User, QueryParams } from '../types';

export const getUsers = async (params?: QueryParams): Promise<User[]> => {
  const response = await apiClient.get<User[]>(API_ENDPOINTS.USERS, { params });
  return response.data;
};

export const getUser = async (id: number): Promise<User> => {
  const response = await apiClient.get<User>(API_ENDPOINTS.USER(id.toString()));
  return response.data;
};

export const createUser = async (data: Partial<User> & { password: string }): Promise<User> => {
  const response = await apiClient.post<User>(API_ENDPOINTS.USERS, data);
  return response.data;
};

export const updateUser = async (id: number, data: Partial<User> & { password?: string }): Promise<User> => {
  const response = await apiClient.patch<User>(API_ENDPOINTS.USER(id.toString()), data);
  return response.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await apiClient.delete(API_ENDPOINTS.USER(id.toString()));
};

export const getUsersByRole = async (roles: string[]): Promise<User[]> => {
  const params = new URLSearchParams();
  roles.forEach(role => params.append('role', role));
  const response = await apiClient.get<User[]>(`${API_ENDPOINTS.USERS_BY_ROLE}?${params.toString()}`);
  return response.data;
};
