// A $fetch instance bound to the API base with credentials, for authenticated dashboard calls.
export function useApi() {
  const { public: cfg } = useRuntimeConfig();
  return $fetch.create({ baseURL: cfg.apiBase, credentials: 'include' });
}
