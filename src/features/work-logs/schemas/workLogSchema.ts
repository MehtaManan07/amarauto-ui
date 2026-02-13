import { z } from 'zod';

export const workLogFormSchema = z.object({
  user_id: z.number().min(1, 'Worker is required'),
  job_rate_id: z.number().min(1, 'Job rate (operation) is required'),
  work_date: z.string().min(1, 'Work date is required'),
  quantity: z.preprocess(
    (v) => (v === '' || v === undefined ? 0 : Number(v)),
    z.number().min(0.01, 'Quantity must be greater than 0')
  ),
  duration_minutes: z.preprocess(
    (v) => (v === '' || v === undefined ? undefined : Number(v)),
    z.number().int().min(0).optional()
  ),
  notes: z.string().max(2000).optional(),
});

export type WorkLogFormData = z.infer<typeof workLogFormSchema>;
