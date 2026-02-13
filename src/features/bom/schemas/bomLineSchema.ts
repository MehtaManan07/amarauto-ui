import { z } from 'zod';

export const bomLineFormSchema = z.object({
  product_id: z.number().min(1, 'Product is required'),
  raw_material_id: z.number().min(1, 'Raw material is required'),
  variant: z.string().max(100).optional(),
  stage_number: z.preprocess(
    (v) => (v === '' || v === undefined ? 1 : Number(v)),
    z.number().min(1, 'Stage must be >= 1')
  ),
  batch_qty: z.preprocess(
    (v) => (v === '' || v === undefined ? 1 : Number(v)),
    z.number().min(0, 'Batch qty must be >= 0')
  ),
  raw_qty: z.preprocess(
    (v) => (v === '' || v === undefined ? 0 : Number(v)),
    z.number().min(0, 'Raw qty must be >= 0')
  ),
});

export type BOMLineFormData = z.infer<typeof bomLineFormSchema>;
