import { z } from 'zod';

export const CheckoutSchema = z.object({
  holdId: z.string().uuid(),
  buyerEmail: z.string().email(),
});

export type CheckoutInput = z.infer<typeof CheckoutSchema>;
