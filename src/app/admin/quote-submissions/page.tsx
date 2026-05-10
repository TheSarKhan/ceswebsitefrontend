'use client';

import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminAuth, adminFetch } from '@/lib/admin-auth';
import { SubmissionStatusSelect, type SubmissionStatus } from '@/components/admin/SubmissionStatusSelect';

type QuoteSubmission = {
  id: number;
  name: string;
  email: string | null;
  phone: string;
  company: string | null;
  equipmentType: string | null;
  duration: string | null;
  location: string | null;
  message: string | null;
  status: SubmissionStatus;
  createdAt: string;
};

type Page<T> = { content: T[]; totalElements: number; number: number; size: number };

export default function QuoteSubmissionsList() {
  const { token, logout } = useAdminAuth();
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'quote-submissions'],
    queryFn: () =>
      adminFetch<Page<QuoteSubmission>>(
        '/api/v1/admin/quote-submissions?size=100',
        token,
        {},
        logout,
      ),
    enabled: !!token,
  });

  const remove = useMutation({
    mutationFn: (id: number) =>
      adminFetch<void>(`/api/v1/admin/quote-submissions/${id}`, token, { method: 'DELETE' }, logout),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'quote-submissions'] }),
  });

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <h1>Qiymət təklifləri</h1>
          <p className="admin-page-sub">Sayt-dan gələn icarə sorğuları.</p>
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
              <th>Texnika / müddət</th>
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
                <td>
                  <div>{s.equipmentType ?? '—'}</div>
                  <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>{s.duration ?? '—'}</div>
                </td>
                <td>
                  <SubmissionStatusSelect resource="quote-submissions" id={s.id} current={s.status} />
                </td>
                <td className="admin-table-actions">
                  <Link href={`/admin/quote-submissions/${s.id}`} className="admin-btn admin-btn-ghost">Bax</Link>
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
