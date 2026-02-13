import apiClient from './axios';
import { API_ENDPOINTS } from '../constants';

export interface DashboardStats {
  total_products: number;
  active_products: number;
  raw_materials_count: number;
  low_stock_count: number;
  parties_count: number;
  work_logs_today: number;
  work_logs_this_week: number;
}

export interface ProductionTrendItem {
  date: string;
  work_log_count: number;
  total_amount: number;
}

export interface ProductionTrendResponse {
  items: ProductionTrendItem[];
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await apiClient.get<DashboardStats>(API_ENDPOINTS.DASHBOARD_STATS);
  return response.data;
};

export const getProductionTrend = async (
  days: number = 7
): Promise<ProductionTrendResponse> => {
  const response = await apiClient.get<ProductionTrendResponse>(
    API_ENDPOINTS.DASHBOARD_PRODUCTION_TREND,
    { params: { days } }
  );
  return response.data;
};
