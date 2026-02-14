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
import type { WorkLog, User, JobRate } from '../../../types';
import {
  workLogFormSchema,
  type WorkLogFormData,
} from '../schemas/workLogSchema';
import { useUsersByRole } from '../../../hooks/useUsers';
import { useJobRates } from '../../../hooks/useJobRates';
import { USER_ROLES } from '../../../constants';

interface WorkLogFormDialogProps {
  open: boolean;
  workLog?: WorkLog | null;
  isLoading?: boolean;
  onSubmit: (data: Partial<WorkLog>) => void;
  onClose: () => void;
}

export const WorkLogFormDialog: React.FC<WorkLogFormDialogProps> = ({
  open,
  workLog,
  isLoading = false,
  onSubmit,
  onClose,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isEditing = !!workLog;

  const { data: workers = [] } = useUsersByRole([USER_ROLES.WORKER]);
  const { data: jobRates = [] } = useJobRates({});

  const getJobRateLabel = (jr: JobRate) =>
    `${jr.product_part_no || jr.operation_code} - ${jr.operation_name || ''}`;

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<WorkLogFormData>({
    resolver: zodResolver(workLogFormSchema) as never,
    defaultValues: {
      user_id: 0,
      job_rate_id: 0,
      work_date: new Date().toISOString().slice(0, 10),
      start_time: '09:00',
      end_time: '17:00',
      quantity: 0,
      notes: '',
    },
  });

  const watchedQuantity = watch('quantity');
  const watchedJobRateId = watch('job_rate_id');
  const watchedStartTime = watch('start_time');
  const watchedEndTime = watch('end_time');

  const computedDuration =
    watchedStartTime && watchedEndTime
      ? (() => {
          const [sh, sm] = watchedStartTime.split(':').map(Number);
          const [eh, em] = watchedEndTime.split(':').map(Number);
          const startM = sh * 60 + sm;
          const endM = eh * 60 + em;
          return endM > startM ? endM - startM : null;
        })()
      : null;
  const selectedJobRate = jobRates.find((jr) => jr.id === watchedJobRateId);
  const computedTotal = selectedJobRate
    ? (watchedQuantity || 0) * (selectedJobRate.rate || 0)
    : 0;

  useEffect(() => {
    if (open) {
      if (workLog) {
        reset({
          user_id: workLog.user_id,
          job_rate_id: workLog.job_rate_id,
          work_date: workLog.work_date?.slice(0, 10) || new Date().toISOString().slice(0, 10),
          start_time: workLog.start_time || '09:00',
          end_time: workLog.end_time || '17:00',
          quantity: workLog.quantity ?? 0,
          notes: workLog.notes || '',
        });
      } else {
        reset({
          user_id: 0,
          job_rate_id: 0,
          work_date: new Date().toISOString().slice(0, 10),
          start_time: '09:00',
          end_time: '17:00',
          quantity: 0,
          notes: '',
        });
      }
    }
  }, [open, workLog, reset]);

  const handleFormSubmit = (data: WorkLogFormData) => {
    const payload = {
      user_id: data.user_id,
      job_rate_id: data.job_rate_id,
      work_date: data.work_date,
      start_time: data.start_time,
      end_time: data.end_time,
      quantity: data.quantity,
      notes: data.notes?.trim() || undefined,
    };
    onSubmit(payload as Partial<WorkLog>);
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
          {isEditing ? 'Edit Work Log' : 'Add Work Log'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={12}>
              <Controller
                name="user_id"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    options={workers}
                    getOptionLabel={(opt) =>
                      typeof opt === 'object' && opt
                        ? `${(opt as User).name} (${(opt as User).username})`
                        : ''
                    }
                    value={
                      field.value
                        ? (workers.find((u) => u.id === field.value) ?? null)
                        : null
                    }
                    onChange={(_, value) =>
                      field.onChange((value as User)?.id ?? 0)
                    }
                    isOptionEqualToValue={(opt, val) =>
                      (opt as User).id === (val as User)?.id
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Worker"
                        error={!!errors.user_id}
                        helperText={errors.user_id?.message}
                        disabled={isLoading}
                      />
                    )}
                    disabled={isLoading}
                  />
                )}
              />
            </Grid>
            <Grid size={12}>
              <Controller
                name="job_rate_id"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    options={jobRates}
                    getOptionLabel={(opt) =>
                      typeof opt === 'object' && opt
                        ? getJobRateLabel(opt as JobRate)
                        : ''
                    }
                    value={
                      field.value
                        ? (jobRates.find((jr) => jr.id === field.value) ?? null)
                        : null
                    }
                    onChange={(_, value) =>
                      field.onChange((value as JobRate)?.id ?? 0)
                    }
                    isOptionEqualToValue={(opt, val) =>
                      (opt as JobRate).id === (val as JobRate)?.id
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Operation (Product - Operation)"
                        error={!!errors.job_rate_id}
                        helperText={errors.job_rate_id?.message}
                        disabled={isLoading}
                      />
                    )}
                    disabled={isLoading}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="work_date"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Work Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.work_date}
                    helperText={errors.work_date?.message}
                    disabled={isLoading}
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="quantity"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === ''
                          ? ''
                          : parseFloat(e.target.value) || 0
                      )
                    }
                    label="Quantity"
                    type="number"
                    inputProps={{ step: '0.01', min: 0 }}
                    error={!!errors.quantity}
                    helperText={errors.quantity?.message}
                    disabled={isLoading}
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller
                name="start_time"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Start Time"
                    type="time"
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ step: 300 }}
                    error={!!errors.start_time}
                    helperText={errors.start_time?.message}
                    disabled={isLoading}
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller
                name="end_time"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="End Time"
                    type="time"
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ step: 300 }}
                    error={!!errors.end_time}
                    helperText={errors.end_time?.message}
                    disabled={isLoading}
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Duration"
                value={
                  computedDuration !== null
                    ? `${computedDuration} min`
                    : '-'
                }
                disabled
                fullWidth
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Rate"
                value={selectedJobRate?.rate ?? '-'}
                disabled
                fullWidth
                size="small"
              />
            </Grid>
            <Grid size={12}>
              <TextField
                label="Total Amount"
                value={computedTotal > 0 ? computedTotal.toFixed(2) : '-'}
                disabled
                fullWidth
                size="small"
              />
            </Grid>
            <Grid size={12}>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Notes"
                    multiline
                    rows={2}
                    disabled={isLoading}
                    fullWidth
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
            {isLoading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default WorkLogFormDialog;
