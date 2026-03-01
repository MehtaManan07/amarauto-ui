import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  IconButton,
  Tooltip,
  Typography,
  CircularProgress,
  TextField,
  Autocomplete,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { PageHeader } from '../../components/common/PageHeader';
import { SearchInput } from '../../components/common/SearchInput';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { ResponsiveTable } from '../../components/common/ResponsiveTable';
import { BOMLineFormDialog } from './components/BOMLineFormDialog';
import { ProductionCalculator } from './components/ProductionCalculator';
import {
  useBOMLinesInfinite,
  useCreateBOMLine,
  useUpdateBOMLine,
  useDeleteBOMLine,
} from '../../hooks/useBOM';
import { useProductSearch } from '../../hooks/useProducts';
import type { BOMLine, Product } from '../../types';

export const BOMPage: React.FC = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [productFilter, setProductFilter] = useState<Product | null>(null);
  const [variantFilter, setVariantFilter] = useState<string | null>(null);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [selectedBOMLine, setSelectedBOMLine] = useState<BOMLine | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bomLineToDelete, setBomLineToDelete] = useState<BOMLine | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  const [productSearch, setProductSearch] = useState('');
  const { options: productOptions, isLoading: productsLoading } = useProductSearch(productSearch, productFilter?.id);
  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isError,
    refetch,
  } = useBOMLinesInfinite({
    search: search || undefined,
    productId: productFilter?.id,
    variant: variantFilter ?? undefined,
  });

  const bomLines = data?.pages ? data.pages.flatMap((p) => p?.items ?? []) : [];
  const totalCount = data?.pages?.[0]?.total ?? 0;
  const showFullLoading = isLoading && !data;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const createMutation = useCreateBOMLine();
  const updateMutation = useUpdateBOMLine();
  const deleteMutation = useDeleteBOMLine();

  const handleOpenCreateDialog = () => {
    setSelectedBOMLine(null);
    setFormDialogOpen(true);
  };

  const handleOpenEditDialog = (line: BOMLine) => {
    setSelectedBOMLine(line);
    setFormDialogOpen(true);
  };

  const handleCloseFormDialog = () => {
    setFormDialogOpen(false);
    setSelectedBOMLine(null);
  };

  const handleFormSubmit = (data: Partial<BOMLine>) => {
    if (selectedBOMLine) {
      updateMutation.mutate(
        { id: selectedBOMLine.id, data },
        { onSuccess: () => handleCloseFormDialog() }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => handleCloseFormDialog(),
      });
    }
  };

  const handleOpenDeleteDialog = (line: BOMLine) => {
    setBomLineToDelete(line);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setBomLineToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (bomLineToDelete) {
      deleteMutation.mutate(bomLineToDelete.id, {
        onSuccess: () => handleCloseDeleteDialog(),
      });
    }
  };

  const handleRowClick = (line: BOMLine) => {
    handleOpenEditDialog(line);
  };

  const handleProductClick = (productId: number) => {
    navigate(`/products/${productId}`);
  };

  const columns = [
    {
      id: 'product_part_no',
      label: 'Part No',
      mobileLabel: 'Product',
      render: (line: BOMLine) => (
        <Typography
          variant="body2"
          fontWeight={600}
          sx={{
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline', color: 'primary.main' },
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleProductClick(line.product_id);
          }}
        >
          {line.product_part_no || '-'}
        </Typography>
      ),
    },
    {
      id: 'product_name',
      label: 'Product',
      render: (line: BOMLine) => (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline', color: 'primary.main' },
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleProductClick(line.product_id);
          }}
        >
          {line.product_name || '-'}
        </Typography>
      ),
      hideOnMobile: true,
    },
    {
      id: 'raw_material_name',
      label: 'Raw Material',
      render: (line: BOMLine) => (
        <Typography variant="body2">{line.raw_material_name || '-'}</Typography>
      ),
    },
    {
      id: 'variant',
      label: 'Variant',
      render: (line: BOMLine) => (
        <Typography variant="body2" color="text.secondary">
          {line.variant || '-'}
        </Typography>
      ),
      hideOnMobile: true,
    },
    {
      id: 'stage_number',
      label: 'Stage',
      align: 'center' as const,
      render: (line: BOMLine) => (
        <Typography variant="body2">{line.stage_number ?? 1}</Typography>
      ),
    },
    {
      id: 'batch_qty',
      label: 'Batch Qty',
      align: 'center' as const,
      render: (line: BOMLine) => (
        <Typography variant="body2">{line.batch_qty ?? '-'}</Typography>
      ),
      hideOnMobile: true,
    },
    {
      id: 'raw_qty',
      label: 'Raw Qty',
      align: 'center' as const,
      render: (line: BOMLine) => (
        <Typography variant="body2">{line.raw_qty ?? '-'}</Typography>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'center' as const,
      isAction: true,
      render: (line: BOMLine) => (
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenEditDialog(line);
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenDeleteDialog(line);
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const renderTableContent = () => {
    if (showFullLoading) {
      return <LoadingState message="Loading BOM lines..." />;
    }

    if (isError) {
      return <ErrorState onRetry={() => refetch()} />;
    }

    if (!bomLines || bomLines.length === 0) {
      return (
        <EmptyState
          title="No BOM lines found"
          message={
            search || productFilter || variantFilter
              ? 'Try adjusting your filters'
              : 'Add your first BOM line to get started'
          }
          actionLabel={!search && !productFilter && !variantFilter ? 'Add BOM Line' : undefined}
          onAction={
            !search && !productFilter && !variantFilter ? handleOpenCreateDialog : undefined
          }
        />
      );
    }

    return (
      <>
        <ResponsiveTable
          columns={columns}
          data={bomLines}
          keyExtractor={(line) => line.id.toString()}
          onRowClick={handleRowClick}
          emptyMessage="No BOM lines found"
        />

        <Box sx={{ p: 2, textAlign: 'center' }}>
          <div ref={observerTarget} style={{ height: '20px' }} />
          {isFetchingNextPage && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <CircularProgress size={24} />
              <Typography variant="body2" color="text.secondary">
                Loading more...
              </Typography>
            </Box>
          )}
          {!hasNextPage && bomLines.length > 0 && (
            <Typography variant="caption" fontSize={16} color="text.secondary">
              All BOM lines loaded ({totalCount} total)
            </Typography>
          )}
        </Box>
      </>
    );
  };

  return (
    <Box>
      <PageHeader
        title="Bill of Materials"
        subtitle={
          totalCount > 0
            ? `${totalCount} BOM lines${
                bomLines.length < totalCount ? ` (showing ${bomLines.length})` : ''
              }`
            : 'Manage product BOMs and material requirements'
        }
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateDialog}>
            Add BOM Line
          </Button>
        }
      />

      <ProductionCalculator />

      <Box sx={{ mt: 3, mb: 2 }}>
        <Card>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              BOM Lines
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
                alignItems: 'center',
                mt: 1,
              }}
            >
              <Box sx={{ minWidth: 200, flex: 1 }}>
                <SearchInput
                  value={search}
                  onChange={setSearch}
                  placeholder="Search raw material, variant..."
                />
              </Box>
              <Autocomplete
                sx={{ minWidth: 220 }}
                options={productOptions}
                getOptionLabel={(opt) =>
                  opt ? `${opt.part_no} - ${opt.name}` : ''
                }
                value={productFilter}
                onChange={(_, value) => {
                  setProductFilter(value);
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
              <TextField
                size="small"
                label="Variant"
                value={variantFilter ?? ''}
                onChange={(e) =>
                  setVariantFilter(e.target.value ? e.target.value : null)
                }
                sx={{ minWidth: 150 }}
              />
              {(productFilter || variantFilter || search) && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setProductFilter(null);
                    setVariantFilter(null);
                    setSearch('');
                  }}
                >
                  Clear filters
                </Button>
              )}
            </Box>
            {isFetching && !isFetchingNextPage && !showFullLoading && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                Searching...
              </Typography>
            )}
          </Box>
          {renderTableContent()}
        </Card>
      </Box>

      <BOMLineFormDialog
        open={formDialogOpen}
        bomLine={selectedBOMLine}
        isLoading={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleFormSubmit}
        onClose={handleCloseFormDialog}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete BOM Line"
        message={`Are you sure you want to delete this BOM line (${bomLineToDelete?.raw_material_name} ${bomLineToDelete?.variant ? `- ${bomLineToDelete.variant}` : ''})?`}
        confirmLabel="Delete"
        confirmColor="error"
        isLoading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteDialog}
      />
    </Box>
  );
};

export default BOMPage;
