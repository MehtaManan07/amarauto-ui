import React, { useEffect } from 'react';
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
import type { BOMLine, Product, RawMaterial } from '../../../types';
import {
  bomLineFormSchema,
  type BOMLineFormData,
} from '../schemas/bomLineSchema';
import { useProducts } from '../../../hooks/useProducts';
import { useRawMaterials } from '../../../hooks/useRawMaterials';

interface BOMLineFormDialogProps {
  open: boolean;
  bomLine?: BOMLine | null;
  isLoading?: boolean;
  onSubmit: (data: Partial<BOMLine>) => void;
  onClose: () => void;
}

export const BOMLineFormDialog: React.FC<BOMLineFormDialogProps> = ({
  open,
  bomLine,
  isLoading = false,
  onSubmit,
  onClose,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isEditing = !!bomLine;

  const { data: products = [] } = useProducts({ page: 1, page_size: 500 });
  const { data: rawMaterials = [] } = useRawMaterials({ page: 1, page_size: 500 });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BOMLineFormData>({
    resolver: zodResolver(bomLineFormSchema) as never,
    defaultValues: {
      product_id: 0,
      raw_material_id: 0,
      variant: '',
      batch_qty: 1,
      raw_qty: 0,
    },
  });

  useEffect(() => {
    if (open) {
      if (bomLine) {
        reset({
          product_id: bomLine.product_id,
          raw_material_id: bomLine.raw_material_id,
          variant: bomLine.variant || '',
          batch_qty: bomLine.batch_qty ?? 1,
          raw_qty: bomLine.raw_qty ?? 0,
        });
      } else {
        reset({
          product_id: 0,
          raw_material_id: 0,
          variant: '',
          batch_qty: 1,
          raw_qty: 0,
        });
      }
    }
  }, [open, bomLine, reset]);

  const handleFormSubmit = (data: BOMLineFormData) => {
    const payload = {
      product_id: data.product_id,
      raw_material_id: data.raw_material_id,
      variant: data.variant?.trim() || undefined,
      batch_qty: data.batch_qty,
      raw_qty: data.raw_qty,
    };
    onSubmit(payload as Partial<BOMLine>);
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
          {isEditing ? 'Edit BOM Line' : 'Add BOM Line'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={12}>
              <Controller
                name="product_id"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    options={products}
                    getOptionLabel={(opt) =>
                      typeof opt === 'object' && opt
                        ? `${(opt as Product).part_no} - ${(opt as Product).name}`
                        : ''
                    }
                    value={
                      field.value
                        ? (products.find((p) => p.id === field.value) ?? null)
                        : null
                    }
                    onChange={(_, value) =>
                      field.onChange((value as Product)?.id ?? 0)
                    }
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
            <Grid size={12}>
              <Controller
                name="raw_material_id"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    options={rawMaterials}
                    getOptionLabel={(opt) =>
                      typeof opt === 'object' && opt
                        ? (opt as RawMaterial).name
                        : ''
                    }
                    value={
                      field.value
                        ? (rawMaterials.find((r) => r.id === field.value) ?? null)
                        : null
                    }
                    onChange={(_, value) =>
                      field.onChange((value as RawMaterial)?.id ?? 0)
                    }
                    isOptionEqualToValue={(opt, val) =>
                      (opt as RawMaterial).id === (val as RawMaterial)?.id
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Raw Material"
                        error={!!errors.raw_material_id}
                        helperText={errors.raw_material_id?.message}
                        disabled={isLoading}
                      />
                    )}
                    disabled={isLoading}
                  />
                )}
              />
            </Grid>
            <Grid size={12}>
              <Controller
                name="variant"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Variant (e.g. colour)"
                    error={!!errors.variant}
                    helperText={errors.variant?.message}
                    disabled={isLoading}
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="batch_qty"
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
                    label="Batch Qty"
                    type="number"
                    inputProps={{ step: '0.01', min: 0 }}
                    error={!!errors.batch_qty}
                    helperText={errors.batch_qty?.message}
                    disabled={isLoading}
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="raw_qty"
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
                    label="Raw Qty"
                    type="number"
                    inputProps={{ step: '0.01', min: 0 }}
                    error={!!errors.raw_qty}
                    helperText={errors.raw_qty?.message}
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

export default BOMLineFormDialog;
