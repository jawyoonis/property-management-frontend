import { UserRole } from '@/context/AuthContext';

export const ROLE_ROUTES: Record<UserRole, string[]> = {
  property_manager: [
    '/',
    '/owners',
    '/properties',
    '/tenants',
    '/leases',
    '/payments',
    '/maintenance',
    '/financial',
  ],
  tenant: ['/', '/leases', '/payments', '/maintenance'],
};

export function canAccess(role: UserRole, path: string): boolean {
  return ROLE_ROUTES[role].includes(path);
}
