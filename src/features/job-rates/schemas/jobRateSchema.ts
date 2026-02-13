import { z } from 'zod';

export const jobRateFormSchema = z.object({
  product_id: z.number().min(1, 'Product is required'),
  operation_code: z.string().min(1, 'Operation code is required').max(50),
  operation_name: z.string().min(1, 'Operation name is required').max(255),
  rate: z.preprocess(
    (v) => (v === '' || v === undefined ? 0 : Number(v)),
    z.number().min(0, 'Rate must be >= 0')
  ),
  sequence: z.preprocess(
    (v) => (v === '' || v === undefined ? 0 : Number(v)),
    z.number().int().min(0, 'Sequence must be >= 0')
  ),
});

export type JobRateFormData = z.infer<typeof jobRateFormSchema>;
