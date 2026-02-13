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
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { PageHeader } from '../../components/common/PageHeader';
import { SearchInput } from '../../components/common/SearchInput';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { ResponsiveTable } from '../../components/common/ResponsiveTable';
import { PartyFormDialog } from './components/PartyFormDialog';
import {
  usePartiesPaginated,
  useCreateParty,
  useUpdateParty,
  useDeleteParty,
  usePartyFieldOptions,
} from '../../hooks/useParties';
import type { Party } from '../../types';

export const PartiesPage: React.FC = () => {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState<string | null>(null);
  const [partyTypeFilter, setPartyTypeFilter] = useState<string | null>(null);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [partyToDelete, setPartyToDelete] = useState<Party | null>(null);

  const { data: fieldOptions } = usePartyFieldOptions();
  const stateOptions = fieldOptions?.state ?? [];
  const partyTypeOptions = fieldOptions?.party_type ?? [];

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = usePartiesPaginated(page, 25, {
    search: search || undefined,
    state: stateFilter || undefined,
    party_type: partyTypeFilter || undefined,
  });

  const parties = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.total_pages ?? 0;

  const createMutation = useCreateParty();
  const updateMutation = useUpdateParty();
  const deleteMutation = useDeleteParty();

  const handleOpenCreateDialog = () => {
    setSelectedParty(null);
    setFormDialogOpen(true);
  };

  const handleOpenEditDialog = (p: Party) => {
    setSelectedParty(p);
    setFormDialogOpen(true);
  };

  const handleCloseFormDialog = () => {
    setFormDialogOpen(false);
    setSelectedParty(null);
  };

  const handleFormSubmit = (data: Partial<Party>) => {
    if (selectedParty) {
      updateMutation.mutate(
        { id: selectedParty.id, data },
        { onSuccess: () => handleCloseFormDialog() }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => handleCloseFormDialog(),
      });
    }
  };

  const handleOpenDeleteDialog = (p: Party) => {
    setPartyToDelete(p);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setPartyToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (partyToDelete) {
      deleteMutation.mutate(partyToDelete.id, {
        onSuccess: () => handleCloseDeleteDialog(),
      });
    }
  };

  const handleRowClick = (p: Party) => {
    navigate(`/parties/${p.id}`);
  };

  const columns = [
    {
      id: 'name',
      label: 'Name',
      render: (p: Party) => (
        <Typography variant="body2" fontWeight={600}>
          {p.name}
        </Typography>
      ),
    },
    {
      id: 'state',
      label: 'State',
      render: (p: Party) => (
        <Typography variant="body2">{p.state || '-'}</Typography>
      ),
      hideOnMobile: true,
    },
    {
      id: 'contact_person',
      label: 'Contact',
      render: (p: Party) => (
        <Typography variant="body2">{p.contact_person || '-'}</Typography>
      ),
      hideOnMobile: true,
    },
    {
      id: 'mobile',
      label: 'Mobile',
      render: (p: Party) => (
        <Typography variant="body2">{p.mobile || '-'}</Typography>
      ),
    },
    {
      id: 'gstin',
      label: 'GSTIN',
      render: (p: Party) => (
        <Typography variant="body2">{p.gstin || '-'}</Typography>
      ),
      hideOnMobile: true,
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'center' as const,
      isAction: true,
      render: (p: Party) => (
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
          <Tooltip title="View">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/parties/${p.id}`);
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
                handleOpenEditDialog(p);
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
                handleOpenDeleteDialog(p);
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
      return <LoadingState message="Loading parties..." />;
    }

    if (isError) {
      return <ErrorState onRetry={() => refetch()} />;
    }

    if (!parties || parties.length === 0) {
      return (
        <EmptyState
          title="No parties found"
          message={
            search || stateFilter || partyTypeFilter
              ? 'Try adjusting your filters'
              : 'Add your first party to get started'
          }
          actionLabel={
            !search && !stateFilter && !partyTypeFilter
              ? 'Add Party'
              : undefined
          }
          onAction={
            !search && !stateFilter && !partyTypeFilter
              ? handleOpenCreateDialog
              : undefined
          }
        />
      );
    }

    return (
      <ResponsiveTable
        columns={columns}
        data={parties}
        keyExtractor={(p) => p.id.toString()}
        onRowClick={handleRowClick}
        emptyMessage="No parties found"
      />
    );
  };

  return (
    <Box>
      <PageHeader
        title="Parties"
        subtitle={
          total > 0
            ? `${total} customers`
            : 'Customer directory (sundry debtors)'
        }
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
          >
            Add Party
          </Button>
        }
      />

      <Box sx={{ mt: 3, mb: 2 }}>
        <Card>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Customer Directory
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
                  placeholder="Search name, email, state, contact, mobile, GSTIN..."
                />
              </Box>
              <Autocomplete
                sx={{ minWidth: 180 }}
                options={stateOptions}
                value={stateFilter}
                onChange={(_, value) => setStateFilter(value)}
                renderInput={(params) => (
                  <TextField {...params} label="State" size="small" />
                )}
              />
              <Autocomplete
                sx={{ minWidth: 180 }}
                options={partyTypeOptions}
                value={partyTypeFilter}
                onChange={(_, value) => setPartyTypeFilter(value)}
                renderInput={(params) => (
                  <TextField {...params} label="Party Type" size="small" />
                )}
              />
              {(stateFilter || partyTypeFilter || search) && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setStateFilter(null);
                    setPartyTypeFilter(null);
                    setSearch('');
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

      <PartyFormDialog
        open={formDialogOpen}
        party={selectedParty}
        isLoading={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleFormSubmit}
        onClose={handleCloseFormDialog}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Party"
        message={`Are you sure you want to delete "${partyToDelete?.name}"?`}
        confirmLabel="Delete"
        confirmColor="error"
        isLoading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteDialog}
      />
    </Box>
  );
};

export default PartiesPage;
