'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const SEGMENT_LABELS: Record<string, string> = {
  admin: 'Admin',
  fleet: 'Texnika',
  categories: 'Kateqoriyalar',
  subcategories: 'Alt-kateqoriyalar',
  items: 'Texnika kataloqu',
  projects: 'Layihələr',
  testimonials: 'Rəylər',
  offerings: 'Xidmətlər',
  faqs: 'Sual-cavab',
  clients: 'Müştərilər',
  'contact-submissions': 'Əlaqə formları',
  'quote-submissions': 'Qiymət təklifləri',
  uploads: 'Yükləmələr',
  new: 'Yeni',
  login: 'Giriş',
};

/**
 * Auto-generates breadcrumbs from {@code usePathname()}. The last segment is
 * rendered as plain text (current page); everything before becomes a link to
 * its prefix path. Unknown segments (slugs / ids) are shown verbatim — the
 * page itself can override the title in its header if needed.
 */
export function Breadcrumbs() {
  const pathname = usePathname();
  if (!pathname || pathname === '/admin' || pathname === '/admin/login') return null;

  const parts = pathname.split('/').filter(Boolean);
  const trail = parts.map((segment, idx) => {
    const href = '/' + parts.slice(0, idx + 1).join('/');
    const label = SEGMENT_LABELS[segment] ?? segment;
    return { href, label, last: idx === parts.length - 1 };
  });

  return (
    <nav className="admin-breadcrumbs" aria-label="Breadcrumb">
      {trail.map((item, idx) => (
        <span key={item.href} className="admin-crumb">
          {item.last ? (
            <span className="admin-crumb-current">{item.label}</span>
          ) : (
            <Link href={item.href}>{item.label}</Link>
          )}
          {idx < trail.length - 1 && <span className="admin-crumb-sep">›</span>}
        </span>
      ))}
    </nav>
  );
}
