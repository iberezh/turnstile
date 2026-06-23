// Kysely database types. Tables are added per phase (auth/orgs first); this interface stays the
// single typed contract for every query so raw SQL can't drift from the schema.
export type Database = Record<string, never>;
