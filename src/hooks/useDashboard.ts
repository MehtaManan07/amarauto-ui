import { useQuery } from '@tanstack/react-query';
import * as dashboardApi from '../api/dashboard.api';
import { QUERY_KEYS } from '../constants';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.DASHBOARD_STATS],
    queryFn: dashboardApi.getDashboardStats,
  });
};

export const useProductionTrend = (days: number = 7) => {
  return useQuery({
    queryKey: QUERY_KEYS.PRODUCTION_TREND(days),
    queryFn: () => dashboardApi.getProductionTrend(days),
  });
};
