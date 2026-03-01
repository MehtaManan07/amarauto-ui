import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Autocomplete,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Box,
  Alert,
  useTheme,
  CircularProgress,
} from '@mui/material';
import { Check as CheckIcon, Warning as WarningIcon } from '@mui/icons-material';
import { useProductSearch } from '../../../hooks/useProducts';
import { useBOMVariants } from '../../../hooks/useBOM';
import {
  useCompleteStage,
  useMaterialsPreview,
} from '../../../hooks/useProduction';
import type { Product, StageInventory } from '../../../types';

interface CompleteStageDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  prefill?: StageInventory | null;
}

const STAGE_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export const CompleteStageDialog: React.FC<CompleteStageDialogProps> = ({
  open,
  onClose,
  onSuccess,
  prefill,
}) => {
  const theme = useTheme();
  const [product, setProduct] = useState<Product | null>(null);
  const [variant, setVariant] = useState<string | null>(null);
  const [stageNumber, setStageNumber] = useState<number>(1);
  const [quantity, setQuantity] = useState<number>(0);
  const [productSearch, setProductSearch] = useState('');

  const { options: productOptions, isLoading: productsLoading } = useProductSearch(
    productSearch,
    product?.id ?? (open && prefill ? prefill.product_id : undefined)
  );
  const { data: variants = [] } = useBOMVariants(product?.id);
  const { data: materialsPreview, isLoading: materialsLoading } =
    useMaterialsPreview(
      product?.id,
      variant ?? undefined,
      stageNumber,
      quantity,
      open && !!product && quantity > 0
    );

  const completeMutation = useCompleteStage();

  useEffect(() => {
    if (open) {
      setProductSearch('');
      if (prefill) {
        setVariant(prefill.variant ?? null);
        setStageNumber(prefill.stage_number + 1);
        setQuantity(Number(prefill.quantity) || 0);
      } else {
        setProduct(null);
        setVariant(null);
        setStageNumber(1);
        setQuantity(0);
      }
    }
  }, [open, prefill]);

  // Resolve prefill product from search options once available
  useEffect(() => {
    if (open && prefill && !product && productOptions.length > 0) {
      const p = productOptions.find((x) => x.id === prefill.product_id);
      if (p) setProduct(p);
    }
  }, [open, prefill, product, productOptions]);

  const variantOptions =
    variants.length > 0
      ? variant && !variants.includes(variant)
        ? [variant, ...variants]
        : variants
      : variant
        ? [variant]
        : ['Default'];

  const handleSubmit = () => {
    if (!product || quantity <= 0) return;
    completeMutation.mutate(
      {
        product_id: product.id,
        variant: variant ?? undefined,
        stage_number: stageNumber,
        quantity,
      },
      {
        onSuccess: () => onSuccess(),
      }
    );
  };

  const hasLowStock =
    materialsPreview?.materials.some((m) => m.status === 'low') ?? false;
  const hasInsufficientPrev =
    (materialsPreview?.previous_stage_qty ?? 0) < quantity && stageNumber > 1;

  const canSubmit =
    product &&
    quantity > 0 &&
    !completeMutation.isPending &&
    !hasInsufficientPrev;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Complete Stage</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <Autocomplete
            options={productOptions}
            getOptionLabel={(p) => (p ? `${p.part_no} - ${p.name}` : '')}
            value={product}
            onChange={(_, v) => {
              setProduct(v);
              setProductSearch('');
            }}
            onInputChange={(_, value, reason) => {
              if (reason === 'input') setProductSearch(value);
            }}
            filterOptions={(x) => x}
            loading={productsLoading}
            isOptionEqualToValue={(a, b) => a?.id === b?.id}
            renderInput={(params) => (
              <TextField {...params} label="Product" required />
            )}
          />

          <Autocomplete
            options={variantOptions}
            value={variant ?? (variants.length === 0 ? 'Default' : null)}
            onChange={(_, v) =>
              setVariant(v === 'Default' || !v ? null : String(v))
            }
            renderInput={(params) => (
              <TextField {...params} label="Variant" placeholder="Default" />
            )}
          />

          <Autocomplete
            options={STAGE_OPTIONS}
            getOptionLabel={(n) => `Stage ${n}`}
            value={stageNumber}
            onChange={(_, v) => setStageNumber(v ?? 1)}
            renderInput={(params) => (
              <TextField {...params} label="Stage" required />
            )}
          />

          <TextField
            label="Quantity"
            type="number"
            value={quantity || ''}
            onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
            inputProps={{ min: 0.01, step: 1 }}
            required
          />

          {materialsPreview && product && quantity > 0 && (
            <>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 1 }}>
                Materials Required (from BOM)
              </Typography>
              {materialsLoading ? (
                <Typography variant="body2" color="text.secondary">
                  Loading...
                </Typography>
              ) : materialsPreview.materials.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No materials configured for this stage. Add BOM lines with
                  stage_number={stageNumber}.
                </Typography>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: theme.palette.table.header }}>
                      <TableCell>Material</TableCell>
                      <TableCell align="right">Need</TableCell>
                      <TableCell align="right">Stock</TableCell>
                      <TableCell align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {materialsPreview.materials.map((m) => (
                      <TableRow key={m.raw_material_id}>
                        <TableCell>{m.raw_material_name}</TableCell>
                        <TableCell align="right">
                          {m.needed_qty} {m.unit_type}
                        </TableCell>
                        <TableCell align="right">{m.current_stock}</TableCell>
                        <TableCell align="center">
                          {m.status === 'ok' ? (
                            <CheckIcon color="success" fontSize="small" />
                          ) : (
                            <WarningIcon color="warning" fontSize="small" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {stageNumber > 1 && (
                <Typography variant="body2" color="text.secondary">
                  From previous stage: {materialsPreview.previous_stage_qty ?? 0}{' '}
                  units available
                </Typography>
              )}

              {hasLowStock && (
                <Alert severity="warning">
                  Some materials are low. Complete anyway?
                </Alert>
              )}

              {hasInsufficientPrev && (
                <Alert severity="error">
                  Stage {stageNumber - 1} has only{' '}
                  {materialsPreview.previous_stage_qty ?? 0} units. Need {quantity}{' '}
                  units.
                </Alert>
              )}
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!canSubmit || completeMutation.isPending}
          startIcon={
            completeMutation.isPending ? (
              <CircularProgress size={16} color="inherit" />
            ) : undefined
          }
        >
          Complete
        </Button>
      </DialogActions>
    </Dialog>
  );
};
