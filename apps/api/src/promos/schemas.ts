import { z } from 'zod';

export const CreatePromoSchema = z
  .object({
    code: z
      .string()
      .min(2)
      .max(40)
      .regex(/^[A-Za-z0-9_-]+$/),
    discountType: z.enum(['percent', 'fixed']),
    discountValue: z.number().int().positive(),
    maxRedemptions: z.number().int().positive().optional(),
    startsAt: z.string().datetime().optional(),
    endsAt: z.string().datetime().optional(),
  })
  .refine((v) => v.discountType !== 'percent' || v.discountValue <= 100, {
    message: 'percent discount must be 1..100',
    path: ['discountValue'],
  });

export type CreatePromoInput = z.infer<typeof CreatePromoSchema>;
