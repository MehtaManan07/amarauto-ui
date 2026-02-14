import { z } from 'zod';

const timeRegex = /^\d{1,2}:\d{2}$/;

export const workLogFormSchema = z
  .object({
    user_id: z.number().min(1, 'Worker is required'),
    job_rate_id: z.number().min(1, 'Job rate (operation) is required'),
    work_date: z.string().min(1, 'Work date is required'),
    start_time: z.string().min(1, 'Start time is required').regex(timeRegex, 'Use HH:MM format'),
    end_time: z.string().min(1, 'End time is required').regex(timeRegex, 'Use HH:MM format'),
    quantity: z.preprocess(
      (v) => (v === '' || v === undefined ? 0 : Number(v)),
      z.number().min(0.01, 'Quantity must be greater than 0')
    ),
    notes: z.string().max(2000).optional(),
  })
  .refine(
    (data) => {
      if (!data.start_time || !data.end_time) return true;
      const [sh, sm] = data.start_time.split(':').map(Number);
      const [eh, em] = data.end_time.split(':').map(Number);
      const startM = sh * 60 + sm;
      const endM = eh * 60 + em;
      return endM > startM;
    },
    { message: 'End time must be after start time', path: ['end_time'] }
  );

export type WorkLogFormData = z.infer<typeof workLogFormSchema>;
