import { z } from 'zod';

export const productFormSchema = z.object({
  part_no: z.string().min(1, 'Part number is required'),
  name: z.string().min(1, 'Product name is required'),
  category: z.string().optional(),
  group: z.string().optional(),
  model_name: z.string().optional(),
  mrp: z.string().optional(),
  distributor_price: z.string().optional(),
  dealer_price: z.string().optional(),
  retail_price: z.string().optional(),
  qty: z.string().optional(),
  unit_of_measure: z.string().optional(),
  gst: z.string().optional(),
  hsn: z.string().optional(),
  is_active: z.boolean().optional(),
});

export type ProductFormData = z.infer<typeof productFormSchema>;
