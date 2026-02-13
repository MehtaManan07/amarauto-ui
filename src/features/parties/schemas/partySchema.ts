import { z } from 'zod';

export const partyFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().optional(),
  state: z.string().optional(),
  party_type: z.string().optional(),
  address_line_1: z.string().optional(),
  address_line_2: z.string().optional(),
  address_line_3: z.string().optional(),
  address_line_4: z.string().optional(),
  address_line_5: z.string().optional(),
  pin_code: z.string().optional(),
  phone: z.string().optional(),
  fax: z.string().optional(),
  contact_person: z.string().optional(),
  mobile: z.string().optional(),
  gstin: z.string().optional(),
});

export type PartyFormData = z.infer<typeof partyFormSchema>;
