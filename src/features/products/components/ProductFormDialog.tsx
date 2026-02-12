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
import type { Product } from '../../../types';
import { productFormSchema, type ProductFormData } from '../schemas/productSchema';
import { useProductFieldOptions } from '../../../hooks/useProducts';

interface ProductFormDialogProps {
  open: boolean;
  product?: Product | null;
  isLoading?: boolean;
  onSubmit: (data: Partial<Product>) => void;
  onClose: () => void;
}

export const ProductFormDialog: React.FC<ProductFormDialogProps> = ({
  open,
  product,
  isLoading = false,
  onSubmit,
  onClose,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isEditing = !!product;

  const { data: fieldOptions } = useProductFieldOptions(
    'category,group,unit_of_measure,model_name'
  );
  const categoryOptions = fieldOptions?.category ?? [];
  const groupOptions = fieldOptions?.group ?? [];
  const unitOfMeasureOptions = fieldOptions?.unit_of_measure ?? [];
  const modelNameOptions = fieldOptions?.model_name ?? [];

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema) as never,
    defaultValues: {
      part_no: '',
      name: '',
      category: '',
      group: '',
      model_name: '',
      mrp: '',
      distributor_price: '',
      dealer_price: '',
      retail_price: '',
      qty: '',
      unit_of_measure: '',
      gst: '',
      hsn: '',
      is_active: true,
    },
  });

  const isActive = watch('is_active');

  useEffect(() => {
    if (open) {
      if (product) {
        reset({
          part_no: product.part_no,
          name: product.name,
          category: product.category || '',
          group: product.group || '',
          model_name: product.model_name || '',
          mrp: product.mrp?.toString() || '',
          distributor_price: product.distributor_price?.toString() || '',
          dealer_price: product.dealer_price?.toString() || '',
          retail_price: product.retail_price?.toString() || '',
          qty: product.qty?.toString() || '',
          unit_of_measure: product.unit_of_measure || '',
          gst: product.gst?.toString() || '',
          hsn: product.hsn || '',
          is_active: product.is_active ?? true,
        });
      } else {
        reset({
          part_no: '',
          name: '',
          category: '',
          group: '',
          model_name: '',
          mrp: '',
          distributor_price: '',
          dealer_price: '',
          retail_price: '',
          qty: '',
          unit_of_measure: '',
          gst: '',
          hsn: '',
          is_active: true,
        });
      }
    }
  }, [open, product, reset]);

  const handleFormSubmit = (data: ProductFormData) => {
    const payload = {
      part_no: data.part_no,
      name: data.name,
      category: data.category || undefined,
      group: data.group || undefined,
      model_name: data.model_name || undefined,
      mrp: data.mrp ? parseFloat(data.mrp) : undefined,
      distributor_price: data.distributor_price
        ? parseFloat(data.distributor_price)
        : undefined,
      dealer_price: data.dealer_price ? parseFloat(data.dealer_price) : undefined,
      retail_price: data.retail_price ? parseFloat(data.retail_price) : undefined,
      qty: data.qty ? parseFloat(data.qty) : undefined,
      unit_of_measure: data.unit_of_measure || undefined,
      gst: data.gst || undefined,
      hsn: data.hsn || undefined,
      is_active: data.is_active ?? true,
    };
    onSubmit(payload as Partial<Product>);
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
        <DialogTitle>{isEditing ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...register('part_no')}
                label="Part No"
                error={!!errors.part_no}
                helperText={errors.part_no?.message}
                disabled={isLoading || isEditing}
                autoFocus={!isEditing}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...register('name')}
                label="Product Name"
                error={!!errors.name}
                helperText={errors.name?.message}
                disabled={isLoading}
                autoFocus={isEditing}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    freeSolo
                    options={categoryOptions}
                    value={field.value || null}
                    onChange={(_, value) => field.onChange(value ?? '')}
                    onInputChange={(_, value, reason) => {
                      if (reason === 'input') field.onChange(value);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Category"
                        error={!!errors.category}
                        helperText={errors.category?.message}
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
                      <TextField
                        {...params}
                        label="Group"
                        error={!!errors.group}
                        helperText={errors.group?.message}
                        disabled={isLoading}
                      />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid size={12}>
              <Controller
                name="model_name"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    freeSolo
                    options={modelNameOptions}
                    value={field.value || null}
                    onChange={(_, value) => field.onChange(value ?? '')}
                    onInputChange={(_, value, reason) => {
                      if (reason === 'input') field.onChange(value);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Model Name"
                        error={!!errors.model_name}
                        helperText={errors.model_name?.message}
                        disabled={isLoading}
                      />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...register('mrp')}
                label="MRP"
                type="number"
                inputProps={{ step: '0.01', min: 0 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
                error={!!errors.mrp}
                helperText={errors.mrp?.message}
                disabled={isLoading}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...register('distributor_price')}
                label="Distributor Price"
                type="number"
                inputProps={{ step: '0.01', min: 0 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
                error={!!errors.distributor_price}
                helperText={errors.distributor_price?.message}
                disabled={isLoading}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...register('dealer_price')}
                label="Dealer Price"
                type="number"
                inputProps={{ step: '0.01', min: 0 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
                error={!!errors.dealer_price}
                helperText={errors.dealer_price?.message}
                disabled={isLoading}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...register('retail_price')}
                label="Retail Price"
                type="number"
                inputProps={{ step: '0.01', min: 0 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
                error={!!errors.retail_price}
                helperText={errors.retail_price?.message}
                disabled={isLoading}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...register('qty')}
                label="Stock Qty"
                type="number"
                inputProps={{ step: '0.01', min: 0 }}
                error={!!errors.qty}
                helperText={errors.qty?.message}
                disabled={isLoading}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="unit_of_measure"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    freeSolo
                    options={unitOfMeasureOptions}
                    value={field.value || null}
                    onChange={(_, value) => field.onChange(value ?? '')}
                    onInputChange={(_, value, reason) => {
                      if (reason === 'input') field.onChange(value);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Unit of Measure"
                        placeholder="e.g., pcs, kg"
                        disabled={isLoading}
                      />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...register('gst')}
                label="GST %"
                type="number"
                inputProps={{ step: '0.01', min: 0 }}
                error={!!errors.gst}
                helperText={errors.gst?.message}
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
          <Button type="submit" variant="contained" disabled={isLoading} fullWidth={isMobile}>
            {isLoading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ProductFormDialog;
