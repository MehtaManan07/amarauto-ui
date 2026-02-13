import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { PartyInfoCard, PartyFormDialog } from './components';
import {
  useParty,
  useUpdateParty,
  useDeleteParty,
} from '../../hooks/useParties';
import type { Party } from '../../types';

export const PartyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const partyId = parseInt(id || '0', 10);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: party, isLoading, isError, refetch } = useParty(partyId);
  const updateMutation = useUpdateParty();
  const deleteMutation = useDeleteParty();

  const handleEditSubmit = (data: Partial<Party>) => {
    updateMutation.mutate(
      { id: partyId, data },
      { onSuccess: () => setEditDialogOpen(false) }
    );
  };

  const handleConfirmDelete = () => {
    deleteMutation.mutate(partyId, {
      onSuccess: () => navigate('/parties'),
    });
  };

  if (isLoading) {
    return <LoadingState message="Loading party..." fullPage />;
  }

  if (isError || !party) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  return (
    <Box>
      <PageHeader
        title={party.name}
        subtitle={party.state ? `${party.state} • ${party.party_type || 'Customer'}` : 'Customer'}
        breadcrumbs={[
          { label: 'Parties', path: '/parties' },
          { label: party.name },
        ]}
      />

      <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
        <Tooltip title="Back to Parties">
          <IconButton
            onClick={() => navigate('/parties')}
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
      </Box>

      <PartyInfoCard party={party} />

      <PartyFormDialog
        open={editDialogOpen}
        party={party}
        isLoading={updateMutation.isPending}
        onSubmit={handleEditSubmit}
        onClose={() => setEditDialogOpen(false)}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Party"
        message={`Are you sure you want to delete "${party.name}"?`}
        confirmLabel="Delete"
        confirmColor="error"
        isLoading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </Box>
  );
};

export default PartyDetailPage;
