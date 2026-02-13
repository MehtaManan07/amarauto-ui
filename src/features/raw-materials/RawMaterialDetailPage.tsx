import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Grid,
  IconButton,
  Tooltip,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  useTheme,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as BackIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import {
  RawMaterialInfoCard,
  RawMaterialFormDialog,
  AdjustStockDialog,
} from './components';
import {
  useRawMaterial,
  useInventoryLogs,
  useUpdateRawMaterial,
  useDeleteRawMaterial,
  useAdjustStock,
} from '../../hooks/useRawMaterials';
import { useBOMLinesByRawMaterial } from '../../hooks/useBOM';
import type { RawMaterial } from '../../types';

export const RawMaterialDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const rawMaterialId = parseInt(id || '0', 10);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [adjustStockDialogOpen, setAdjustStockDialogOpen] = useState(false);

  const { data: rawMaterial, isLoading, isError, refetch } =
    useRawMaterial(rawMaterialId);
  const { data: bomLines = [], isLoading: bomLoading } =
    useBOMLinesByRawMaterial(rawMaterialId);
  const { data: logs = [], isLoading: logsLoading } =
    useInventoryLogs(rawMaterialId);
  const updateMutation = useUpdateRawMaterial();
  const deleteMutation = useDeleteRawMaterial();
  const adjustStockMutation = useAdjustStock();

  const handleEditSubmit = (data: Partial<RawMaterial>) => {
    updateMutation.mutate(
      { id: rawMaterialId, data },
      { onSuccess: () => setEditDialogOpen(false) }
    );
  };

  const handleConfirmDelete = () => {
    deleteMutation.mutate(rawMaterialId, {
      onSuccess: () => navigate('/raw-materials'),
    });
  };

  const handleAdjustStock = (quantityDelta: number, notes?: string) => {
    adjustStockMutation.mutate(
      { id: rawMaterialId, quantityDelta, notes },
      { onSuccess: () => setAdjustStockDialogOpen(false) }
    );
  };

  if (isLoading) {
    return <LoadingState message="Loading raw material..." fullPage />;
  }

  if (isError || !rawMaterial) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  return (
    <Box>
      <PageHeader
        title={rawMaterial.name}
        subtitle={`${rawMaterial.unit_type} ${rawMaterial.material_type ? `• ${rawMaterial.material_type}` : ''}`}
        breadcrumbs={[
          { label: 'Raw Materials', path: '/raw-materials' },
          { label: rawMaterial.name },
        ]}
      />

      <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
        <Tooltip title="Back to Raw Materials">
          <IconButton
            onClick={() => navigate('/raw-materials')}
            sx={{
              bgcolor: theme.palette.primary.light,
              '&:hover': { bgcolor: theme.palette.table.rowHover },
            }}
          >
            <BackIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit">
          <IconButton
            onClick={() => setEditDialogOpen(true)}
            sx={{
              bgcolor: theme.palette.background.elevated,
              '&:hover': { bgcolor: theme.palette.table.rowHover },
            }}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton
            color="error"
            onClick={() => setDeleteDialogOpen(true)}
            sx={{
              bgcolor: theme.palette.error.light,
              '&:hover': { bgcolor: theme.palette.error.main, color: 'white' },
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAdjustStockDialogOpen(true)}
          sx={{ ml: 1 }}
        >
          Adjust Stock
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid size={12}>
          <RawMaterialInfoCard rawMaterial={rawMaterial} />
        </Grid>

        <Grid size={12}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ mb: 2, color: theme.palette.text.primary, fontWeight: 600 }}
          >
            BOM Usage
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Products that use this raw material in their Bill of Materials
          </Typography>
          {bomLoading ? (
            <Typography variant="body2" color="text.secondary">
              Loading BOM usage...
            </Typography>
          ) : bomLines.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              This raw material is not used in any BOM lines yet.
            </Typography>
          ) : (
            <TableContainer
              sx={{
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden',
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: theme.palette.table.header }}>
                    <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Part No</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Variant</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Batch Qty
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Raw Qty
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bomLines.map((line) => (
                    <TableRow
                      key={line.id}
                      sx={{
                        '&:nth-of-type(even)': {
                          bgcolor:
                            theme.palette.background.elevated,
                        },
                      }}
                    >
                      <TableCell>{line.product_name || '-'}</TableCell>
                      <TableCell>{line.product_part_no || '-'}</TableCell>
                      <TableCell>{line.variant || '-'}</TableCell>
                      <TableCell align="right">{line.batch_qty ?? '-'}</TableCell>
                      <TableCell align="right">{line.raw_qty ?? '-'}</TableCell>
                      <TableCell>
                        <Button
                          component={Link}
                          to={`/products/${line.product_id}`}
                          size="small"
                          variant="outlined"
                        >
                          View Product
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Grid>

        <Grid size={12}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ mb: 2, color: theme.palette.text.primary, fontWeight: 600 }}
          >
            Inventory Log
          </Typography>
          {logsLoading ? (
            <Typography variant="body2" color="text.secondary">
              Loading log...
            </Typography>
          ) : logs.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No stock adjustments yet. Use "Adjust Stock" to add or remove
              inventory.
            </Typography>
          ) : (
            <TableContainer
              sx={{
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden',
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: theme.palette.table.header }}>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Delta
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Previous
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      New
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Notes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow
                      key={log.id}
                      sx={{
                        '&:nth-of-type(even)': {
                          bgcolor:
                            theme.palette.background.elevated,
                        },
                      }}
                    >
                      <TableCell>
                        {new Date(log.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {log.type}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          color={
                            log.quantity_delta > 0 ? 'success.main' : 'error.main'
                          }
                        >
                          {log.quantity_delta > 0 ? '+' : ''}
                          {log.quantity_delta}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{log.previous_qty}</TableCell>
                      <TableCell align="right">{log.new_qty}</TableCell>
                      <TableCell>{log.notes || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Grid>
      </Grid>

      <RawMaterialFormDialog
        open={editDialogOpen}
        rawMaterial={rawMaterial}
        isLoading={updateMutation.isPending}
        onSubmit={handleEditSubmit}
        onClose={() => setEditDialogOpen(false)}
      />

      <AdjustStockDialog
        open={adjustStockDialogOpen}
        rawMaterialName={rawMaterial.name}
        currentStock={rawMaterial.stock_qty ?? 0}
        isLoading={adjustStockMutation.isPending}
        onSubmit={handleAdjustStock}
        onClose={() => setAdjustStockDialogOpen(false)}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Raw Material"
        message={`Are you sure you want to delete "${rawMaterial.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmColor="error"
        isLoading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </Box>
  );
};

export default RawMaterialDetailPage;
