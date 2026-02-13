import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { PageHeader } from '../../components/common/PageHeader';
import { SearchInput } from '../../components/common/SearchInput';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { ResponsiveTable } from '../../components/common/ResponsiveTable';
import { UserFormDialog } from './components/UserFormDialog';
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from '../../hooks/useUsers';
import { useAuthStore } from '../../stores/authStore';
import { USER_ROLES } from '../../constants';
import type { User } from '../../types';

export const UsersPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const currentUser = useAuthStore((state) => state.user);
  const isAdmin = currentUser?.role === USER_ROLES.ADMIN;

  const { data: users = [], isLoading, isError, refetch } = useUsers({ search: search || undefined });
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();

  const handleOpenCreateDialog = () => {
    setSelectedUser(null);
    setFormDialogOpen(true);
  };

  const handleOpenEditDialog = (u: User) => {
    setSelectedUser(u);
    setFormDialogOpen(true);
  };

  const handleCloseFormDialog = () => {
    setFormDialogOpen(false);
    setSelectedUser(null);
  };

  const handleFormSubmit = (data: Partial<User> & { password?: string }) => {
    if (selectedUser) {
      const payload = { ...data };
      if (!payload.password) delete payload.password;
      updateMutation.mutate(
        { id: selectedUser.id, data: payload },
        { onSuccess: () => handleCloseFormDialog() }
      );
    } else {
      createMutation.mutate(data as Partial<User> & { password: string }, {
        onSuccess: () => handleCloseFormDialog(),
      });
    }
  };

  const handleOpenDeleteDialog = (u: User) => {
    setUserToDelete(u);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      deleteMutation.mutate(userToDelete.id, {
        onSuccess: () => handleCloseDeleteDialog(),
      });
    }
  };

  const columns = [
    {
      id: 'username',
      label: 'Username',
      mobileLabel: 'User',
      render: (u: User) => (
        <Typography variant="body2" fontWeight={600}>
          {u.username}
        </Typography>
      ),
    },
    {
      id: 'name',
      label: 'Name',
      render: (u: User) => (
        <Typography variant="body2" color="text.secondary">
          {u.name}
        </Typography>
      ),
      hideOnMobile: true,
    },
    {
      id: 'role',
      label: 'Role',
      render: (u: User) => (
        <Chip
          label={u.role}
          size="small"
          color={
            u.role === 'Admin'
              ? 'error'
              : u.role === 'Supervisor'
              ? 'primary'
              : u.role === 'Staff'
              ? 'secondary'
              : 'default'
          }
          variant="outlined"
        />
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (u: User) => (
        <Chip
          label={u.status}
          size="small"
          color={u.status === 'Active' ? 'success' : 'default'}
          variant="outlined"
        />
      ),
      hideOnMobile: true,
    },
    {
      id: 'job',
      label: 'Job',
      render: (u: User) => (
        <Typography variant="body2" color="text.secondary">
          {u.job || '-'}
        </Typography>
      ),
      hideOnMobile: true,
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'center' as const,
      isAction: true,
      render: (u: User) =>
        isAdmin ? (
          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenEditDialog(u);
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
                  handleOpenDeleteDialog(u);
                }}
                disabled={u.id === currentUser?.id}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ) : null,
    },
  ];

  const renderTableContent = () => {
    if (isLoading) {
      return <LoadingState message="Loading users..." />;
    }

    if (isError) {
      return <ErrorState onRetry={() => refetch()} />;
    }

    if (!users || users.length === 0) {
      return (
        <EmptyState
          title="No users found"
          message={
            search
              ? 'Try a different search term'
              : 'Add your first user to get started'
          }
          actionLabel={!search && isAdmin ? 'Add User' : undefined}
          onAction={!search && isAdmin ? handleOpenCreateDialog : undefined}
        />
      );
    }

    return (
      <ResponsiveTable
        columns={columns}
        data={users}
        keyExtractor={(u) => u.id.toString()}
        emptyMessage="No users found"
      />
    );
  };

  return (
    <Box>
      <PageHeader
        title="Users"
        subtitle={
          users.length > 0
            ? `${users.length} user${users.length === 1 ? '' : 's'}`
            : 'Manage system users'
        }
        action={
          isAdmin ? (
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateDialog}>
              Add User
            </Button>
          ) : undefined
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
        <Box sx={{ minWidth: 200, flex: 1 }}>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by username, name, role..."
          />
        </Box>
      </Box>

      <Card>{renderTableContent()}</Card>

      <UserFormDialog
        open={formDialogOpen}
        user={selectedUser}
        isLoading={createMutation.isPending || updateMutation.isPending}
        isAdmin={isAdmin}
        onSubmit={handleFormSubmit}
        onClose={handleCloseFormDialog}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete User"
        message={`Are you sure you want to delete "${userToDelete?.name}" (${userToDelete?.username})? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmColor="error"
        isLoading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteDialog}
      />
    </Box>
  );
};

export default UsersPage;
