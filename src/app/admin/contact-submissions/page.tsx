'use client';

import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminAuth, adminFetch } from '@/lib/admin-auth';
import { SubmissionStatusSelect, type SubmissionStatus } from '@/components/admin/SubmissionStatusSelect';

type ContactSubmission = {
  id: number;
  name: string;
  email: string | null;
  phone: string;
  company: string | null;
  message: string;
  status: SubmissionStatus;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
};

type Page<T> = {
  content: T[];
  totalElements: number;
  number: number;
  size: number;
};

export default function ContactSubmissionsList() {
  const { token, logout } = useAdminAuth();
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'contact-submissions'],
    queryFn: () =>
      adminFetch<Page<ContactSubmission>>(
        '/api/v1/admin/contact-submissions?size=100',
        token,
        {},
        logout,
      ),
    enabled: !!token,
  });

  const remove = useMutation({
    mutationFn: (id: number) =>
      adminFetch<void>(`/api/v1/admin/contact-submissions/${id}`, token, { method: 'DELETE' }, logout),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'contact-submissions'] }),
  });

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <h1>Əlaqə formları</h1>
          <p className="admin-page-sub">Sayt-dan gələn əlaqə sorğuları.</p>
        </div>
      </header>

      {isLoading && <div className="admin-loading">Yüklənir…</div>}
      {isError && <div className="admin-form-error">Məlumat yüklənmədi.</div>}

      {data && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Tarix</th>
              <th>Ad</th>
              <th>Telefon</th>
              <th>Mesaj</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.content.map((s) => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td><span className="mono" style={{ fontSize: 11 }}>{formatDate(s.createdAt)}</span></td>
                <td>
                  <div>{s.name}</div>
                  {s.company && <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>{s.company}</div>}
                </td>
                <td>
                  <a href={`tel:${s.phone}`}>{s.phone}</a>
                  {s.email && <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>{s.email}</div>}
                </td>
                <td style={{ maxWidth: 360 }}>
                  {s.message.length > 80 ? s.message.slice(0, 80) + '…' : s.message}
                </td>
                <td>
                  <SubmissionStatusSelect resource="contact-submissions" id={s.id} current={s.status} />
                </td>
                <td className="admin-table-actions">
                  <Link href={`/admin/contact-submissions/${s.id}`} className="admin-btn admin-btn-ghost">
                    Bax
                  </Link>
                  <button
                    className="admin-btn admin-btn-danger"
                    onClick={() => { if (confirm(`#${s.id} silinsin?`)) remove.mutate(s.id); }}
                    disabled={remove.isPending}
                  >Sil</button>
                </td>
              </tr>
            ))}
            {data.content.length === 0 && (
              <tr><td colSpan={7} className="admin-table-empty">Inbox boşdur.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('az-AZ', {
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso;
  }
}
