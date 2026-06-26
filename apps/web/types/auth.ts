export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

export interface DashboardOrg {
  id: string;
  slug: string;
  name: string;
  role?: string;
}
