import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Chip,
  useTheme,
  Grid,
} from '@mui/material';
import type { Product } from '../../../types';

const formatCurrency = (value: number | string | null | undefined) => {
  if (value === null || value === undefined) return '-';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (Number.isNaN(num)) return '-';
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
};

export interface ProductInfoCardProps {
  product: Product;
  title?: string;
}

export const ProductInfoCard: React.FC<ProductInfoCardProps> = ({
  product,
  title = 'Product Information',
}) => {
  const theme = useTheme();
  return (
    <Card
      sx={{
        borderRadius: 2,
        borderLeft: '4px solid',
        borderColor: theme.palette.primary.main,
        bgcolor: theme.palette.primary.light,
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography variant="h6" sx={{ color: theme.palette.text.primary }}>
            {title}
          </Typography>
        <Chip
          label={product.is_active ? 'Active' : 'Inactive'}
          size="small"
          color={product.is_active ? 'success' : 'default'}
          variant="outlined"
        />
      </Box>
      <Divider sx={{ mb: 2 }} />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Typography variant="caption" color="text.secondary">Part No</Typography>
          <Typography variant="body1" fontFamily="monospace" fontWeight={600}>
            {product.part_no}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Typography variant="caption" color="text.secondary">Name</Typography>
          <Typography variant="body1" fontWeight={600}>{product.name}</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Typography variant="caption" color="text.secondary">Category</Typography>
          <Typography variant="body1">{product.category || '-'}</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Typography variant="caption" color="text.secondary">Group</Typography>
          <Typography variant="body1">{product.group || '-'}</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Typography variant="caption" color="text.secondary">Model Name</Typography>
          <Typography variant="body1">{product.model_name || '-'}</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Typography variant="caption" color="text.secondary">MRP</Typography>
          <Typography variant="body1">{formatCurrency(product.mrp)}</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Typography variant="caption" color="text.secondary">Distributor Price</Typography>
          <Typography variant="body1">{formatCurrency(product.distributor_price)}</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Typography variant="caption" color="text.secondary">Dealer Price</Typography>
          <Typography variant="body1">{formatCurrency(product.dealer_price)}</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Typography variant="caption" color="text.secondary">Retail Price</Typography>
          <Typography variant="body1">{formatCurrency(product.retail_price)}</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Typography variant="caption" color="text.secondary">Stock Qty</Typography>
          <Box sx={{ mt: 0.5 }}>
            <Chip
              label={product.qty ?? 0}
              size="small"
              color={(product.qty ?? 0) > 0 ? 'primary' : 'default'}
              variant={(product.qty ?? 0) > 0 ? 'filled' : 'outlined'}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Typography variant="caption" color="text.secondary">Unit of Measure</Typography>
          <Typography variant="body1">{product.unit_of_measure || '-'}</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Typography variant="caption" color="text.secondary">GST</Typography>
          <Typography variant="body1">{product.gst ?? '-'}</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Typography variant="caption" color="text.secondary">HSN Code</Typography>
          <Typography variant="body1">{product.hsn || '-'}</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Typography variant="caption" color="text.secondary">Created</Typography>
          <Typography variant="body2">
            {product.created_at
              ? new Date(product.created_at).toLocaleString()
              : '-'}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Typography variant="caption" color="text.secondary">Updated</Typography>
          <Typography variant="body2">
            {product.updated_at
              ? new Date(product.updated_at).toLocaleString()
              : '-'}
          </Typography>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
  );
};
