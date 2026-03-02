import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Autocomplete,
  CircularProgress,
  IconButton,
  Box,
  Typography,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Add as AddIcon,
  DeleteOutline as DeleteIcon,
} from '@mui/icons-material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { WorkLog, User, JobRate } from '../../../types';
import {
  workLogFormSchema,
  type WorkLogFormData,
} from '../schemas/workLogSchema';
import type { WorkLogBulkPayload } from '../../../api/work-logs.api';
import { useUsersByRole } from '../../../hooks/useUsers';
import { useJobRates } from '../../../hooks/useJobRates';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import { USER_ROLES } from '../../../constants';

const today = new Date().toISOString().slice(0, 10);

const defaultRow = {
  work_date: today,
  start_time: '09:00',
  end_time: '17:00',
  quantity: 0 as number,
  notes: '',
};

interface WorkLogFormDialogProps {
  open: boolean;
  workLog?: WorkLog | null;
  isLoading?: boolean;
  onSubmit: (data: Partial<WorkLog>) => void;
  onBulkSubmit: (data: WorkLogBulkPayload) => void;
  onClose: () => void;
}

export const WorkLogFormDialog: React.FC<WorkLogFormDialogProps> = ({
  open,
  workLog,
  isLoading = false,
  onSubmit,
  onBulkSubmit,
  onClose,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isEditing = !!workLog;

  // ── Workers autocomplete ──────────────────────────────────────────────────
  const { data: workers = [] } = useUsersByRole([USER_ROLES.WORKER]);
  const workerOptions = Array.isArray(workers) ? workers : [];

  // ── Job rates — server-side search ───────────────────────────────────────
  const [jobRateInput, setJobRateInput] = useState('');
  const [selectedJobRateObj, setSelectedJobRateObj] = useState<JobRate | null>(null);
  const debouncedJobRateSearch = useDebouncedValue(jobRateInput, 300);
  const { data: jobRates = [], isFetching: jobRatesFetching } = useJobRates({
    search: debouncedJobRateSearch || undefined,
  });
  const jobRateOptions = selectedJobRateObj
    ? [selectedJobRateObj, ...jobRates.filter((jr) => jr.id !== selectedJobRateObj.id)]
    : jobRates;

  const getJobRateLabel = (jr: JobRate) =>
    `${jr.product_part_no || jr.operation_code} - ${jr.operation_code} - ${jr.operation_name || ''}`;

  // ── Form ──────────────────────────────────────────────────────────────────
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
      rows: [{ ...defaultRow }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'rows' });
  const watchedRows = watch('rows');

  // ── Reset on open ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (open) {
      setJobRateInput('');
      if (workLog) {
        reset({
          user_id: workLog.user_id,
          job_rate_id: workLog.job_rate_id,
          rows: [{
            work_date: workLog.work_date?.slice(0, 10) || today,
            start_time: workLog.start_time || '09:00',
            end_time: workLog.end_time || '17:00',
            quantity: workLog.quantity ?? 0,
            notes: workLog.notes || '',
          }],
        });
        setSelectedJobRateObj({
          id: workLog.job_rate_id,
          operation_code: workLog.operation_code || '',
          operation_name: workLog.operation_name || '',
          rate: workLog.rate,
          product_part_no: workLog.product_part_no,
          product_id: workLog.product_id || 0,
          sequence: 0,
          created_at: '',
          updated_at: '',
        });
      } else {
        reset({
          user_id: 0,
          job_rate_id: 0,
          rows: [{ ...defaultRow }],
        });
        setSelectedJobRateObj(null);
      }
    }
  }, [open, workLog, reset]);

  // ── Per-row computed values ───────────────────────────────────────────────
  const getRowDuration = (index: number) => {
    const row = watchedRows?.[index];
    if (!row?.start_time || !row?.end_time) return null;
    const [sh, sm] = row.start_time.split(':').map(Number);
    const [eh, em] = row.end_time.split(':').map(Number);
    const d = eh * 60 + em - (sh * 60 + sm);
    return d > 0 ? d : null;
  };

  const getRowTotal = (index: number) => {
    const row = watchedRows?.[index];
    if (!row || !selectedJobRateObj) return null;
    const total = (Number(row.quantity) || 0) * (Number(selectedJobRateObj.rate) || 0);
    return total > 0 ? total.toFixed(2) : null;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleFormSubmit = (data: WorkLogFormData) => {
    if (isEditing) {
      const row = data.rows[0];
      onSubmit({
        user_id: data.user_id,
        job_rate_id: data.job_rate_id,
        work_date: row.work_date,
        start_time: row.start_time,
        end_time: row.end_time,
        quantity: row.quantity,
        notes: row.notes?.trim() || undefined,
      });
    } else {
      onBulkSubmit({
        user_id: data.user_id,
        job_rate_id: data.job_rate_id,
        items: data.rows.map((row) => ({
          work_date: row.work_date,
          start_time: row.start_time,
          end_time: row.end_time,
          quantity: Number(row.quantity),
          notes: row.notes?.trim() || undefined,
        })),
      });
    }
  };

  const handleAddRow = () => {
    const last = watchedRows?.[fields.length - 1];
    append({
      work_date: last?.work_date || today,
      start_time: '09:00',
      end_time: '17:00',
      quantity: 0,
      notes: '',
    });
  };

  const rowErrors = errors?.rows;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={isEditing ? 'sm' : 'md'}
      fullWidth
      fullScreen={isMobile}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogTitle>
          {isEditing ? 'Edit Work Log' : 'Add Work Logs'}
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            {/* Worker */}
            <Grid size={12}>
              <Controller
                name="user_id"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    options={workerOptions}
                    getOptionLabel={(opt) =>
                      typeof opt === 'object' && opt
                        ? `${(opt as User).name} (${(opt as User).username})`
                        : ''
                    }
                    value={field.value ? (workerOptions.find((u) => u.id === field.value) ?? null) : null}
                    onChange={(_, value) => field.onChange((value as User)?.id ?? 0)}
                    isOptionEqualToValue={(opt, val) => (opt as User).id === (val as User)?.id}
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

            {/* Operation */}
            <Grid size={12}>
              <Controller
                name="job_rate_id"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    options={jobRateOptions}
                    getOptionLabel={(opt) =>
                      typeof opt === 'object' && opt ? getJobRateLabel(opt as JobRate) : ''
                    }
                    value={selectedJobRateObj}
                    onChange={(_, value) => {
                      const jr = value as JobRate | null;
                      field.onChange(jr?.id ?? 0);
                      setSelectedJobRateObj(jr);
                    }}
                    onInputChange={(_, val, reason) => {
                      if (reason !== 'reset') setJobRateInput(val);
                    }}
                    filterOptions={(x) => x}
                    isOptionEqualToValue={(opt, val) =>
                      (opt as JobRate).id === (val as JobRate)?.id
                    }
                    loading={jobRatesFetching}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Operation (Product - Operation)"
                        error={!!errors.job_rate_id}
                        helperText={errors.job_rate_id?.message}
                        disabled={isLoading}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {jobRatesFetching && <CircularProgress size={18} />}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    disabled={isLoading}
                  />
                )}
              />
            </Grid>

            {/* Rate + Operation Code */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Rate"
                value={selectedJobRateObj?.rate ?? '-'}
                disabled
                fullWidth
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Operation Code"
                value={selectedJobRateObj?.operation_code ?? '-'}
                disabled
                fullWidth
                size="small"
              />
            </Grid>
          </Grid>

          {/* ── Rows ── */}
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 2 }} />

            {/* Column header — desktop only */}
            {!isMobile && (
              <Box
                sx={{
                  display: { xs: 'none', sm: 'flex' },
                  gap: 1,
                  mb: 0.5,
                  px: 0.5,
                  alignItems: 'center',
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ width: 140, flexShrink: 0 }}>Date</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ width: 80, flexShrink: 0 }}>Quantity</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ width: 95, flexShrink: 0 }}>Start</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ width: 95, flexShrink: 0 }}>End</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>Notes</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ width: 68, textAlign: 'center', flexShrink: 0 }}>Total</Typography>
                <Box sx={{ width: 36, flexShrink: 0 }} />
              </Box>
            )}

            {fields.map((field, index) => (
              <Box key={field.id}>
                {/* Mobile: stacked card */}
                {isMobile ? (
                  <Box
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      p: 1.5,
                      mb: 1.5,
                      position: 'relative',
                    }}
                  >
                    {fields.length > 1 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">Row {index + 1}</Typography>
                        <IconButton size="small" color="error" onClick={() => remove(index)} disabled={isLoading}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                    <Grid container spacing={1.5}>
                      <Grid size={12}>
                        <Controller
                          name={`rows.${index}.work_date`}
                          control={control}
                          render={({ field: f }) => (
                            <TextField
                              {...f}
                              label="Work Date"
                              type="date"
                              InputLabelProps={{ shrink: true }}
                              error={!!rowErrors?.[index]?.work_date}
                              helperText={rowErrors?.[index]?.work_date?.message}
                              disabled={isLoading}
                              fullWidth
                              size="small"
                            />
                          )}
                        />
                      </Grid>
                      <Grid size={12}>
                        <Controller
                          name={`rows.${index}.quantity`}
                          control={control}
                          render={({ field: f }) => (
                            <TextField
                              {...f}
                              label="Quantity"
                              type="number"
                              inputProps={{ step: '0.01', min: 0 }}
                              onChange={(e) =>
                                f.onChange(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)
                              }
                              error={!!rowErrors?.[index]?.quantity}
                              helperText={rowErrors?.[index]?.quantity?.message}
                              disabled={isLoading}
                              fullWidth
                              size="small"
                            />
                          )}
                        />
                      </Grid>
                      <Grid size={6}>
                        <Controller
                          name={`rows.${index}.start_time`}
                          control={control}
                          render={({ field: f }) => (
                            <TextField
                              {...f}
                              label="Start"
                              type="time"
                              InputLabelProps={{ shrink: true }}
                              inputProps={{ step: 300 }}
                              error={!!rowErrors?.[index]?.start_time}
                              helperText={rowErrors?.[index]?.start_time?.message}
                              disabled={isLoading}
                              fullWidth
                              size="small"
                            />
                          )}
                        />
                      </Grid>
                      <Grid size={6}>
                        <Controller
                          name={`rows.${index}.end_time`}
                          control={control}
                          render={({ field: f }) => (
                            <TextField
                              {...f}
                              label="End"
                              type="time"
                              InputLabelProps={{ shrink: true }}
                              inputProps={{ step: 300 }}
                              error={!!(rowErrors?.[index] as { end_time?: { message?: string } })?.end_time}
                              helperText={(rowErrors?.[index] as { end_time?: { message?: string } })?.end_time?.message}
                              disabled={isLoading}
                              fullWidth
                              size="small"
                            />
                          )}
                        />
                      </Grid>
                      <Grid size={12}>
                        <Controller
                          name={`rows.${index}.notes`}
                          control={control}
                          render={({ field: f }) => (
                            <TextField
                              {...f}
                              label="Notes (optional)"
                              disabled={isLoading}
                              fullWidth
                              size="small"
                            />
                          )}
                        />
                      </Grid>
                      {getRowDuration(index) !== null && (
                        <Grid size={12}>
                          <Typography variant="caption" color="text.secondary">
                            Duration: {getRowDuration(index)} min
                            {getRowTotal(index) ? ` · Total: ₹${getRowTotal(index)}` : ''}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                ) : (
                  /* Desktop: horizontal row */
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 1,
                      alignItems: 'flex-start',
                      mb: 1,
                    }}
                  >
                    <Controller
                      name={`rows.${index}.work_date`}
                      control={control}
                      render={({ field: f }) => (
                        <TextField
                          {...f}
                          type="date"
                          InputLabelProps={{ shrink: true }}
                          error={!!rowErrors?.[index]?.work_date}
                          helperText={rowErrors?.[index]?.work_date?.message}
                          disabled={isLoading}
                          size="small"
                          sx={{ width: 140, flexShrink: 0 }}
                        />
                      )}
                    />
                    <Controller
                      name={`rows.${index}.quantity`}
                      control={control}
                      render={({ field: f }) => (
                        <TextField
                          {...f}
                          type="number"
                          placeholder="Qty"
                          inputProps={{ step: '0.01', min: 0 }}
                          onChange={(e) =>
                            f.onChange(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)
                          }
                          error={!!rowErrors?.[index]?.quantity}
                          helperText={rowErrors?.[index]?.quantity?.message}
                          disabled={isLoading}
                          size="small"
                          sx={{ width: 80, flexShrink: 0 }}
                        />
                      )}
                    />
                    <Controller
                      name={`rows.${index}.start_time`}
                      control={control}
                      render={({ field: f }) => (
                        <TextField
                          {...f}
                          type="time"
                          InputLabelProps={{ shrink: true }}
                          inputProps={{ step: 300 }}
                          error={!!rowErrors?.[index]?.start_time}
                          helperText={rowErrors?.[index]?.start_time?.message}
                          disabled={isLoading}
                          size="small"
                          sx={{ width: 95, flexShrink: 0 }}
                        />
                      )}
                    />
                    <Controller
                      name={`rows.${index}.end_time`}
                      control={control}
                      render={({ field: f }) => (
                        <TextField
                          {...f}
                          type="time"
                          InputLabelProps={{ shrink: true }}
                          inputProps={{ step: 300 }}
                          error={!!(rowErrors?.[index] as { end_time?: { message?: string } })?.end_time}
                          helperText={(rowErrors?.[index] as { end_time?: { message?: string } })?.end_time?.message}
                          disabled={isLoading}
                          size="small"
                          sx={{ width: 95, flexShrink: 0 }}
                        />
                      )}
                    />
                    <Controller
                      name={`rows.${index}.notes`}
                      control={control}
                      render={({ field: f }) => (
                        <TextField
                          {...f}
                          placeholder="Notes"
                          disabled={isLoading}
                          size="small"
                          sx={{ flex: 1 }}
                        />
                      )}
                    />
                    {/* Duration + Total */}
                    <Box
                      sx={{
                        width: 68,
                        flexShrink: 0,
                        pt: 1,
                        textAlign: 'center',
                      }}
                    >
                      {getRowDuration(index) !== null ? (
                        <>
                          <Typography variant="caption" display="block" color="text.secondary">
                            {getRowDuration(index)}m
                          </Typography>
                          {getRowTotal(index) && (
                            <Typography variant="caption" display="block" fontWeight={600}>
                              ₹{getRowTotal(index)}
                            </Typography>
                          )}
                        </>
                      ) : (
                        <Typography variant="caption" color="text.disabled">-</Typography>
                      )}
                    </Box>

                    {/* Delete row */}
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1 || isLoading}
                      sx={{ flexShrink: 0, mt: 0.5 }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </Box>
            ))}

            {/* Add Row — only for create mode */}
            {!isEditing && (
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAddRow}
                disabled={isLoading}
                sx={{ mt: 0.5 }}
              >
                Add Row
              </Button>
            )}
          </Box>
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
            {isLoading
              ? 'Saving...'
              : isEditing
                ? 'Update'
                : fields.length > 1
                  ? `Create All (${fields.length})`
                  : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default WorkLogFormDialog;
