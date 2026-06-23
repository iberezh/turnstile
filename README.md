# Turnstile

> A **two-sided event-ticketing marketplace**. Organizations create events and sell tickets;
> attendees buy and get a QR pass; the platform onboards organizers via **Stripe Connect** and
> keeps a take-rate. Anti-oversell inventory, signed QR check-in, and permission-based access.
>
> Nuxt + Koa · Kysely + Postgres · Stripe Connect.

> 🚧 Work in progress — building in phases (foundation → events → sell → door → money → growth).

## Stack

| Layer | Choice |
| --- | --- |
| Web | **Nuxt 3** (SSR/SSG/ISR — event pages are the SEO engine) |
| API | **Koa 2** (middleware onion: auth, RBAC, checkout, webhooks) |
| DB | **Kysely + PostgreSQL 16** (typed SQL, append-only audit log) |
| Payments | **Stripe Connect** (Express; destination charges + application fee) |
| Validation | **Zod** | 
| Tooling | pnpm workspaces · Biome · Vitest · Husky · GitHub Actions |

## Develop

```bash
pnpm install
cp .env.example .env
docker compose up -d postgres
pnpm --filter @turnstile/api dev    # http://localhost:4000
pnpm --filter @turnstile/web dev    # http://localhost:3000
```

## Project layout

```
packages/core/   permission catalog + role bundles + shared types
apps/api/        Koa: auth, RBAC, orgs, events, ticketing, payments, check-in
apps/web/        Nuxt: marketplace, attendee flows, org dashboard, scanner
```

## License

MIT
