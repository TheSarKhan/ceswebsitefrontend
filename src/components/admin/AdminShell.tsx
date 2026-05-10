'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAdminAuth, adminFetch } from '@/lib/admin-auth';
import { Breadcrumbs } from './Breadcrumbs';

type NavLink = { href: string; label: string; badgeKey?: 'contact' | 'quote' };
type NavGroup = { label: string; links: NavLink[] };

const NAV: NavGroup[] = [
  {
    label: 'Texnika',
    links: [
      { href: '/admin/fleet/categories',    label: 'Kateqoriyalar' },
      { href: '/admin/fleet/subcategories', label: 'Alt-kateqoriyalar' },
      { href: '/admin/fleet/items',         label: 'Texnika' },
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
      { href: '/admin/contact-submissions', label: 'Əlaqə formları',   badgeKey: 'contact' },
      { href: '/admin/quote-submissions',   label: 'Qiymət təklifləri', badgeKey: 'quote' },
    ],
  },
];

type SubmissionPage = {
  content: { status: string }[];
  totalElements: number;
};

function useNewSubmissionCounts() {
  const { token, logout } = useAdminAuth();
  const ONE_MIN = 60 * 1000;

  const contact = useQuery({
    queryKey: ['admin', 'contact-submissions'],
    queryFn: () =>
      adminFetch<SubmissionPage>(
        '/api/v1/admin/contact-submissions?size=100',
        token,
        {},
        logout,
      ),
    enabled: !!token,
    staleTime: ONE_MIN,
  });
  const quote = useQuery({
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

  const countNew = (page?: SubmissionPage) =>
    page?.content.filter((s) => s.status === 'NEW').length ?? 0;

  return {
    contact: countNew(contact.data),
    quote: countNew(quote.data),
  };
}

export function AdminShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAdminAuth();
  const pathname = usePathname();
  const newCounts = useNewSubmissionCounts();

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <Link href="/admin" className="admin-brand">
          <span className="mono">CES</span>
          <span className="brand-sub">ADMIN</span>
        </Link>

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
                const badge =
                  link.badgeKey === 'contact'
                    ? newCounts.contact
                    : link.badgeKey === 'quote'
                      ? newCounts.quote
                      : 0;
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
