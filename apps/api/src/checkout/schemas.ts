import { z } from 'zod';

export const CheckoutSchema = z.object({
  holdId: z.string().uuid(),
  buyerEmail: z.string().email(),
  promoCode: z.string().min(2).max(40).optional(),
  redeemPoints: z.number().int().positive().optional(),
});

export type CheckoutInput = z.infer<typeof CheckoutSchema>;
