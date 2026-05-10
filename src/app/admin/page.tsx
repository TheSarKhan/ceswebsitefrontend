'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useAdminAuth, adminFetch } from '@/lib/admin-auth';

type Item = { slug?: string; id?: number };
type SubmissionPage = { content: { status: string }[] };

function useCount(path: string, key: string[]) {
  const { token, logout } = useAdminAuth();
  return useQuery({
    queryKey: key,
    queryFn: () => adminFetch<Item[]>(path, token, {}, logout),
    enabled: !!token,
    staleTime: 60_000,
  });
}

function useSubmissionCounts(resource: 'contact-submissions' | 'quote-submissions') {
  const { token, logout } = useAdminAuth();
  return useQuery({
    queryKey: ['admin', resource],
    queryFn: () =>
      adminFetch<SubmissionPage>(`/api/v1/admin/${resource}?size=100`, token, {}, logout),
    enabled: !!token,
    staleTime: 60_000,
  });
}

export default function AdminDashboard() {
  const { user } = useAdminAuth();

  const items     = useCount('/api/v1/admin/fleet/items',     ['admin', 'fleet', 'items']);
  const projects  = useCount('/api/v1/admin/projects',        ['admin', 'projects']);
  const offerings = useCount('/api/v1/admin/offerings',       ['admin', 'offerings']);
  const faqs      = useCount('/api/v1/admin/faqs',            ['admin', 'faqs']);
  const tests     = useCount('/api/v1/admin/testimonials',    ['admin', 'testimonials']);
  const clients   = useCount('/api/v1/admin/clients',         ['admin', 'clients']);

  const contact   = useSubmissionCounts('contact-submissions');
  const quote     = useSubmissionCounts('quote-submissions');

  const newContact = contact.data?.content.filter((s) => s.status === 'NEW').length ?? 0;
  const newQuote   = quote.data?.content.filter((s) => s.status === 'NEW').length ?? 0;
  const totalNew   = newContact + newQuote;

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <h1>Dashboard</h1>
          <p className="admin-page-sub">Xoş gəldin, {user?.name}.</p>
        </div>
      </header>

      {totalNew > 0 && (
        <Link
          href={newContact >= newQuote ? '/admin/contact-submissions' : '/admin/quote-submissions'}
          className="admin-pending"
        >
          <span className="admin-pending-num">{totalNew}</span>
          <div>
            <div className="admin-pending-label">Yeni sorğu gözləyir</div>
            <div className="admin-pending-sub">
              {newContact} əlaqə formu · {newQuote} qiymət təklifi
            </div>
          </div>
          <span className="admin-pending-cta">İdarə et →</span>
        </Link>
      )}

      <div className="admin-cards">
        <Stat href="/admin/fleet/items"          label="Texnika"            count={items.data?.length}            loading={items.isLoading} />
        <Stat href="/admin/projects"             label="Layihələr"          count={projects.data?.length}         loading={projects.isLoading} />
        <Stat href="/admin/offerings"            label="Xidmətlər"          count={offerings.data?.length}        loading={offerings.isLoading} />
        <Stat href="/admin/testimonials"         label="Rəylər"             count={tests.data?.length}            loading={tests.isLoading} />
        <Stat href="/admin/faqs"                 label="Sual-cavab"         count={faqs.data?.length}             loading={faqs.isLoading} />
        <Stat href="/admin/clients"              label="Müştərilər"         count={clients.data?.length}          loading={clients.isLoading} />
        <Stat href="/admin/contact-submissions"  label="Əlaqə formları"     count={contact.data?.content.length}  newCount={newContact} loading={contact.isLoading} />
        <Stat href="/admin/quote-submissions"    label="Qiymət təklifləri"  count={quote.data?.content.length}    newCount={newQuote}   loading={quote.isLoading} />
      </div>
    </div>
  );
}

function Stat({
  href,
  label,
  count,
  newCount,
  loading,
}: {
  href: string;
  label: string;
  count?: number;
  newCount?: number;
  loading?: boolean;
}) {
  return (
    <Link className="admin-card" href={href}>
      <div className="admin-card-count">
        {loading ? <span className="admin-card-skeleton">…</span> : (count ?? 0)}
        {!loading && newCount && newCount > 0 ? (
          <span className="admin-card-new">+{newCount} yeni</span>
        ) : null}
      </div>
      <div className="admin-card-label">{label}</div>
      <div className="admin-card-cta">İdarə et →</div>
    </Link>
  );
}
