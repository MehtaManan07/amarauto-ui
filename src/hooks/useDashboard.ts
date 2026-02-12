import { useQuery } from '@tanstack/react-query';
import * as dashboardApi from '../api/dashboard.api';
import { QUERY_KEYS } from '../constants';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.DASHBOARD_STATS],
    queryFn: dashboardApi.getDashboardStats,
  });
};
