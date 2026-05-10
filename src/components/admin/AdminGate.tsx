'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useAdminAuth } from '@/lib/admin-auth';
import { AdminShell } from './AdminShell';

const PUBLIC_ADMIN_PATHS = new Set(['/admin/login']);

export function AdminGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { token, ready } = useAdminAuth();

  const isPublic = PUBLIC_ADMIN_PATHS.has(pathname);

  // Redirect: not logged in + private page  → /admin/login
  // Redirect: logged in + on /admin/login    → /admin
  useEffect(() => {
    if (!ready) return;
    if (!token && !isPublic) {
      router.replace('/admin/login');
    } else if (token && pathname === '/admin/login') {
      router.replace('/admin');
    }
  }, [ready, token, isPublic, pathname, router]);

  if (!ready) {
    return <div className="admin-loading">Loading…</div>;
  }
  if (!token) {
    // Login page renders bare; everything else waits for redirect.
    return isPublic ? <>{children}</> : null;
  }
  if (isPublic) {
    return null; // about to redirect to /admin
  }
  return <AdminShell>{children}</AdminShell>;
}
