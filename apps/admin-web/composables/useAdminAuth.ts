export interface AdminSession {
  id: string;
  email: string;
  role: string;
}

// Admin auth against the admin-api. Login is two-factor (password + TOTP) and uses a separate
// cookie from the tenant app, so the two sessions never mix.
export function useAdminAuth() {
  const admin = useState<AdminSession | null>('admin:session', () => null);
  const api = useAdminApi();

  async function refresh(): Promise<void> {
    try {
      admin.value = await api<AdminSession>('/auth/me');
    } catch {
      admin.value = null;
    }
  }

  async function login(email: string, password: string, totp: string): Promise<void> {
    admin.value = await api<AdminSession>('/auth/login', {
      method: 'POST',
      body: { email, password, totp },
    });
  }

  async function logout(): Promise<void> {
    await api('/auth/logout', { method: 'POST' });
    admin.value = null;
  }

  return { admin, refresh, login, logout };
}
