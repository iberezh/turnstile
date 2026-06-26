// Credentialed $fetch bound to the admin-api base.
export function useAdminApi() {
  const { public: cfg } = useRuntimeConfig();
  return $fetch.create({ baseURL: cfg.adminApiBase, credentials: 'include' });
}
