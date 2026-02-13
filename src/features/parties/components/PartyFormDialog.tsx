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
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Party } from '../../../types';
import {
  partyFormSchema,
  type PartyFormData,
} from '../schemas/partySchema';
import { usePartyFieldOptions } from '../../../hooks/useParties';

interface PartyFormDialogProps {
  open: boolean;
  party?: Party | null;
  isLoading?: boolean;
  onSubmit: (data: Partial<Party>) => void;
  onClose: () => void;
}

export const PartyFormDialog: React.FC<PartyFormDialogProps> = ({
  open,
  party,
  isLoading = false,
  onSubmit,
  onClose,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isEditing = !!party;

  const { data: fieldOptions } = usePartyFieldOptions();
  const stateOptions = fieldOptions?.state ?? [];
  const partyTypeOptions = fieldOptions?.party_type ?? [];

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PartyFormData>({
    resolver: zodResolver(partyFormSchema) as never,
    defaultValues: {
      name: '',
      email: '',
      state: '',
      party_type: '',
      address_line_1: '',
      address_line_2: '',
      address_line_3: '',
      address_line_4: '',
      address_line_5: '',
      pin_code: '',
      phone: '',
      fax: '',
      contact_person: '',
      mobile: '',
      gstin: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (party) {
        reset({
          name: party.name,
          email: party.email || '',
          state: party.state || '',
          party_type: party.party_type || '',
          address_line_1: party.address_line_1 || '',
          address_line_2: party.address_line_2 || '',
          address_line_3: party.address_line_3 || '',
          address_line_4: party.address_line_4 || '',
          address_line_5: party.address_line_5 || '',
          pin_code: party.pin_code || '',
          phone: party.phone || '',
          fax: party.fax || '',
          contact_person: party.contact_person || '',
          mobile: party.mobile || '',
          gstin: party.gstin || '',
        });
      } else {
        reset({
          name: '',
          email: '',
          state: '',
          party_type: '',
          address_line_1: '',
          address_line_2: '',
          address_line_3: '',
          address_line_4: '',
          address_line_5: '',
          pin_code: '',
          phone: '',
          fax: '',
          contact_person: '',
          mobile: '',
          gstin: '',
        });
      }
    }
  }, [open, party, reset]);

  const handleFormSubmit = (data: PartyFormData) => {
    const payload = {
      name: data.name,
      email: data.email || undefined,
      state: data.state || undefined,
      party_type: data.party_type || undefined,
      address_line_1: data.address_line_1 || undefined,
      address_line_2: data.address_line_2 || undefined,
      address_line_3: data.address_line_3 || undefined,
      address_line_4: data.address_line_4 || undefined,
      address_line_5: data.address_line_5 || undefined,
      pin_code: data.pin_code || undefined,
      phone: data.phone || undefined,
      fax: data.fax || undefined,
      contact_person: data.contact_person || undefined,
      mobile: data.mobile || undefined,
      gstin: data.gstin || undefined,
    };
    onSubmit(payload as Partial<Party>);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogTitle>
          {isEditing ? 'Edit Party' : 'Add Party'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={12}>
              <TextField
                {...register('name')}
                label="Name"
                error={!!errors.name}
                helperText={errors.name?.message}
                disabled={isLoading}
                autoFocus
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...register('email')}
                label="Email"
                type="email"
                disabled={isLoading}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="state"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    freeSolo
                    options={stateOptions}
                    value={field.value || null}
                    onChange={(_, value) => field.onChange(value ?? '')}
                    onInputChange={(_, value, reason) => {
                      if (reason === 'input') field.onChange(value);
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="State" disabled={isLoading} />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="party_type"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    freeSolo
                    options={partyTypeOptions}
                    value={field.value || null}
                    onChange={(_, value) => field.onChange(value ?? '')}
                    onInputChange={(_, value, reason) => {
                      if (reason === 'input') field.onChange(value);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Party Type"
                        disabled={isLoading}
                      />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...register('pin_code')}
                label="PIN Code"
                disabled={isLoading}
                fullWidth
              />
            </Grid>
            <Grid size={12}>
              <TextField
                {...register('address_line_1')}
                label="Address Line 1"
                disabled={isLoading}
                fullWidth
              />
            </Grid>
            <Grid size={12}>
              <TextField
                {...register('address_line_2')}
                label="Address Line 2"
                disabled={isLoading}
                fullWidth
              />
            </Grid>
            <Grid size={12}>
              <TextField
                {...register('address_line_3')}
                label="Address Line 3"
                disabled={isLoading}
                fullWidth
              />
            </Grid>
            <Grid size={12}>
              <TextField
                {...register('address_line_4')}
                label="Address Line 4"
                disabled={isLoading}
                fullWidth
              />
            </Grid>
            <Grid size={12}>
              <TextField
                {...register('address_line_5')}
                label="Address Line 5"
                disabled={isLoading}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...register('phone')}
                label="Phone"
                disabled={isLoading}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...register('fax')}
                label="Fax"
                disabled={isLoading}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...register('contact_person')}
                label="Contact Person"
                disabled={isLoading}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...register('mobile')}
                label="Mobile"
                disabled={isLoading}
                fullWidth
              />
            </Grid>
            <Grid size={12}>
              <TextField
                {...register('gstin')}
                label="GSTIN"
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
            {isLoading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default PartyFormDialog;
