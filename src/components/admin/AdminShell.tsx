'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAdminAuth, adminFetch } from '@/lib/admin-auth';
import { useTheme } from '@/contexts/ThemeContext';
import { Logo } from '@/components/Header';
import { Breadcrumbs } from './Breadcrumbs';

type NavLink = { href: string; label: string; badgeKey?: 'messages' };
type NavGroup = { label: string; links: NavLink[] };

const NAV: NavGroup[] = [
  {
    label: 'Texnika',
    links: [
      { href: '/admin/fleet', label: 'Kataloq' },
    ],
  },
  {
    label: 'Məzmun',
    links: [
      { href: '/admin/projects',     label: 'Layihələr' },
      { href: '/admin/testimonials', label: 'Rəylər' },
      { href: '/admin/offerings',    label: 'Xidmətlər' },
      { href: '/admin/faqs',         label: 'Sual-cavab' },
      { href: '/admin/clients',      label: 'Müştərilər' },
    ],
  },
  {
    label: 'Sorğular',
    links: [
      { href: '/admin/quote-submissions', label: 'Göndərilən mesajlar', badgeKey: 'messages' },
    ],
  },
  {
    label: 'Sistem',
    links: [
      { href: '/admin/trash', label: 'Silinmiş məlumatlar' },
    ],
  },
];

type SubmissionPage = {
  content: { status: string }[];
  totalElements: number;
};

function useNewMessageCount() {
  const { token, logout } = useAdminAuth();
  const ONE_MIN = 60 * 1000;

  const messages = useQuery({
    queryKey: ['admin', 'quote-submissions'],
    queryFn: () =>
      adminFetch<SubmissionPage>(
        '/api/v1/admin/quote-submissions?size=100',
        token,
        {},
        logout,
      ),
    enabled: !!token,
    staleTime: ONE_MIN,
  });

  return messages.data?.content.filter((s) => s.status === 'NEW').length ?? 0;
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="admin-theme-toggle"
      aria-label={theme === 'dark' ? 'İşıqlı moda keç' : 'Qaranlıq moda keç'}
      title={theme === 'dark' ? 'İşıqlı mod' : 'Qaranlıq mod'}
    >
      {theme === 'dark' ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAdminAuth();
  const pathname = usePathname();
  const qc = useQueryClient();
  const newMessages = useNewMessageCount();

  // Whenever the admin navigates to a different page, mark every cached
  // ['admin', ...] query as stale. The newly mounted page renders with
  // cached data immediately (no loading flash) and React Query refetches
  // in the background — so the user always sees up-to-date data without
  // having to hard-refresh.
  useEffect(() => {
    qc.invalidateQueries({ queryKey: ['admin'] });
  }, [pathname, qc]);

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand-row">
          <Link href="/admin" className="admin-brand" aria-label="Dashboard">
            <Logo size={88} />
          </Link>
          <ThemeToggle />
        </div>

        <nav className="admin-nav">
          <Link
            href="/admin"
            className={'admin-nav-link ' + (pathname === '/admin' ? 'active' : '')}
          >
            Dashboard
          </Link>

          {NAV.map((group) => (
            <div key={group.label} className="admin-nav-group">
              <div className="admin-nav-group-label">{group.label}</div>
              {group.links.map((link) => {
                const active =
                  pathname === link.href || pathname.startsWith(link.href + '/');
                const badge = link.badgeKey === 'messages' ? newMessages : 0;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={'admin-nav-link ' + (active ? 'active' : '')}
                  >
                    <span>{link.label}</span>
                    {badge > 0 && <span className="admin-nav-badge">{badge}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="admin-user">
          <div className="admin-user-name">{user?.name}</div>
          <div className="admin-user-email">{user?.email}</div>
          <button className="admin-btn admin-btn-ghost" onClick={logout}>
            Çıxış
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <Breadcrumbs />
        {children}
      </main>
    </div>
  );
}
