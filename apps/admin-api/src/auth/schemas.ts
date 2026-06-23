import { z } from 'zod';

// Login is two-factor: password AND a 6-digit TOTP code. Both are required.
export const AdminLoginSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(1).max(200),
  totp: z.string().regex(/^\d{6}$/),
});

export type AdminLoginInput = z.infer<typeof AdminLoginSchema>;
