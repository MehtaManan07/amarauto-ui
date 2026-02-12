import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Chip,
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
}) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Typography variant="h6">{title}</Typography>
        <Chip
          label={product.is_active ? 'Active' : 'Inactive'}
          size="small"
          color={product.is_active ? 'success' : 'default'}
          variant="outlined"
        />
      </Box>
      <Divider sx={{ mb: 2 }} />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Part No
          </Typography>
          <Typography variant="body1" fontFamily="monospace" fontWeight={600}>
            {product.part_no}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Name
          </Typography>
          <Typography variant="body1" fontWeight={600}>
            {product.name}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Category
          </Typography>
          <Typography variant="body1">{product.category || '-'}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Group
          </Typography>
          <Typography variant="body1">{product.group || '-'}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Model Name
          </Typography>
          <Typography variant="body1">{product.model_name || '-'}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            MRP
          </Typography>
          <Typography variant="body1">{formatCurrency(product.mrp)}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Distributor Price
          </Typography>
          <Typography variant="body1">
            {formatCurrency(product.distributor_price)}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Dealer Price
          </Typography>
          <Typography variant="body1">
            {formatCurrency(product.dealer_price)}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Retail Price
          </Typography>
          <Typography variant="body1">
            {formatCurrency(product.retail_price)}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Stock Qty
          </Typography>
          <Box sx={{ mt: 0.5 }}>
            <Chip
              label={product.qty ?? 0}
              size="small"
              color={(product.qty ?? 0) > 0 ? 'primary' : 'default'}
              variant={(product.qty ?? 0) > 0 ? 'filled' : 'outlined'}
            />
          </Box>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Unit of Measure
          </Typography>
          <Typography variant="body1">
            {product.unit_of_measure || '-'}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            GST
          </Typography>
          <Typography variant="body1">{product.gst ?? '-'}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            HSN Code
          </Typography>
          <Typography variant="body1">{product.hsn || '-'}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Created
          </Typography>
          <Typography variant="body2">
            {product.created_at
              ? new Date(product.created_at).toLocaleString()
              : '-'}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Updated
          </Typography>
          <Typography variant="body2">
            {product.updated_at
              ? new Date(product.updated_at).toLocaleString()
              : '-'}
          </Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
);
