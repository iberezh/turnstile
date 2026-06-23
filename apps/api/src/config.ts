import { z } from 'zod';

// Single source of truth for env. The app refuses to start on invalid config — no silent
// fallbacks beyond the documented dev defaults.
const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().default('postgresql://turnstile:turnstile@localhost:5436/turnstile'),
  JWT_SECRET: z.string().min(1).default('dev-only-insecure-change-me'),
  PORT: z.coerce.number().int().positive().default(4002),
  WEB_ORIGIN: z.string().default('http://localhost:3003'),
  // Optional: without it the mock payments adapter runs (keyless dev/CI).
  STRIPE_SECRET_KEY: z.string().default(''),
});

export type Config = z.infer<typeof EnvSchema>;

export const config: Config = EnvSchema.parse(process.env);
