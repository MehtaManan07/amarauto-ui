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
import type { RawMaterial } from '../../../types';

const formatCurrency = (value: number | string | null | undefined) => {
  if (value === null || value === undefined) return '-';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (Number.isNaN(num)) return '-';
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
};

export interface RawMaterialInfoCardProps {
  rawMaterial: RawMaterial;
  title?: string;
}

export const RawMaterialInfoCard: React.FC<RawMaterialInfoCardProps> = ({
  rawMaterial,
  title = 'Raw Material Information',
}) => {
  const theme = useTheme();
  const isLowStock =
    rawMaterial.min_stock_req != null &&
    (rawMaterial.stock_qty ?? 0) < rawMaterial.min_stock_req;

  return (
    <Card
      sx={{
        borderRadius: 2,
        borderLeft: '4px solid',
        borderColor: theme.palette.primary.main,
        bgcolor: theme.palette.primary.main + '06',
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography variant="h6" sx={{ color: theme.palette.primary.dark }}>
            {title}
          </Typography>
          <Chip
            label={rawMaterial.is_active ? 'Active' : 'Inactive'}
            size="small"
            color={rawMaterial.is_active ? 'success' : 'default'}
            variant="outlined"
          />
          {isLowStock && (
            <Chip label="Low Stock" size="small" color="warning" variant="outlined" />
          )}
        </Box>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="caption" color="text.secondary">
              Name
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {rawMaterial.name}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="caption" color="text.secondary">
              Unit Type
            </Typography>
            <Typography variant="body1">{rawMaterial.unit_type || '-'}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="caption" color="text.secondary">
              Material Type
            </Typography>
            <Typography variant="body1">
              {rawMaterial.material_type || '-'}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="caption" color="text.secondary">
              Group
            </Typography>
            <Typography variant="body1">{rawMaterial.group || '-'}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="caption" color="text.secondary">
              Min Stock Req
            </Typography>
            <Typography variant="body1">
              {rawMaterial.min_stock_req ?? '-'}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="caption" color="text.secondary">
              Min Order Qty
            </Typography>
            <Typography variant="body1">
              {rawMaterial.min_order_qty ?? '-'}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="caption" color="text.secondary">
              Stock Qty
            </Typography>
            <Box sx={{ mt: 0.5 }}>
              <Chip
                label={rawMaterial.stock_qty ?? 0}
                size="small"
                color={
                  isLowStock
                    ? 'warning'
                    : (rawMaterial.stock_qty ?? 0) > 0
                    ? 'primary'
                    : 'default'
                }
                variant={
                  isLowStock || (rawMaterial.stock_qty ?? 0) > 0
                    ? 'filled'
                    : 'outlined'
                }
              />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="caption" color="text.secondary">
              Purchase Price
            </Typography>
            <Typography variant="body1">
              {formatCurrency(rawMaterial.purchase_price)}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="caption" color="text.secondary">
              GST
            </Typography>
            <Typography variant="body1">{rawMaterial.gst || '-'}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="caption" color="text.secondary">
              HSN Code
            </Typography>
            <Typography variant="body1">{rawMaterial.hsn || '-'}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="caption" color="text.secondary">
              Treat as Consume
            </Typography>
            <Typography variant="body1">
              {rawMaterial.treat_as_consume ? 'Yes' : 'No'}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="caption" color="text.secondary">
              Description
            </Typography>
            <Typography variant="body1">
              {rawMaterial.description || '-'}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="caption" color="text.secondary">
              Created
            </Typography>
            <Typography variant="body2">
              {rawMaterial.created_at
                ? new Date(rawMaterial.created_at).toLocaleString()
                : '-'}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="caption" color="text.secondary">
              Updated
            </Typography>
            <Typography variant="body2">
              {rawMaterial.updated_at
                ? new Date(rawMaterial.updated_at).toLocaleString()
                : '-'}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default RawMaterialInfoCard;
