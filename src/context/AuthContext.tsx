import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'property_manager' | 'tenant';

export interface AuthUser {
  username: string;
  role: UserRole;
  displayName: string;
  initials: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const DEMO_USERS: (AuthUser & { password: string })[] = [
  {
    username: 'manager',
    password: 'manager123',
    role: 'property_manager',
    displayName: 'Admin',
    initials: 'PM',
  },
  {
    username: 'tenant',
    password: 'tenant123',
    role: 'tenant',
    displayName: 'John Doe',
    initials: 'JD',
  },
];

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('pm_user');
      if (stored) setUser(JSON.parse(stored));
    } catch {
      localStorage.removeItem('pm_user');
    } finally {
      setLoading(false);
    }
  }, []);

  function login(username: string, password: string): boolean {
    const found = DEMO_USERS.find(
      (u) => u.username === username && u.password === password
    );
    if (!found) return false;
    const { password: _, ...authUser } = found;
    setUser(authUser);
    localStorage.setItem('pm_user', JSON.stringify(authUser));
    return true;
  }

  function logout() {
    setUser(null);
    localStorage.removeItem('pm_user');
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
