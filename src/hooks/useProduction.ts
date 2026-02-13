import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as productionApi from '../api/production.api';
import { useNotificationStore } from '../stores/notificationStore';
import { QUERY_KEYS } from '../constants';
import type { StageCompletionData } from '../types';

export const useStageInventory = (
  productId?: number,
  variant?: string,
  stageNumber?: number
) => {
  return useQuery({
    queryKey: [
      QUERY_KEYS.STAGE_INVENTORY,
      productId,
      variant,
      stageNumber,
    ],
    queryFn: () =>
      productionApi.getStageInventory({
        product_id: productId,
        variant,
        stage_number: stageNumber,
      }),
  });
};

export const useMaterialsPreview = (
  productId: number | undefined,
  variant: string | undefined,
  stageNumber: number,
  quantity: number,
  enabled: boolean
) => {
  return useQuery({
    queryKey: QUERY_KEYS.MATERIALS_PREVIEW(
      productId ?? 0,
      variant,
      stageNumber,
      quantity
    ),
    queryFn: () =>
      productionApi.getMaterialsPreview(
        productId!,
        variant,
        stageNumber,
        quantity
      ),
    enabled: enabled && !!productId && quantity > 0,
  });
};

export const useCompleteStage = () => {
  const queryClient = useQueryClient();
  const { success, error } = useNotificationStore();

  return useMutation({
    mutationFn: (data: StageCompletionData) =>
      productionApi.completeStage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STAGE_INVENTORY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RAW_MATERIALS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STOCK_CHECK] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD_STATS] });
      success('Stage completed successfully');
    },
    onError: (err: Error) => {
      error(err.message || 'Failed to complete stage');
    },
  });
};
