// Shared API path prefix. Each router carries its full prefix and mounts directly on the app
// (nested @koa/router prefix propagation proved unreliable), so this is the single source.
export const API_PREFIX = '/api/v1';
