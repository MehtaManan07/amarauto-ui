import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  InputAdornment,
  Switch,
  FormControlLabel,
  Autocomplete,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { RawMaterial } from '../../../types';
import {
  rawMaterialFormSchema,
  type RawMaterialFormData,
} from '../schemas/rawMaterialSchema';
import { useFieldOptions } from '../../../hooks/useRawMaterials';

interface RawMaterialFormDialogProps {
  open: boolean;
  rawMaterial?: RawMaterial | null;
  isLoading?: boolean;
  onSubmit: (data: Partial<RawMaterial>) => void;
  onClose: () => void;
}

export const RawMaterialFormDialog: React.FC<RawMaterialFormDialogProps> = ({
  open,
  rawMaterial,
  isLoading = false,
  onSubmit,
  onClose,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isEditing = !!rawMaterial;

  const { data: fieldOptions } = useFieldOptions('unit_type,material_type,group');
  const unitTypeOptions = fieldOptions?.unit_type ?? [];
  const materialTypeOptions = fieldOptions?.material_type ?? [];
  const groupOptions = fieldOptions?.group ?? [];

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RawMaterialFormData>({
    resolver: zodResolver(rawMaterialFormSchema) as never,
    defaultValues: {
      name: '',
      unit_type: '',
      material_type: '',
      group: '',
      min_stock_req: '',
      min_order_qty: '',
      stock_qty: '0',
      purchase_price: '',
      gst: '',
      hsn: '',
      description: '',
      treat_as_consume: false,
      is_active: true,
    },
  });

  const isActive = watch('is_active');
  const treatAsConsume = watch('treat_as_consume');

  useEffect(() => {
    if (open) {
      if (rawMaterial) {
        reset({
          name: rawMaterial.name,
          unit_type: rawMaterial.unit_type || '',
          material_type: rawMaterial.material_type || '',
          group: rawMaterial.group || '',
          min_stock_req: rawMaterial.min_stock_req?.toString() || '',
          min_order_qty: rawMaterial.min_order_qty?.toString() || '',
          stock_qty: rawMaterial.stock_qty?.toString() || '0',
          purchase_price: rawMaterial.purchase_price?.toString() || '',
          gst: rawMaterial.gst || '',
          hsn: rawMaterial.hsn || '',
          description: rawMaterial.description || '',
          treat_as_consume: rawMaterial.treat_as_consume ?? false,
          is_active: rawMaterial.is_active ?? true,
        });
      } else {
        reset({
          name: '',
          unit_type: '',
          material_type: '',
          group: '',
          min_stock_req: '',
          min_order_qty: '',
          stock_qty: '0',
          purchase_price: '',
          gst: '',
          hsn: '',
          description: '',
          treat_as_consume: false,
          is_active: true,
        });
      }
    }
  }, [open, rawMaterial, reset]);

  const handleFormSubmit = (data: RawMaterialFormData) => {
    const payload = {
      name: data.name,
      unit_type: data.unit_type,
      material_type: data.material_type || undefined,
      group: data.group || undefined,
      min_stock_req: data.min_stock_req ? parseFloat(data.min_stock_req) : undefined,
      min_order_qty: data.min_order_qty ? parseFloat(data.min_order_qty) : undefined,
      stock_qty: data.stock_qty ? parseFloat(data.stock_qty) : 0,
      purchase_price: data.purchase_price
        ? parseFloat(data.purchase_price)
        : undefined,
      gst: data.gst || undefined,
      hsn: data.hsn || undefined,
      description: data.description || undefined,
      treat_as_consume: data.treat_as_consume ?? false,
      is_active: data.is_active ?? true,
    };
    onSubmit(payload as Partial<RawMaterial>);
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
          {isEditing ? 'Edit Raw Material' : 'Add Raw Material'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...register('name')}
                label="Name"
                error={!!errors.name}
                helperText={errors.name?.message}
                disabled={isLoading}
                autoFocus
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="unit_type"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    freeSolo
                    options={unitTypeOptions}
                    value={field.value || null}
                    onChange={(_, value) => field.onChange(value ?? '')}
                    onInputChange={(_, value, reason) => {
                      if (reason === 'input') field.onChange(value);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Unit Type"
                        error={!!errors.unit_type}
                        helperText={errors.unit_type?.message}
                        disabled={isLoading}
                      />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="material_type"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    freeSolo
                    options={materialTypeOptions}
                    value={field.value || null}
                    onChange={(_, value) => field.onChange(value ?? '')}
                    onInputChange={(_, value, reason) => {
                      if (reason === 'input') field.onChange(value);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Material Type"
                        disabled={isLoading}
                      />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="group"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    freeSolo
                    options={groupOptions}
                    value={field.value || null}
                    onChange={(_, value) => field.onChange(value ?? '')}
                    onInputChange={(_, value, reason) => {
                      if (reason === 'input') field.onChange(value);
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="Group" disabled={isLoading} />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...register('min_stock_req')}
                label="Min Stock Req"
                type="number"
                inputProps={{ step: '0.01', min: 0 }}
                error={!!errors.min_stock_req}
                helperText={errors.min_stock_req?.message}
                disabled={isLoading}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...register('min_order_qty')}
                label="Min Order Qty"
                type="number"
                inputProps={{ step: '0.01', min: 0 }}
                error={!!errors.min_order_qty}
                helperText={errors.min_order_qty?.message}
                disabled={isLoading}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...register('stock_qty')}
                label="Stock Qty"
                type="number"
                inputProps={{ step: '0.01', min: 0 }}
                error={!!errors.stock_qty}
                helperText={errors.stock_qty?.message}
                disabled={isLoading}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...register('purchase_price')}
                label="Purchase Price"
                type="number"
                inputProps={{ step: '0.01', min: 0 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">₹</InputAdornment>
                  ),
                }}
                error={!!errors.purchase_price}
                helperText={errors.purchase_price?.message}
                disabled={isLoading}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...register('gst')}
                label="GST"
                disabled={isLoading}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...register('hsn')}
                label="HSN Code"
                disabled={isLoading}
                fullWidth
              />
            </Grid>
            <Grid size={12}>
              <TextField
                {...register('description')}
                label="Description"
                multiline
                rows={2}
                disabled={isLoading}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={treatAsConsume ?? false}
                    onChange={(e) =>
                      setValue('treat_as_consume', e.target.checked)
                    }
                    disabled={isLoading}
                  />
                }
                label="Treat as Consume"
                sx={{ mt: 1 }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isActive ?? true}
                    onChange={(e) => setValue('is_active', e.target.checked)}
                    disabled={isLoading}
                  />
                }
                label="Active"
                sx={{ mt: 1 }}
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

export default RawMaterialFormDialog;
