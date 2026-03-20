import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Building2, Users, FileText, User, CreditCard,
  Wrench, BarChart3, LayoutDashboard, Menu, X, ChevronRight, LogOut,
} from 'lucide-react';
import { useAuth, UserRole } from '@/context/AuthContext';

const ALL_NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['property_manager', 'tenant'] },
  { href: '/owners', label: 'Owners', icon: Users, roles: ['property_manager'] },
  { href: '/properties', label: 'Properties', icon: Building2, roles: ['property_manager'] },
  { href: '/tenants', label: 'Tenants', icon: User, roles: ['property_manager'] },
  { href: '/leases', label: 'Leases', icon: FileText, roles: ['property_manager', 'tenant'] },
  { href: '/payments', label: 'Payments', icon: CreditCard, roles: ['property_manager', 'tenant'] },
  { href: '/maintenance', label: 'Maintenance', icon: Wrench, roles: ['property_manager', 'tenant'] },
  { href: '/financial', label: 'Financial', icon: BarChart3, roles: ['property_manager'] },
] as const;

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();

  const navItems = ALL_NAV_ITEMS.filter(
    (item) => user && (item.roles as readonly string[]).includes(user.role)
  );

  function handleLogout() {
    logout();
    router.replace('/login');
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed z-30 inset-y-0 left-0 w-64 bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col transform transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700 shrink-0">
          <div>
            <h1 className="text-xl font-bold text-white">PropManage</h1>
            <p className="text-xs text-slate-400 mt-0.5">Somaliland</p>
          </div>
          <button
            className="lg:hidden text-slate-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = router.pathname === href;
            return (
              <Link key={href} href={href}>
                <div
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    active
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="font-medium text-sm">{label}</span>
                  {active && <ChevronRight className="w-4 h-4 ml-auto" />}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 shrink-0">
          <div className="flex items-center space-x-3 px-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {user?.initials ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.displayName}</p>
              <p className="text-xs text-slate-400 truncate">
                {user?.role === 'property_manager' ? 'Property Manager' : 'Tenant'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-slate-400 hover:bg-slate-700 hover:text-white transition-all duration-200 text-sm"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center">
          <button
            className="text-gray-600 hover:text-gray-900"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="ml-4 text-lg font-semibold text-gray-900">PropManage</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
