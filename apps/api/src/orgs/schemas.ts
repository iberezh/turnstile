import { ORG_ROLES } from '@turnstile/core';
import { z } from 'zod';

export const CreateOrgSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/, 'lowercase letters, numbers and hyphens only'),
});

export const AddMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(ORG_ROLES),
});

export const UpdateRoleSchema = z.object({ role: z.enum(ORG_ROLES) });
