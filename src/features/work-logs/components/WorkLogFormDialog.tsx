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
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Add as AddIcon,
  DeleteOutline as DeleteIcon,
} from '@mui/icons-material';
import { useForm, Controller, useFieldArray, type Control, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { WorkLog, User, JobRate } from '../../../types';
import {
  workLogFormSchema,
  type WorkLogFormData,
  type WorkLogRowData,
} from '../schemas/workLogSchema';
import type { WorkLogBulkPayload } from '../../../api/work-logs.api';
import { useUsersByRole } from '../../../hooks/useUsers';
import { useJobRates } from '../../../hooks/useJobRates';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import { USER_ROLES } from '../../../constants';

const today = new Date().toISOString().slice(0, 10);

const defaultRow: WorkLogRowData = {
  job_rate_id: 0,
  work_date: today,
  start_time: '09:00',
  end_time: '17:00',
  quantity: 0 as number,
  notes: '',
};

const getJobRateLabel = (jr: JobRate) =>
  `[${jr.operation_code}] ${jr.operation_name || ''}${jr.product_part_no ? ` · ${jr.product_part_no}` : ''}`;

// ── Per-row sub-component ────────────────────────────────────────────────────

interface WorkLogRowFieldsProps {
  control: Control<WorkLogFormData>;
  index: number;
  rowErrors: FieldErrors<WorkLogRowData> | undefined;
  isLoading: boolean;
  isMobile: boolean;
  onRemove: () => void;
  canRemove: boolean;
  watchedRow: WorkLogRowData | undefined;
  initialJobRate?: JobRate | null;
}

const WorkLogRowFields: React.FC<WorkLogRowFieldsProps> = ({
  control,
  index,
  rowErrors,
  isLoading,
  isMobile,
  onRemove,
  canRemove,
  watchedRow,
  initialJobRate,
}) => {
  const [jobRateInput, setJobRateInput] = useState('');
  const [selectedJobRateObj, setSelectedJobRateObj] = useState<JobRate | null>(
    initialJobRate ?? null
  );
  const debouncedSearch = useDebouncedValue(jobRateInput, 300);
  const { data: jobRates = [], isFetching } = useJobRates({
    search: debouncedSearch || undefined,
  });
  const jobRateOptions = selectedJobRateObj
    ? [selectedJobRateObj, ...jobRates.filter((jr) => jr.id !== selectedJobRateObj.id)]
    : jobRates;

  const duration = (() => {
    if (!watchedRow?.start_time || !watchedRow?.end_time) return null;
    const [sh, sm] = watchedRow.start_time.split(':').map(Number);
    const [eh, em] = watchedRow.end_time.split(':').map(Number);
    const d = eh * 60 + em - (sh * 60 + sm);
    return d > 0 ? d : null;
  })();

  const total = (() => {
    if (!watchedRow || !selectedJobRateObj) return null;
    const t = (Number(watchedRow.quantity) || 0) * (Number(selectedJobRateObj.rate) || 0);
    return t > 0 ? t.toFixed(2) : null;
  })();

  const operationField = (
    <Controller
      name={`rows.${index}.job_rate_id`}
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
          isOptionEqualToValue={(opt, val) => (opt as JobRate).id === (val as JobRate)?.id}
          loading={isFetching}
          renderOption={(props, option) => {
            const { key, ...liProps } = props as { key: string } & React.HTMLAttributes<HTMLLIElement>;
            const jr = option as JobRate;
            return (
              <Box key={key} component="li" {...liProps} sx={{ py: 1.25, px: 1.5 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={jr.operation_code}
                      size="small"
                      color="primary"
                      sx={{ height: 22, fontSize: '0.72rem', fontWeight: 700, letterSpacing: 0.3 }}
                    />
                    {jr.product_part_no && (
                      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                        {jr.product_part_no}
                      </Typography>
                    )}
                  </Box>
                  {jr.operation_name && (
                    <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.3 }}>
                      {jr.operation_name}
                    </Typography>
                  )}
                </Box>
              </Box>
            );
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Operation Code"
              placeholder="Search by code or name…"
              error={!!rowErrors?.job_rate_id}
              helperText={rowErrors?.job_rate_id?.message}
              disabled={isLoading}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {isFetching && <CircularProgress size={14} />}
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
  );

  if (isMobile) {
    return (
      <Box
        sx={{
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden',
          mb: 2,
        }}
      >
        {/* Operation section — visually prominent */}
        <Box sx={{ px: 2, pt: 2, pb: 1.5, backgroundColor: 'primary.50', borderBottom: 1, borderColor: 'primary.100' }}>
          {canRemove && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="caption" color="primary" fontWeight={600}>Entry {index + 1}</Typography>
              <IconButton size="small" color="error" onClick={onRemove} disabled={isLoading}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
          {operationField}
        </Box>

        <Box sx={{ px: 2, py: 1.5 }}>
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
                  error={!!rowErrors?.work_date}
                  helperText={rowErrors?.work_date?.message}
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
                  error={!!rowErrors?.quantity}
                  helperText={rowErrors?.quantity?.message}
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
                  error={!!rowErrors?.start_time}
                  helperText={rowErrors?.start_time?.message}
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
                  error={!!(rowErrors as { end_time?: { message?: string } })?.end_time}
                  helperText={(rowErrors as { end_time?: { message?: string } })?.end_time?.message}
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
          {duration !== null && (
            <Grid size={12}>
              <Typography variant="caption" color="text.secondary">
                Duration: {duration} min
                {total ? ` · Total: ₹${total}` : ''}
              </Typography>
            </Grid>
          )}
          </Grid>
        </Box>
      </Box>
    );
  }

  // Desktop: horizontal row
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mb: 1.5 }}>
      <Box sx={{ flex: '0 0 30%', minWidth: 0 }}>{operationField}</Box>
      <Controller
        name={`rows.${index}.work_date`}
        control={control}
        render={({ field: f }) => (
          <TextField
            {...f}
            type="date"
            InputLabelProps={{ shrink: true }}
            error={!!rowErrors?.work_date}
            helperText={rowErrors?.work_date?.message}
            disabled={isLoading}
            size="small"
            sx={{ flex: 1, minWidth: 0 }}
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
            error={!!rowErrors?.quantity}
            helperText={rowErrors?.quantity?.message}
            disabled={isLoading}
            size="small"
            sx={{ flex: 1, minWidth: 0 }}
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
            error={!!rowErrors?.start_time}
            helperText={rowErrors?.start_time?.message}
            disabled={isLoading}
            size="small"
            sx={{ flex: 1, minWidth: 0 }}
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
            error={!!(rowErrors as { end_time?: { message?: string } })?.end_time}
            helperText={(rowErrors as { end_time?: { message?: string } })?.end_time?.message}
            disabled={isLoading}
            size="small"
            sx={{ flex: 1, minWidth: 0 }}
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
            sx={{ flex: '0 0 15%', minWidth: 0 }}
          />
        )}
      />
      <Box sx={{ flex: 1, minWidth: 0, pt: 1, textAlign: 'center' }}>
        {duration !== null ? (
          <>
            <Typography variant="caption" display="block" color="text.secondary">
              {duration}m
            </Typography>
            {total && (
              <Typography variant="caption" display="block" fontWeight={600}>
                ₹{total}
              </Typography>
            )}
          </>
        ) : (
          <Typography variant="caption" color="text.disabled">-</Typography>
        )}
      </Box>
      <IconButton
        color="error"
        onClick={onRemove}
        disabled={!canRemove || isLoading}
        sx={{ flexShrink: 0, width: 40, height: 40, mt: 0.25 }}
      >
        <DeleteIcon />
      </IconButton>
    </Box>
  );
};

// ── Main dialog ──────────────────────────────────────────────────────────────

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
      rows: [{ ...defaultRow }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'rows' });
  const watchedRows = watch('rows');

  // ── Reset on open ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (open) {
      if (workLog) {
        reset({
          user_id: workLog.user_id,
          rows: [{
            job_rate_id: workLog.job_rate_id,
            work_date: workLog.work_date?.slice(0, 10) || today,
            start_time: workLog.start_time || '09:00',
            end_time: workLog.end_time || '17:00',
            quantity: workLog.quantity ?? 0,
            notes: workLog.notes || '',
          }],
        });
      } else {
        reset({
          user_id: 0,
          rows: [{ ...defaultRow }],
        });
      }
    }
  }, [open, workLog, reset]);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleFormSubmit = (data: WorkLogFormData) => {
    if (isEditing) {
      const row = data.rows[0];
      onSubmit({
        user_id: data.user_id,
        job_rate_id: row.job_rate_id,
        work_date: row.work_date,
        start_time: row.start_time,
        end_time: row.end_time,
        quantity: row.quantity,
        notes: row.notes?.trim() || undefined,
      });
    } else {
      onBulkSubmit({
        user_id: data.user_id,
        items: data.rows.map((row) => ({
          job_rate_id: row.job_rate_id,
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
      job_rate_id: 0,
      work_date: last?.work_date || today,
      start_time: '09:00',
      end_time: '17:00',
      quantity: 0,
      notes: '',
    });
  };

  // Build initialJobRate for the edit-mode row from workLog data
  const editInitialJobRate: JobRate | null = isEditing && workLog
    ? {
        id: workLog.job_rate_id,
        operation_code: workLog.operation_code || '',
        operation_name: workLog.operation_name || '',
        rate: workLog.rate,
        product_part_no: workLog.product_part_no,
        product_id: workLog.product_id || 0,
        sequence: 0,
        created_at: '',
        updated_at: '',
      }
    : null;

  const rowErrors = errors?.rows;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={isEditing ? 'md' : 'xl'}
      fullWidth
      fullScreen={isMobile}
      PaperProps={{ sx: { borderRadius: { xs: 0, sm: 3 } } }}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogTitle sx={{ pb: 0.5 }}>
          {isEditing ? 'Edit Work Log' : 'Add Work Logs'}
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 400, mt: 0.25 }}>
            {isEditing
              ? 'Update the operation and details for this entry'
              : 'Select an operation code for each work entry'}
          </Typography>
        </DialogTitle>

        <DialogContent>
          {/* Worker — shared across all rows */}
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
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
          </Grid>

          {/* ── Rows ── */}
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 2 }} />

            {/* Column headers — desktop only */}
            {!isMobile && (
              <Box
                sx={{
                  display: { xs: 'none', sm: 'flex' },
                  gap: 1,
                  mb: 1,
                  px: 1,
                  py: 0.75,
                  alignItems: 'center',
                  backgroundColor: 'action.hover',
                  borderRadius: 1,
                }}
              >
                <Typography variant="caption" color="primary" fontWeight={700} sx={{ flex: '0 0 30%', minWidth: 0 }}>Operation Code *</Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ flex: 1, minWidth: 0 }}>Date</Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ flex: 1, minWidth: 0 }}>Quantity</Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ flex: 1, minWidth: 0 }}>Start</Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ flex: 1, minWidth: 0 }}>End</Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ flex: '0 0 15%', minWidth: 0 }}>Notes</Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ flex: 1, textAlign: 'center', minWidth: 0 }}>Total</Typography>
                <Box sx={{ width: 40, flexShrink: 0 }} />
              </Box>
            )}

            {fields.map((field, index) => (
              <WorkLogRowFields
                key={field.id}
                control={control}
                index={index}
                rowErrors={rowErrors?.[index] as FieldErrors<WorkLogRowData> | undefined}
                isLoading={isLoading}
                isMobile={isMobile}
                onRemove={() => remove(index)}
                canRemove={fields.length > 1}
                watchedRow={watchedRows?.[index]}
                initialJobRate={isEditing && index === 0 ? editInitialJobRate : undefined}
              />
            ))}

            {/* Add Row — create mode only */}
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
