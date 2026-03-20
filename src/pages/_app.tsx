import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Toaster } from 'react-hot-toast';
import Layout from '@/components/Layout';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { canAccess } from '@/lib/permissions';

function AppContent({ Component, pageProps }: AppProps) {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();
  const isLoginPage = router.pathname === '/login';

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated && !isLoginPage) {
      router.replace('/login');
    } else if (isAuthenticated && isLoginPage) {
      router.replace('/');
    } else if (isAuthenticated && user && !isLoginPage) {
      if (!canAccess(user.role, router.pathname)) {
        router.replace('/');
      }
    }
  }, [isAuthenticated, loading, isLoginPage, router, user]);

  // While checking localStorage, render nothing to avoid flash
  if (loading) return null;

  if (isLoginPage) {
    return (
      <>
        <Component {...pageProps} />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { borderRadius: '12px', background: '#1e293b', color: '#fff' },
          }}
        />
      </>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <Layout>
      <Component {...pageProps} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { borderRadius: '12px', background: '#1e293b', color: '#fff' },
        }}
      />
    </Layout>
  );
}

export default function App(props: AppProps) {
  return (
    <AuthProvider>
      <AppContent {...props} />
    </AuthProvider>
  );
}
