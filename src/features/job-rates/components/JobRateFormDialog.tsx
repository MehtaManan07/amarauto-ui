import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Autocomplete,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { JobRate, Product } from '../../../types';
import {
  jobRateFormSchema,
  type JobRateFormData,
} from '../schemas/jobRateSchema';
import { useProductSearch } from '../../../hooks/useProducts';

interface JobRateFormDialogProps {
  open: boolean;
  jobRate?: JobRate | null;
  initialProductId?: number;
  isLoading?: boolean;
  onSubmit: (data: Partial<JobRate>) => void;
  onClose: () => void;
}

export const JobRateFormDialog: React.FC<JobRateFormDialogProps> = ({
  open,
  jobRate,
  initialProductId,
  isLoading = false,
  onSubmit,
  onClose,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isEditing = !!jobRate;

  const [productSearch, setProductSearch] = useState('');

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<JobRateFormData>({
    resolver: zodResolver(jobRateFormSchema) as never,
    defaultValues: {
      product_id: 0,
      operation_code: '',
      operation_name: '',
      rate: 0,
      sequence: 0,
    },
  });

  const watchedProductId = watch('product_id');
  const { options: productOptions, isLoading: productsLoading } = useProductSearch(
    productSearch,
    watchedProductId || undefined
  );

  useEffect(() => {
    if (open) {
      setProductSearch('');
      if (jobRate) {
        reset({
          product_id: jobRate.product_id,
          operation_code: jobRate.operation_code,
          operation_name: jobRate.operation_name,
          rate: jobRate.rate ?? 0,
          sequence: jobRate.sequence ?? 0,
        });
      } else {
        reset({
          product_id: initialProductId ?? 0,
          operation_code: '',
          operation_name: '',
          rate: 0,
          sequence: 0,
        });
      }
    }
  }, [open, jobRate, initialProductId, reset]);

  const handleFormSubmit = (data: JobRateFormData) => {
    const payload = {
      product_id: data.product_id,
      operation_code: data.operation_code.trim(),
      operation_name: data.operation_name.trim(),
      rate: data.rate,
      sequence: data.sequence,
    };
    onSubmit(payload as Partial<JobRate>);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogTitle>
          {isEditing ? 'Edit Job Rate' : 'Add Job Rate'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={12}>
              <Controller
                name="product_id"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    options={productOptions}
                    getOptionLabel={(opt) =>
                      typeof opt === 'object' && opt
                        ? `${(opt as Product).part_no} - ${(opt as Product).name}`
                        : ''
                    }
                    value={
                      field.value
                        ? (productOptions.find((p) => p.id === field.value) ?? null)
                        : null
                    }
                    onChange={(_, value) => {
                      field.onChange((value as Product)?.id ?? 0);
                      setProductSearch('');
                    }}
                    onInputChange={(_, value, reason) => {
                      if (reason === 'input') setProductSearch(value);
                    }}
                    filterOptions={(x) => x}
                    loading={productsLoading}
                    isOptionEqualToValue={(opt, val) =>
                      (opt as Product).id === (val as Product)?.id
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Product"
                        error={!!errors.product_id}
                        helperText={errors.product_id?.message}
                        disabled={isLoading}
                      />
                    )}
                    disabled={isLoading}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="operation_code"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Operation Code"
                    error={!!errors.operation_code}
                    helperText={errors.operation_code?.message}
                    disabled={isLoading}
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="operation_name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Operation Name"
                    error={!!errors.operation_name}
                    helperText={errors.operation_name?.message}
                    disabled={isLoading}
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="rate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === ''
                          ? ''
                          : parseFloat(e.target.value) || 0
                      )
                    }
                    label="Rate"
                    type="number"
                    inputProps={{ step: '0.01', min: 0 }}
                    error={!!errors.rate}
                    helperText={errors.rate?.message}
                    disabled={isLoading}
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="sequence"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === ''
                          ? ''
                          : parseInt(e.target.value, 10) || 0
                      )
                    }
                    label="Sequence"
                    type="number"
                    inputProps={{ min: 0 }}
                    error={!!errors.sequence}
                    helperText={errors.sequence?.message}
                    disabled={isLoading}
                    fullWidth
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: 2, gap: 1 }}>
          <Button onClick={onClose} disabled={isLoading} fullWidth={isMobile}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            fullWidth={isMobile}
          >
            {isLoading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default JobRateFormDialog;
