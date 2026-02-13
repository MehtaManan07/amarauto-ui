import { z } from 'zod';

export const rawMaterialFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  unit_type: z.string().min(1, 'Unit type is required'),
  material_type: z.string().optional(),
  group: z.string().optional(),
  min_stock_req: z.string().optional(),
  min_order_qty: z.string().optional(),
  stock_qty: z.string().optional(),
  purchase_price: z.string().optional(),
  gst: z.string().optional(),
  hsn: z.string().optional(),
  description: z.string().optional(),
  treat_as_consume: z.boolean().optional(),
  is_active: z.boolean().optional(),
});

export type RawMaterialFormData = z.infer<typeof rawMaterialFormSchema>;
