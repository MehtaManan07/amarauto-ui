import { z } from 'zod';

const ROLES = ['Admin', 'Supervisor', 'Staff', 'Worker'] as const;
const STATUSES = ['Active', 'Inactive'] as const;

export const createUserFormSchema = z.object({
  username: z.string().min(1, 'Username is required').max(255),
  password: z.string().min(1, 'Password is required'),
  name: z.string().min(1, 'Name is required').max(255),
  role: z.enum(ROLES),
  phone: z.string().max(20).optional(),
  job: z.string().max(255).optional(),
});

export const updateUserFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  role: z.enum(ROLES),
  phone: z.string().max(20).optional(),
  job: z.string().max(255).optional(),
  status: z.enum(STATUSES),
  password: z.union([z.string().min(1), z.literal('')]).optional(),
});

export type CreateUserFormData = z.infer<typeof createUserFormSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserFormSchema>;
