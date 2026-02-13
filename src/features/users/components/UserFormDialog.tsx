import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Autocomplete,
  InputAdornment,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { User } from '../../../types';
import {
  createUserFormSchema,
  updateUserFormSchema,
  type CreateUserFormData,
  type UpdateUserFormData,
} from '../schemas/userSchema';

const ROLE_OPTIONS = ['Admin', 'Supervisor', 'Staff', 'Worker'];
const STATUS_OPTIONS = ['Active', 'Inactive'];

interface UserFormDialogProps {
  open: boolean;
  user?: User | null;
  isLoading?: boolean;
  isAdmin?: boolean;
  onSubmit: (data: Partial<User> & { password?: string }) => void;
  onClose: () => void;
}

export const UserFormDialog: React.FC<UserFormDialogProps> = ({
  open,
  user,
  isLoading = false,
  isAdmin = false,
  onSubmit,
  onClose,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isEditing = !!user;

  const [showPassword, setShowPassword] = React.useState(false);

  const createForm = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserFormSchema) as never,
    defaultValues: {
      username: '',
      password: '',
      name: '',
      role: 'Worker',
      phone: '',
      job: '',
    },
  });

  const updateForm = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserFormSchema) as never,
    defaultValues: {
      name: '',
      role: 'Worker',
      phone: '',
      job: '',
      status: 'Active',
      password: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (user) {
        updateForm.reset({
          name: user.name,
          role: user.role,
          phone: user.phone || '',
          job: user.job || '',
          status: user.status,
          password: '',
        });
      } else {
        createForm.reset({
          username: '',
          password: '',
          name: '',
          role: 'Worker',
          phone: '',
          job: '',
        });
      }
    }
  }, [open, user, createForm, updateForm]);

  const handleCreateSubmit = (data: CreateUserFormData) => {
    onSubmit({
      username: data.username,
      password: data.password,
      name: data.name,
      role: data.role,
      phone: data.phone || undefined,
      job: data.job || undefined,
    } as Partial<User> & { password: string });
  };

  const handleUpdateSubmit = (data: UpdateUserFormData) => {
    const payload: Partial<User> & { password?: string } = {
      name: data.name,
      role: data.role,
      phone: data.phone || undefined,
      job: data.job || undefined,
      status: data.status,
    };
    if (data.password && data.password.trim()) {
      payload.password = data.password;
    }
    onSubmit(payload);
  };

  if (isEditing) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth fullScreen={isMobile}>
        <form onSubmit={updateForm.handleSubmit(handleUpdateSubmit)}>
          <DialogTitle>Edit User</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid size={12}>
                <TextField
                  label="Username"
                  value={user?.username ?? ''}
                  disabled
                  fullWidth
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  {...updateForm.register('name')}
                  label="Name"
                  error={!!updateForm.formState.errors.name}
                  helperText={updateForm.formState.errors.name?.message}
                  disabled={isLoading}
                  fullWidth
                />
              </Grid>
              <Grid size={12}>
                <Controller
                  name="role"
                  control={updateForm.control}
                  render={({ field }) => (
                    <Autocomplete
                      options={ROLE_OPTIONS}
                      value={field.value}
                      onChange={(_, value) => field.onChange(value ?? 'Worker')}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Role"
                          error={!!updateForm.formState.errors.role}
                          helperText={updateForm.formState.errors.role?.message}
                          disabled={isLoading}
                        />
                      )}
                      disabled={isLoading}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  {...updateForm.register('phone')}
                  label="Phone"
                  disabled={isLoading}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  {...updateForm.register('job')}
                  label="Job"
                  disabled={isLoading}
                  fullWidth
                />
              </Grid>
              {isAdmin && (
                <Grid size={12}>
                  <TextField
                    {...updateForm.register('password')}
                    label="New Password (leave blank to keep current)"
                    type={showPassword ? 'text' : 'password'}
                    disabled={isLoading}
                    fullWidth
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              )}
              <Grid size={12}>
                <Controller
                  name="status"
                  control={updateForm.control}
                  render={({ field }) => (
                    <Autocomplete
                      options={STATUS_OPTIONS}
                      value={field.value}
                      onChange={(_, value) => field.onChange(value ?? 'Active')}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Status"
                          error={!!updateForm.formState.errors.status}
                          helperText={updateForm.formState.errors.status?.message}
                          disabled={isLoading}
                        />
                      )}
                      disabled={isLoading}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: 2, gap: 1 }}>
            <Button onClick={onClose} disabled={isLoading} fullWidth={isMobile}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              fullWidth={isMobile}
            >
              {isLoading ? 'Saving...' : 'Update'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth fullScreen={isMobile}>
      <form onSubmit={createForm.handleSubmit(handleCreateSubmit)}>
        <DialogTitle>Add User</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={12}>
              <TextField
                {...createForm.register('username')}
                label="Username"
                error={!!createForm.formState.errors.username}
                helperText={createForm.formState.errors.username?.message}
                disabled={isLoading}
                fullWidth
                autoFocus
              />
            </Grid>
            <Grid size={12}>
              <TextField
                {...createForm.register('password')}
                label="Password"
                type={showPassword ? 'text' : 'password'}
                error={!!createForm.formState.errors.password}
                helperText={createForm.formState.errors.password?.message}
                disabled={isLoading}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                {...createForm.register('name')}
                label="Name"
                error={!!createForm.formState.errors.name}
                helperText={createForm.formState.errors.name?.message}
                disabled={isLoading}
                fullWidth
              />
            </Grid>
            <Grid size={12}>
              <Controller
                name="role"
                control={createForm.control}
                render={({ field }) => (
                  <Autocomplete
                    options={ROLE_OPTIONS}
                    value={field.value}
                    onChange={(_, value) => field.onChange(value ?? 'Worker')}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Role"
                        error={!!createForm.formState.errors.role}
                        helperText={createForm.formState.errors.role?.message}
                        disabled={isLoading}
                      />
                    )}
                    disabled={isLoading}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...createForm.register('phone')}
                label="Phone"
                disabled={isLoading}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...createForm.register('job')}
                label="Job"
                disabled={isLoading}
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: 2, gap: 1 }}>
          <Button onClick={onClose} disabled={isLoading} fullWidth={isMobile}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            fullWidth={isMobile}
          >
            {isLoading ? 'Saving...' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UserFormDialog;
