import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Autocomplete,
  TextField,
  useTheme,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import { CompleteStageDialog } from './components/CompleteStageDialog';
import { useStageInventory } from '../../hooks/useProduction';
import { useProductSearch } from '../../hooks/useProducts';
import type { StageInventory, Product } from '../../types';

export const ProductionPage: React.FC = () => {
  const theme = useTheme();
  const [productFilter, setProductFilter] = useState<Product | null>(null);
  const [stageFilter, setStageFilter] = useState<number | null>(null);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [prefillRow, setPrefillRow] = useState<StageInventory | null>(null);
  const [productSearch, setProductSearch] = useState('');

  const { options: productOptions, isLoading: productsLoading } = useProductSearch(productSearch, productFilter?.id);
  const {
    data: stageInventory = [],
    isLoading,
    isError,
    refetch,
  } = useStageInventory(
    productFilter?.id,
    undefined,
    stageFilter ?? undefined
  );

  const handleOpenCompleteDialog = (row?: StageInventory) => {
    setPrefillRow(row ?? null);
    setCompleteDialogOpen(true);
  };

  const handleCloseCompleteDialog = () => {
    setCompleteDialogOpen(false);
    setPrefillRow(null);
  };

  const handleCompleteSuccess = () => {
    handleCloseCompleteDialog();
  };

  const stageOptions: (number | null)[] = [null, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <PageHeader
        title="Production"
        subtitle="Track WIP at each stage. Complete stages to move units forward."
        actionLabel="Complete Stage"
        actionIcon={<AddIcon />}
        onAction={() => handleOpenCompleteDialog()}
      />

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              mb: 2,
              alignItems: 'center',
            }}
          >
            <Autocomplete
              size="small"
              options={productOptions}
              getOptionLabel={(p) => (p ? `${p.part_no} - ${p.name}` : '')}
              value={productFilter}
              onChange={(_, v) => {
                setProductFilter(v);
                setProductSearch('');
              }}
              onInputChange={(_, value, reason) => {
                if (reason === 'input') setProductSearch(value);
              }}
              filterOptions={(x) => x}
              loading={productsLoading}
              isOptionEqualToValue={(a, b) => a?.id === b?.id}
              renderInput={(params) => (
                <TextField {...params} label="Product" placeholder="All" />
              )}
              sx={{ minWidth: 200 }}
            />
            <Autocomplete
              size="small"
              options={stageOptions}
              getOptionLabel={(n) => (n === null ? 'All' : `Stage ${n}`)}
              value={stageFilter}
              onChange={(_, v) => setStageFilter(v)}
              renderInput={(params) => (
                <TextField {...params} label="Stage" placeholder="All" />
              )}
              sx={{ minWidth: 120 }}
            />
          </Box>

          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Current WIP Inventory
          </Typography>

          {stageInventory.length === 0 ? (
            <EmptyState
              title="No WIP in inventory"
              message="Complete a stage to add units to WIP. Use the Complete Stage button above."
            />
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: theme.palette.table.header }}>
                  <TableCell>Product</TableCell>
                  <TableCell>Variant</TableCell>
                  <TableCell>Stage</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stageInventory.map((row) => (
                  <TableRow
                    key={row.id}
                    sx={{
                      '&:hover': { bgcolor: theme.palette.table.rowHover },
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {row.product_part_no ?? '-'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row.product_name ?? '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>{row.variant ?? 'Default'}</TableCell>
                    <TableCell>Stage {row.stage_number}</TableCell>
                    <TableCell align="right">{row.quantity}</TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleOpenCompleteDialog(row)}
                      >
                        Complete →
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mt: 2 }}
          >
            Final stage = Finished goods (ready to ship)
          </Typography>
        </CardContent>
      </Card>

      <CompleteStageDialog
        open={completeDialogOpen}
        onClose={handleCloseCompleteDialog}
        onSuccess={handleCompleteSuccess}
        prefill={prefillRow}
      />
    </Box>
  );
};

export default ProductionPage;
