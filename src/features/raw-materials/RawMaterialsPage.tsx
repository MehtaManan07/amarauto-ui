import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  IconButton,
  Chip,
  Tooltip,
  Typography,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { PageHeader } from '../../components/common/PageHeader';
import { SearchInput } from '../../components/common/SearchInput';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { ResponsiveTable } from '../../components/common/ResponsiveTable';
import { RawMaterialFormDialog } from './components/RawMaterialFormDialog';
import { BulkRawMaterialFormDialog } from './components/BulkRawMaterialFormDialog';
import {
  useRawMaterialsInfinite,
  useCreateRawMaterial,
  useUpdateRawMaterial,
  useDeleteRawMaterial,
} from '../../hooks/useRawMaterials';
import type { RawMaterial } from '../../types';

export const RawMaterialsPage: React.FC = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [selectedRawMaterial, setSelectedRawMaterial] =
    useState<RawMaterial | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rawMaterialToDelete, setRawMaterialToDelete] =
    useState<RawMaterial | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isError,
    refetch,
  } = useRawMaterialsInfinite(search || undefined);

  const rawMaterials =
    data?.pages ? data.pages.flatMap((p) => p?.items ?? []) : [];
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

  const createMutation = useCreateRawMaterial();
  const updateMutation = useUpdateRawMaterial();
  const deleteMutation = useDeleteRawMaterial();

  const handleOpenCreateDialog = () => {
    setSelectedRawMaterial(null);
    setFormDialogOpen(true);
  };

  const handleOpenEditDialog = (rm: RawMaterial) => {
    setSelectedRawMaterial(rm);
    setFormDialogOpen(true);
  };

  const handleCloseFormDialog = () => {
    setFormDialogOpen(false);
    setSelectedRawMaterial(null);
  };

  const handleFormSubmit = (data: Partial<RawMaterial>) => {
    if (selectedRawMaterial) {
      updateMutation.mutate(
        { id: selectedRawMaterial.id, data },
        { onSuccess: () => handleCloseFormDialog() }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => handleCloseFormDialog(),
      });
    }
  };

  const handleOpenDeleteDialog = (rm: RawMaterial) => {
    setRawMaterialToDelete(rm);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setRawMaterialToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (rawMaterialToDelete) {
      deleteMutation.mutate(rawMaterialToDelete.id, {
        onSuccess: () => handleCloseDeleteDialog(),
      });
    }
  };

  const handleViewRawMaterial = (rm: RawMaterial) => {
    navigate(`/raw-materials/${rm.id}`);
  };

  const formatCurrency = (value: number | string | null | undefined) => {
    if (value === null || value === undefined) return '-';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (Number.isNaN(num)) return '-';
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  const isLowStock = (rm: RawMaterial) => {
    if (rm.min_stock_req == null) return false;
    return (rm.stock_qty ?? 0) < rm.min_stock_req;
  };

  const columns = [
    {
      id: 'name',
      label: 'Name',
      mobileLabel: 'Name',
      render: (rm: RawMaterial) => (
        <Typography variant="body2" fontWeight={600}>
          {rm.name}
        </Typography>
      ),
    },
    {
      id: 'unit_type',
      label: 'Unit Type',
      render: (rm: RawMaterial) => (
        <Typography variant="body2" color="text.secondary">
          {rm.unit_type || '-'}
        </Typography>
      ),
      hideOnMobile: true,
    },
    {
      id: 'material_type',
      label: 'Material Type',
      render: (rm: RawMaterial) => (
        <Typography variant="body2" color="text.secondary">
          {rm.material_type || '-'}
        </Typography>
      ),
      hideOnMobile: true,
    },
    {
      id: 'group',
      label: 'Group',
      render: (rm: RawMaterial) => (
        <Typography variant="body2" color="text.secondary">
          {rm.group || '-'}
        </Typography>
      ),
      hideOnMobile: true,
    },
    {
      id: 'stock_qty',
      label: 'Stock',
      mobileLabel: 'Stock',
      align: 'center' as const,
      render: (rm: RawMaterial) => (
        <Chip
          label={rm.stock_qty ?? 0}
          size="small"
          color={
            isLowStock(rm)
              ? 'warning'
              : (rm.stock_qty ?? 0) > 0
              ? 'primary'
              : 'default'
          }
          variant={
            isLowStock(rm) || (rm.stock_qty ?? 0) > 0 ? 'filled' : 'outlined'
          }
        />
      ),
    },
    {
      id: 'min_stock_req',
      label: 'Min Req',
      render: (rm: RawMaterial) => (
        <Typography variant="body2">{rm.min_stock_req ?? '-'}</Typography>
      ),
      hideOnMobile: true,
    },
    {
      id: 'purchase_price',
      label: 'Price',
      align: 'right' as const,
      render: (rm: RawMaterial) => (
        <Typography variant="body2">
          {formatCurrency(rm.purchase_price)}
        </Typography>
      ),
      hideOnMobile: true,
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'center' as const,
      isAction: true,
      render: (rm: RawMaterial) => (
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
          <Tooltip title="View">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleViewRawMaterial(rm);
              }}
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenEditDialog(rm);
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
                handleOpenDeleteDialog(rm);
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
      return <LoadingState message="Loading raw materials..." />;
    }

    if (isError) {
      return <ErrorState onRetry={() => refetch()} />;
    }

    if (!rawMaterials || rawMaterials.length === 0) {
      return (
        <EmptyState
          title="No raw materials found"
          message={
            search
              ? 'Try a different search term'
              : 'Add your first raw material to get started'
          }
          actionLabel={!search ? 'Add Raw Material' : undefined}
          onAction={!search ? handleOpenCreateDialog : undefined}
        />
      );
    }

    return (
      <>
        <ResponsiveTable
          columns={columns}
          data={rawMaterials}
          keyExtractor={(rm) => rm.id.toString()}
          onRowClick={handleViewRawMaterial}
          emptyMessage="No raw materials found"
        />

        <Box sx={{ p: 2, textAlign: 'center' }}>
          <div ref={observerTarget} style={{ height: '20px' }} />
          {isFetchingNextPage && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={24} />
              <Typography variant="body2" color="text.secondary">
                Loading more...
              </Typography>
            </Box>
          )}
          {!hasNextPage && rawMaterials.length > 0 && (
            <Typography variant="caption" fontSize={16} color="text.secondary">
              All raw materials loaded ({totalCount} total)
            </Typography>
          )}
        </Box>
      </>
    );
  };

  return (
    <Box>
      <PageHeader
        title="Raw Materials"
        subtitle={
          totalCount > 0
            ? `${totalCount} raw materials${
                rawMaterials.length < totalCount
                  ? ` (showing ${rawMaterials.length})`
                  : ''
              }`
            : 'Manage your raw materials inventory'
        }
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" onClick={() => setBulkDialogOpen(true)}>
              Bulk Upload
            </Button>
            <Button variant="contained" onClick={handleOpenCreateDialog}>
              Add Raw Material
            </Button>
          </Box>
        }
      />

      <Box
        sx={{
          mb: { xs: 2, sm: 3 },
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Box
          sx={{
            flex: { xs: '1 1 100%', sm: '1 1 auto' },
            minWidth: { xs: '100%', sm: '200px' },
          }}
        >
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by name, unit type, material type..."
          />
        </Box>
        {isFetching && !isFetchingNextPage && !showFullLoading && (
          <Typography variant="caption" color="text.secondary">
            Searching...
          </Typography>
        )}
      </Box>

      <Card>{renderTableContent()}</Card>

      <RawMaterialFormDialog
        open={formDialogOpen}
        rawMaterial={selectedRawMaterial}
        isLoading={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleFormSubmit}
        onClose={handleCloseFormDialog}
      />

      <BulkRawMaterialFormDialog
        open={bulkDialogOpen}
        onClose={() => setBulkDialogOpen(false)}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Raw Material"
        message={`Are you sure you want to delete "${rawMaterialToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmColor="error"
        isLoading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteDialog}
      />
    </Box>
  );
};

export default RawMaterialsPage;
