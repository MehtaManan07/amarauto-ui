import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Autocomplete,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
} from '@mui/material';
import { Calculate as CalculateIcon } from '@mui/icons-material';
import { useProductSearch } from '../../../hooks/useProducts';
import { useBOMVariants, useProductionCalc } from '../../../hooks/useBOM';
import type { Product } from '../../../types';

export const ProductionCalculator: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  const [productSearch, setProductSearch] = useState('');
  const { options: productOptions, isLoading: productsLoading } = useProductSearch(productSearch, selectedProduct?.id);
  const { data: variants = [] } = useBOMVariants(selectedProduct?.id);
  const { data: calcResult, isLoading } = useProductionCalc(
    selectedProduct?.id,
    selectedVariant ?? undefined,
    quantity
  );

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null) return '-';
    return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalculateIcon />
          Production Calculator
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Select a product and quantity to calculate material requirements and order costs.
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            alignItems: 'flex-end',
            mb: 2,
          }}
        >
          <Autocomplete
            sx={{ minWidth: 280 }}
            options={productOptions}
            getOptionLabel={(opt) => (opt ? `${opt.part_no} - ${opt.name}` : '')}
            value={selectedProduct}
            onChange={(_, value) => {
              setSelectedProduct(value);
              setSelectedVariant(null);
              setProductSearch('');
            }}
            onInputChange={(_, value, reason) => {
              if (reason === 'input') setProductSearch(value);
            }}
            filterOptions={(x) => x}
            loading={productsLoading}
            isOptionEqualToValue={(a, b) => a?.id === b?.id}
            renderInput={(params) => (
              <TextField {...params} label="Product" size="small" />
            )}
          />
          <Autocomplete
            freeSolo
            sx={{ minWidth: 180 }}
            options={variants}
            value={selectedVariant}
            onChange={(_, value) =>
              setSelectedVariant(typeof value === 'string' ? value : value)
            }
            renderInput={(params) => (
              <TextField {...params} label="Variant (optional)" size="small" />
            )}
          />
          <TextField
            size="small"
            label="Quantity"
            type="number"
            value={quantity}
            onChange={(e) =>
              setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))
            }
            inputProps={{ min: 1 }}
            sx={{ width: 120 }}
          />
        </Box>

        {isLoading && selectedProduct && quantity > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <CircularProgress size={24} />
            <Typography variant="body2" color="text.secondary">
              Calculating...
            </Typography>
          </Box>
        )}

        {calcResult && !isLoading && (
          <Box>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
                mb: 2,
                alignItems: 'center',
              }}
            >
              <Chip
                label={`Max producible: ${calcResult.max_producible_units} units`}
                color={
                  calcResult.max_producible_units >= quantity
                    ? 'success'
                    : 'warning'
                }
                variant="outlined"
              />
              <Chip
                label={`Total order cost: ${formatCurrency(calcResult.total_order_cost)}`}
                color="primary"
                variant="outlined"
              />
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Material</TableCell>
                    <TableCell align="right">Needed</TableCell>
                    <TableCell align="right">Have</TableCell>
                    <TableCell align="right">To Order</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="right">Unit Price</TableCell>
                    <TableCell align="right">Order Cost</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {calcResult.lines.map((line, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{line.raw_material_name}</TableCell>
                      <TableCell align="right">{line.needed_qty}</TableCell>
                      <TableCell align="right">{line.current_stock}</TableCell>
                      <TableCell align="right">{line.shortage}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={line.status}
                          size="small"
                          color={line.status === 'ok' ? 'success' : 'warning'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(line.purchase_price)}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(line.order_cost)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {calcResult && calcResult.lines.some((l) => l.status === 'low') && (
          <Typography variant="body2" color="warning.main" sx={{ mt: 2 }}>
            Some materials are low. Consider placing orders before production.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductionCalculator;
