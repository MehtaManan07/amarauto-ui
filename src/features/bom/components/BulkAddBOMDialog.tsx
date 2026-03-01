import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  Autocomplete,
  Alert,
  Chip,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useRawMaterialSearch } from '../../../hooks/useRawMaterials';
import { useBulkCreateBOMLines } from '../../../hooks/useBOM';
import type { RawMaterial } from '../../../types';
import type { BulkBOMLineItem } from '../../../api/bom.api';

const INITIAL_ROW_COUNT = 5;

interface BOMRow {
  id: string;
  raw_material_id: number;
  variant: string;
  stage_number: number;
  batch_qty: number;
  raw_qty: number;
}

const createEmptyRow = (): BOMRow => ({
  id: crypto.randomUUID(),
  raw_material_id: 0,
  variant: '',
  stage_number: 1,
  batch_qty: 1,
  raw_qty: 0,
});

const RawMaterialSearchCell: React.FC<{
  value: number;
  onChange: (id: number) => void;
  disabled: boolean;
}> = ({ value, onChange, disabled }) => {
  const [search, setSearch] = useState('');
  const { options, isLoading } = useRawMaterialSearch(search, value || undefined);

  return (
    <Autocomplete
      size="small"
      options={options}
      getOptionLabel={(opt) => (opt as RawMaterial).name}
      value={value ? (options.find((r) => r.id === value) ?? null) : null}
      onChange={(_, v) => {
        onChange((v as RawMaterial)?.id ?? 0);
        setSearch('');
      }}
      onInputChange={(_, v, reason) => {
        if (reason === 'input') setSearch(v);
      }}
      filterOptions={(x) => x}
      loading={isLoading}
      isOptionEqualToValue={(opt, val) =>
        (opt as RawMaterial).id === (val as RawMaterial)?.id
      }
      renderInput={(params) => <TextField {...params} placeholder="Select" />}
      disabled={disabled}
      sx={{ minWidth: 180 }}
    />
  );
};

interface BulkAddBOMDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  productId: number;
  productName: string;
}

export const BulkAddBOMDialog: React.FC<BulkAddBOMDialogProps> = ({
  open,
  onClose,
  onSuccess,
  productId,
  productName,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [rows, setRows] = useState<BOMRow[]>(() =>
    Array.from({ length: INITIAL_ROW_COUNT }, createEmptyRow)
  );
  const [result, setResult] = useState<{
    success_count: number;
    failure_count: number;
    results: Array<{ raw_material_id: number; success: boolean; error?: string }>;
  } | null>(null);

  const bulkMutation = useBulkCreateBOMLines();

  useEffect(() => {
    if (open) {
      setRows(Array.from({ length: INITIAL_ROW_COUNT }, createEmptyRow));
      setResult(null);
    }
  }, [open]);

  const handleAddRow = () => {
    setRows((prev) => [...prev, createEmptyRow()]);
  };

  const handleRemoveRow = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleRowChange = (id: string, field: keyof BOMRow, value: string | number) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const getValidLines = (): BulkBOMLineItem[] => {
    return rows
      .filter((r) => r.raw_material_id > 0 && r.raw_qty > 0)
      .map((r) => ({
        raw_material_id: r.raw_material_id,
        variant: r.variant?.trim() || undefined,
        stage_number: r.stage_number,
        batch_qty: r.batch_qty,
        raw_qty: r.raw_qty,
      }));
  };

  const validLines = getValidLines();
  const canSubmit = validLines.length > 0 && !bulkMutation.isPending;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setResult(null);
    bulkMutation.mutate(
      { productId, lines: validLines },
      {
        onSuccess: (data) => {
          setResult({
            success_count: data.success_count,
            failure_count: data.failure_count,
            results: data.results,
          });
          if (data.failure_count === 0) {
            onSuccess();
          }
        },
      }
    );
  };

  const handleClose = () => {
    setRows(Array.from({ length: INITIAL_ROW_COUNT }, createEmptyRow));
    setResult(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle>Add BOM for {productName}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Add multiple raw materials with quantities. Each row needs a raw material and raw qty.
        </Typography>

        <TableContainer sx={{ maxHeight: 400, border: 1, borderColor: 'divider' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow sx={{ bgcolor: theme.palette.table.header }}>
                <TableCell sx={{ fontWeight: 600 }}>Raw Material</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Variant</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Stage</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Batch Qty</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Raw Qty</TableCell>
                <TableCell width={50} />
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <RawMaterialSearchCell
                      value={row.raw_material_id}
                      onChange={(id) => handleRowChange(row.id, 'raw_material_id', id)}
                      disabled={bulkMutation.isPending}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      value={row.variant}
                      onChange={(e) => handleRowChange(row.id, 'variant', e.target.value)}
                      placeholder="e.g. BLACK"
                      disabled={bulkMutation.isPending}
                      fullWidth
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      type="number"
                      value={row.stage_number}
                      onChange={(e) =>
                        handleRowChange(
                          row.id,
                          'stage_number',
                          parseInt(e.target.value, 10) || 1
                        )
                      }
                      inputProps={{ min: 1 }}
                      disabled={bulkMutation.isPending}
                      sx={{ width: 70 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <TextField
                      size="small"
                      type="number"
                      value={row.batch_qty}
                      onChange={(e) =>
                        handleRowChange(
                          row.id,
                          'batch_qty',
                          parseFloat(e.target.value) || 1
                        )
                      }
                      inputProps={{ min: 0, step: 0.01 }}
                      disabled={bulkMutation.isPending}
                      sx={{ width: 90 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <TextField
                      size="small"
                      type="number"
                      value={row.raw_qty || ''}
                      onChange={(e) =>
                        handleRowChange(
                          row.id,
                          'raw_qty',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      inputProps={{ min: 0, step: 0.01 }}
                      placeholder="Required"
                      disabled={bulkMutation.isPending}
                      sx={{ width: 90 }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveRow(row.id)}
                      disabled={bulkMutation.isPending || rows.length <= 1}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Button
          startIcon={<AddIcon />}
          onClick={handleAddRow}
          disabled={bulkMutation.isPending}
          sx={{ mt: 2 }}
        >
          Add row
        </Button>

        {result && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Result
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 1, flexWrap: 'wrap' }}>
              <Chip
                label={`Success: ${result.success_count}`}
                color="success"
                size="small"
              />
              {result.failure_count > 0 && (
                <Chip
                  label={`Failed: ${result.failure_count}`}
                  color="error"
                  size="small"
                />
              )}
            </Box>
            {result.failure_count > 0 &&
              result.results
                .filter((r) => !r.success)
                .map((r, i) => (
                  <Alert key={i} severity="error" sx={{ mt: 1 }}>
                    Raw material ID {r.raw_material_id}: {r.error}
                  </Alert>
                ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: 2, gap: 1 }}>
        <Button onClick={handleClose} disabled={bulkMutation.isPending} fullWidth={isMobile}>
          {result && result.failure_count === 0 ? 'Done' : 'Cancel'}
        </Button>
        {(!result || result.failure_count > 0) && (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!canSubmit}
            fullWidth={isMobile}
          >
            {bulkMutation.isPending ? 'Adding...' : `Add ${validLines.length} line(s)`}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default BulkAddBOMDialog;
