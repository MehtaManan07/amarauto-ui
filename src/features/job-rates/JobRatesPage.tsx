import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  IconButton,
  Tooltip,
  Typography,
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
import { JobRateFormDialog } from './components/JobRateFormDialog';
import {
  useJobRates,
  useCreateJobRate,
  useUpdateJobRate,
  useDeleteJobRate,
} from '../../hooks/useJobRates';
import { useProducts, useProductSearch } from '../../hooks/useProducts';
import type { JobRate, Product } from '../../types';

export const JobRatesPage: React.FC = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [productFilter, setProductFilter] = useState<Product | null>(null);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [selectedJobRate, setSelectedJobRate] = useState<JobRate | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobRateToDelete, setJobRateToDelete] = useState<JobRate | null>(null);

  const [productSearch, setProductSearch] = useState('');
  const { data: products = [] } = useProducts({ page: 1, page_size: 200 });
  const { options: productOptions, isLoading: productsLoading } = useProductSearch(productSearch, productFilter?.id);
  const {
    data: jobRates = [],
    isLoading,
    isError,
    refetch,
  } = useJobRates({
    search: search || undefined,
    productId: productFilter?.id,
  });

  const createMutation = useCreateJobRate();
  const updateMutation = useUpdateJobRate();
  const deleteMutation = useDeleteJobRate();

  const handleOpenCreateDialog = () => {
    setSelectedJobRate(null);
    setFormDialogOpen(true);
  };

  const handleOpenEditDialog = (rate: JobRate) => {
    setSelectedJobRate(rate);
    setFormDialogOpen(true);
  };

  const handleCloseFormDialog = () => {
    setFormDialogOpen(false);
    setSelectedJobRate(null);
  };

  const handleFormSubmit = (data: Partial<JobRate>) => {
    if (selectedJobRate) {
      updateMutation.mutate(
        { id: selectedJobRate.id, data },
        { onSuccess: () => handleCloseFormDialog() }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => handleCloseFormDialog(),
      });
    }
  };

  const handleOpenDeleteDialog = (rate: JobRate) => {
    setJobRateToDelete(rate);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setJobRateToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (jobRateToDelete) {
      deleteMutation.mutate(jobRateToDelete.id, {
        onSuccess: () => handleCloseDeleteDialog(),
      });
    }
  };

  const handleRowClick = (rate: JobRate) => {
    handleOpenEditDialog(rate);
  };

  const handleProductClick = (productId: number) => {
    navigate(`/products/${productId}`);
  };

  const columns = [
    {
      id: 'product_part_no',
      label: 'Part No',
      mobileLabel: 'Product',
      render: (rate: JobRate) => (
        <Typography
          variant="body2"
          fontWeight={600}
          sx={{
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline', color: 'primary.main' },
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleProductClick(rate.product_id);
          }}
        >
          {rate.product_part_no || '-'}
        </Typography>
      ),
    },
    {
      id: 'product_name',
      label: 'Product',
      render: (rate: JobRate) => {
        const product = products.find((p) => p.id === rate.product_id);
        return (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline', color: 'primary.main' },
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleProductClick(rate.product_id);
            }}
          >
            {product?.name ?? '-'}
          </Typography>
        );
      },
      hideOnMobile: true,
    },
    {
      id: 'operation_code',
      label: 'Operation Code',
      render: (rate: JobRate) => (
        <Typography variant="body2" fontWeight={600}>
          {rate.operation_code}
        </Typography>
      ),
    },
    {
      id: 'operation_name',
      label: 'Operation Name',
      render: (rate: JobRate) => (
        <Typography variant="body2">{rate.operation_name || '-'}</Typography>
      ),
    },
    {
      id: 'rate',
      label: 'Rate',
      align: 'right' as const,
      render: (rate: JobRate) => (
        <Typography variant="body2">{rate.rate ?? '-'}</Typography>
      ),
      hideOnMobile: true,
    },
    {
      id: 'sequence',
      label: 'Seq',
      align: 'center' as const,
      render: (rate: JobRate) => (
        <Typography variant="body2">{rate.sequence ?? '-'}</Typography>
      ),
      hideOnMobile: true,
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'center' as const,
      isAction: true,
      render: (rate: JobRate) => (
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenEditDialog(rate);
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
                handleOpenDeleteDialog(rate);
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
    if (isLoading) {
      return <LoadingState message="Loading job rates..." />;
    }

    if (isError) {
      return <ErrorState onRetry={() => refetch()} />;
    }

    if (!jobRates || jobRates.length === 0) {
      return (
        <EmptyState
          title="No job rates found"
          message={
            search || productFilter
              ? 'Try adjusting your filters'
              : 'Add your first job rate to get started'
          }
          actionLabel={!search && !productFilter ? 'Add Job Rate' : undefined}
          onAction={
            !search && !productFilter ? handleOpenCreateDialog : undefined
          }
        />
      );
    }

    return (
      <ResponsiveTable
        columns={columns}
        data={jobRates}
        keyExtractor={(rate) => rate.id.toString()}
        onRowClick={handleRowClick}
        emptyMessage="No job rates found"
      />
    );
  };

  return (
    <Box>
      <PageHeader
        title="Job Rates"
        subtitle={
          jobRates.length > 0
            ? `${jobRates.length} operations`
            : 'Manage product operations and rates'
        }
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateDialog}>
            Add Job Rate
          </Button>
        }
      />

      <Box sx={{ mt: 3, mb: 2 }}>
        <Card>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Operations
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
                  placeholder="Search operation code, name..."
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
              {(productFilter || search) && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setProductFilter(null);
                    setSearch('');
                  }}
                >
                  Clear filters
                </Button>
              )}
            </Box>
            {renderTableContent()}
          </Box>
        </Card>
      </Box>

      <JobRateFormDialog
        open={formDialogOpen}
        jobRate={selectedJobRate}
        isLoading={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleFormSubmit}
        onClose={handleCloseFormDialog}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Job Rate"
        message={`Are you sure you want to delete this job rate (${jobRateToDelete?.operation_code} - ${jobRateToDelete?.operation_name})?`}
        confirmLabel="Delete"
        confirmColor="error"
        isLoading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteDialog}
      />
    </Box>
  );
};

export default JobRatesPage;
