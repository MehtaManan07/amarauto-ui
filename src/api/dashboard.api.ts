import apiClient from './axios';
import { API_ENDPOINTS } from '../constants';

export interface DashboardStats {
  total_products: number;
  active_products: number;
  raw_materials_count: number;
  low_stock_count: number;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await apiClient.get<DashboardStats>(API_ENDPOINTS.DASHBOARD_STATS);
  return response.data;
};
