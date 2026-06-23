import { z } from 'zod';

export const ReserveSchema = z.object({
  items: z
    .array(
      z.object({
        ticketTypeId: z.string().uuid(),
        quantity: z.number().int().min(1).max(10),
      }),
    )
    .min(1)
    .max(10),
});

export type ReserveInput = z.infer<typeof ReserveSchema>;
