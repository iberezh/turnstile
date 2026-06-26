import { z } from 'zod';

// Manual points adjustment by an org admin (a goodwill grant, or a correction). Non-zero delta.
export const AdjustPointsSchema = z.object({
  email: z.string().email().max(200),
  delta: z
    .number()
    .int()
    .refine((v) => v !== 0, 'delta must be non-zero'),
  reason: z.string().min(1).max(200),
});

export type AdjustPointsInput = z.infer<typeof AdjustPointsSchema>;
