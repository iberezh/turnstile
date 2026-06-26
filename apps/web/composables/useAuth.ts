import type { AuthUser } from '~/types/auth';

// Client-side auth against the API. The session cookie is httpOnly on the API origin; same-site
// credentialed fetch carries it, so all calls pass credentials: 'include'. State is shared via
// useState so every component sees the same user.
export function useAuth() {
  const user = useState<AuthUser | null>('auth:user', () => null);
  const { public: cfg } = useRuntimeConfig();
  const base = cfg.apiBase;

  async function refresh(): Promise<void> {
    try {
      user.value = await $fetch<AuthUser>(`${base}/auth/me`, { credentials: 'include' });
    } catch {
      user.value = null;
    }
  }

  async function login(email: string, password: string): Promise<void> {
    user.value = await $fetch<AuthUser>(`${base}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      body: { email, password },
    });
  }

  async function register(email: string, password: string, name: string): Promise<void> {
    user.value = await $fetch<AuthUser>(`${base}/auth/register`, {
      method: 'POST',
      credentials: 'include',
      body: name ? { email, password, name } : { email, password },
    });
  }

  async function logout(): Promise<void> {
    await $fetch(`${base}/auth/logout`, { method: 'POST', credentials: 'include' });
    user.value = null;
  }

  return { user, refresh, login, register, logout };
}
