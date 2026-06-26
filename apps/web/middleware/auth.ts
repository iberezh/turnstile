// Route guard for the dashboard. Auth is client-side (the session cookie isn't available to SSR),
// so this resolves on the client: ensure a user is loaded, else send them to sign in.
export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) return;
  const { user, refresh } = useAuth();
  if (!user.value) await refresh();
  if (!user.value) return navigateTo('/login');
});
