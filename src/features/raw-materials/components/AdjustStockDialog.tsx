import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const adjustStockSchema = z.object({
  quantity_delta: z
    .string()
    .min(1, 'Quantity is required')
    .refine((v) => {
      const n = parseFloat(v);
      return !Number.isNaN(n) && n !== 0;
    }, 'Enter a non-zero number (positive to add, negative to remove)'),
  notes: z.string().optional(),
});

type AdjustStockFormData = z.infer<typeof adjustStockSchema>;

interface AdjustStockDialogProps {
  open: boolean;
  rawMaterialName: string;
  currentStock: number;
  isLoading?: boolean;
  onSubmit: (quantityDelta: number, notes?: string) => void;
  onClose: () => void;
}

export const AdjustStockDialog: React.FC<AdjustStockDialogProps> = ({
  open,
  rawMaterialName,
  currentStock,
  isLoading = false,
  onSubmit,
  onClose,
}) => {
  const { control, handleSubmit, reset } = useForm<AdjustStockFormData>({
    resolver: zodResolver(adjustStockSchema) as never,
    defaultValues: {
      quantity_delta: '',
      notes: '',
    },
  });

  const handleFormSubmit = (data: AdjustStockFormData) => {
    const delta = parseFloat(data.quantity_delta);
    onSubmit(delta, data.notes || undefined);
    reset();
    // Parent closes dialog on mutation success
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogTitle>Adjust Stock</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                {rawMaterialName}
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                Current stock: {currentStock}
              </Typography>
            </Box>
            <Controller
              name="quantity_delta"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Quantity Delta"
                  type="number"
                  placeholder="e.g. 10 to add, -5 to remove"
                  inputProps={{ step: '0.01' }}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  disabled={isLoading}
                  fullWidth
                />
              )}
            />
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Notes (optional)"
                  multiline
                  rows={2}
                  disabled={isLoading}
                  fullWidth
                />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: 2, gap: 1 }}>
          <Button onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {isLoading ? 'Adjusting...' : 'Adjust Stock'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AdjustStockDialog;
