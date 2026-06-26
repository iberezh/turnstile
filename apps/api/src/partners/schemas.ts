import { z } from 'zod';

export const CreatePartnerSchema = z.object({
  code: z
    .string()
    .min(2)
    .max(40)
    .regex(/^[A-Za-z0-9_-]+$/),
  name: z.string().min(1).max(120),
  // Basis points, 0..10000 (0%..100%) of attributed net revenue.
  commissionBps: z.number().int().min(0).max(10000),
});

export type CreatePartnerInput = z.infer<typeof CreatePartnerSchema>;
