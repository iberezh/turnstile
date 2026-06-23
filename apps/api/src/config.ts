import { z } from 'zod';

// Single source of truth for env. The app refuses to start on invalid config — no silent
// fallbacks beyond the documented dev defaults.
const EnvSchema = z.object({
  DATABASE_URL: z.string().default('postgresql://turnstile:turnstile@localhost:5432/turnstile'),
  JWT_SECRET: z.string().min(1).default('dev-only-insecure-change-me'),
  PORT: z.coerce.number().int().positive().default(4000),
  WEB_ORIGIN: z.string().default('http://localhost:3000'),
});

export type Config = z.infer<typeof EnvSchema>;

export const config: Config = EnvSchema.parse(process.env);
