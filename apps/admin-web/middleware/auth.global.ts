// Guard every console page except the login screen.
export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/login') return;
  const { admin, refresh } = useAdminAuth();
  if (!admin.value) await refresh();
  if (!admin.value) return navigateTo('/login');
});
