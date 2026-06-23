import { z } from 'zod';

// The control plane runs as its own service with its own config. Crucially it has TWO database
// URLs: its OWN database (admin identities + audit, never colocated with tenant data) and the
// main app database it acts upon. A dump taken with the app's credentials reaches neither the
// admin DB nor this service's secrets.
const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  // Separate physical Postgres instance — the whole point of the split.
  ADMIN_DATABASE_URL: z
    .string()
    .default('postgresql://turnstile_admin:turnstile_admin@localhost:5437/turnstile_admin'),
  // The main app DB, written to for cross-plane actions (suspend org, moderate event).
  APP_DATABASE_URL: z.string().default('postgresql://turnstile:turnstile@localhost:5436/turnstile'),
  // Distinct from the app's JWT_SECRET, so a stolen tenant session can't authenticate here.
  ADMIN_JWT_SECRET: z.string().min(1).default('admin-dev-only-insecure-change-me'),
  ADMIN_PORT: z.coerce.number().int().positive().default(4003),
  ADMIN_WEB_ORIGIN: z.string().default('http://localhost:3004'),
  // Bootstrap superadmin, seeded only when admin_users is empty. TOTP secret generated if unset.
  BOOTSTRAP_ADMIN_EMAIL: z.string().email().default('root@turnstile.local'),
  BOOTSTRAP_ADMIN_PASSWORD: z.string().min(8).default('change-me-now-please'),
  BOOTSTRAP_ADMIN_TOTP_SECRET: z.string().default(''),
});

export type Config = z.infer<typeof EnvSchema>;

export const config: Config = EnvSchema.parse(process.env);
