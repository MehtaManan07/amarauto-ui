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
import { WorkLogFormDialog } from './components/WorkLogFormDialog';
import {
  useWorkLogs,
  useUpdateWorkLog,
  useDeleteWorkLog,
  useBulkCreateWorkLogs,
} from '../../hooks/useWorkLogs';
import type { WorkLogBulkPayload } from '../../api/work-logs.api';
import { useUsersByRole } from '../../hooks/useUsers';
import { useProductSearch } from '../../hooks/useProducts';
import { useAuthStore } from '../../stores/authStore';
import { USER_ROLES } from '../../constants';
import type { WorkLog, User, Product } from '../../types';

export const WorkLogsPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const canEdit = user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.SUPERVISOR;

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [userFilter, setUserFilter] = useState<User | null>(null);
  const [productFilter, setProductFilter] = useState<Product | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [selectedWorkLog, setSelectedWorkLog] = useState<WorkLog | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workLogToDelete, setWorkLogToDelete] = useState<WorkLog | null>(null);

  const { data: workers = [] } = useUsersByRole([USER_ROLES.WORKER]);
  const [productSearch, setProductSearch] = useState('');
  const { options: productOptions, isLoading: productsLoading } = useProductSearch(productSearch, productFilter?.id);
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useWorkLogs(page, 25, {
    userId: userFilter?.id,
    productId: productFilter?.id,
    workDateFrom: dateFrom || undefined,
    workDateTo: dateTo || undefined,
    search: search || undefined,
  });

  const workLogs = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.total_pages ?? 0;

  const bulkCreateMutation = useBulkCreateWorkLogs();
  const updateMutation = useUpdateWorkLog();
  const deleteMutation = useDeleteWorkLog();

  const handleOpenCreateDialog = () => {
    setSelectedWorkLog(null);
    setFormDialogOpen(true);
  };

  const handleOpenEditDialog = (log: WorkLog) => {
    setSelectedWorkLog(log);
    setFormDialogOpen(true);
  };

  const handleCloseFormDialog = () => {
    setFormDialogOpen(false);
    setSelectedWorkLog(null);
  };

  const handleFormSubmit = (data: Partial<WorkLog>) => {
    if (selectedWorkLog) {
      updateMutation.mutate(
        { id: selectedWorkLog.id, data },
        { onSuccess: () => handleCloseFormDialog() }
      );
    }
  };

  const handleBulkFormSubmit = (data: WorkLogBulkPayload) => {
    bulkCreateMutation.mutate(data, {
      onSuccess: () => handleCloseFormDialog(),
    });
  };

  const handleOpenDeleteDialog = (log: WorkLog) => {
    setWorkLogToDelete(log);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setWorkLogToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (workLogToDelete) {
      deleteMutation.mutate(workLogToDelete.id, {
        onSuccess: () => handleCloseDeleteDialog(),
      });
    }
  };

  const handleRowClick = (log: WorkLog) => {
    if (canEdit) handleOpenEditDialog(log);
  };

  const handleUserClick = (userId: number) => {
    setUserFilter(workers.find((u) => u.id === userId) ?? null);
  };

  const handleProductClick = (productId: number) => {
    navigate(`/products/${productId}`);
  };

  const columns = [
    {
      id: 'work_date',
      label: 'Date',
      mobileLabel: 'Date',
      render: (log: WorkLog) => (
        <Typography variant="body2">
          {log.work_date ? new Date(log.work_date).toLocaleDateString() : '-'}
        </Typography>
      ),
    },
    {
      id: 'user_name',
      label: 'Worker',
      render: (log: WorkLog) => (
        <Typography
          variant="body2"
          fontWeight={600}
          sx={{
            cursor: canEdit ? 'pointer' : 'default',
            '&:hover': canEdit
              ? { textDecoration: 'underline', color: 'primary.main' }
              : {},
          }}
          onClick={(e) => {
            if (canEdit) {
              e.stopPropagation();
              handleUserClick(log.user_id);
            }
          }}
        >
          {log.user_name || '-'}
        </Typography>
      ),
    },
    {
      id: 'product_part_no',
      label: 'Product',
      render: (log: WorkLog) => (
        <Typography
          variant="body2"
          sx={{
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline', color: 'primary.main' },
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (log.product_id) handleProductClick(log.product_id);
          }}
        >
          {log.product_part_no || '-'}
        </Typography>
      ),
      hideOnMobile: true,
    },
    {
      id: 'operation_name',
      label: 'Operation',
      render: (log: WorkLog) => (
        <Typography variant="body2">{log.operation_name || '-'}</Typography>
      ),
    },
    {
      id: 'quantity',
      label: 'Qty',
      align: 'right' as const,
      render: (log: WorkLog) => (
        <Typography variant="body2">{log.quantity ?? '-'}</Typography>
      ),
      hideOnMobile: true,
    },
    {
      id: 'rate',
      label: 'Rate',
      align: 'right' as const,
      render: (log: WorkLog) => (
        <Typography variant="body2">{log.rate ?? '-'}</Typography>
      ),
      hideOnMobile: true,
    },
    {
      id: 'total_amount',
      label: 'Amount',
      align: 'right' as const,
      render: (log: WorkLog) => (
        <Typography variant="body2" fontWeight={600}>
          {log.total_amount ?? '-'}
        </Typography>
      ),
    },
    {
      id: 'time',
      label: 'Time',
      align: 'center' as const,
      render: (log: WorkLog) => (
        <Typography variant="body2">
          {log.start_time && log.end_time
            ? `${log.start_time} - ${log.end_time} (${log.duration_minutes ?? 0} min)`
            : log.duration_minutes != null
              ? `${log.duration_minutes} min`
              : '-'}
        </Typography>
      ),
      hideOnMobile: true,
    },
    ...(canEdit
      ? [
          {
            id: 'actions',
            label: 'Actions',
            align: 'center' as const,
            isAction: true,
            render: (log: WorkLog) => (
              <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                <Tooltip title="Edit">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEditDialog(log);
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
                      handleOpenDeleteDialog(log);
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            ),
          },
        ]
      : []),
  ];

  const renderTableContent = () => {
    if (isLoading) {
      return <LoadingState message="Loading work logs..." />;
    }

    if (isError) {
      return <ErrorState onRetry={() => refetch()} />;
    }

    if (!workLogs || workLogs.length === 0) {
      return (
        <EmptyState
          title="No work logs found"
          message={
            search || userFilter || productFilter || dateFrom || dateTo
              ? 'Try adjusting your filters'
              : 'Add your first work log to get started'
          }
          actionLabel={
            !search && !userFilter && !productFilter && !dateFrom && !dateTo && canEdit
              ? 'Add Work Log'
              : undefined
          }
          onAction={
            !search && !userFilter && !productFilter && !dateFrom && !dateTo && canEdit
              ? handleOpenCreateDialog
              : undefined
          }
        />
      );
    }

    return (
      <ResponsiveTable
        columns={columns}
        data={workLogs}
        keyExtractor={(log) => log.id.toString()}
        onRowClick={handleRowClick}
        emptyMessage="No work logs found"
      />
    );
  };

  return (
    <Box>
      <PageHeader
        title="Work Logs"
        subtitle={
          total > 0
            ? `${total} entries`
            : 'Track worker production and payroll'
        }
        action={
          canEdit ? (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateDialog}
            >
              Add Work Log
            </Button>
          ) : undefined
        }
      />

      <Box sx={{ mt: 3, mb: 2 }}>
        <Card>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Production Log
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
                  placeholder="Search worker, product, operation..."
                />
              </Box>
              <Autocomplete
                sx={{ minWidth: 180 }}
                options={workers}
                getOptionLabel={(opt) =>
                  opt ? `${opt.name} (${opt.username})` : ''
                }
                value={userFilter}
                onChange={(_, value) => setUserFilter(value)}
                renderInput={(params) => (
                  <TextField {...params} label="Worker" size="small" />
                )}
              />
              <Autocomplete
                sx={{ minWidth: 180 }}
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
                label="From"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 140 }}
              />
              <TextField
                size="small"
                label="To"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 140 }}
              />
              {(userFilter || productFilter || search || dateFrom || dateTo) && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setUserFilter(null);
                    setProductFilter(null);
                    setSearch('');
                    setDateFrom('');
                    setDateTo('');
                  }}
                >
                  Clear filters
                </Button>
              )}
            </Box>
            {renderTableContent()}
            {totalPages > 1 && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 1,
                  mt: 2,
                }}
              >
                <Button
                  size="small"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Typography variant="body2" sx={{ alignSelf: 'center' }}>
                  Page {page} of {totalPages}
                </Typography>
                <Button
                  size="small"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </Box>
            )}
          </Box>
        </Card>
      </Box>

      <WorkLogFormDialog
        open={formDialogOpen}
        workLog={selectedWorkLog}
        isLoading={bulkCreateMutation.isPending || updateMutation.isPending}
        onSubmit={handleFormSubmit}
        onBulkSubmit={handleBulkFormSubmit}
        onClose={handleCloseFormDialog}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Work Log"
        message={`Are you sure you want to delete this work log (${workLogToDelete?.user_name} - ${workLogToDelete?.operation_name})?`}
        confirmLabel="Delete"
        confirmColor="error"
        isLoading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteDialog}
      />
    </Box>
  );
};

export default WorkLogsPage;
