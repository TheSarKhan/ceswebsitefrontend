'use client';

import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminAuth, adminFetch } from '@/lib/admin-auth';
import { pickTr, type TestimonialDto } from '@/lib/types';

export default function TestimonialsList() {
  const { token, logout } = useAdminAuth();
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'testimonials'],
    queryFn: () => adminFetch<TestimonialDto[]>('/api/v1/admin/testimonials', token, {}, logout),
    enabled: !!token,
  });

  const remove = useMutation({
    mutationFn: (id: number) =>
      adminFetch<void>(`/api/v1/admin/testimonials/${id}`, token, { method: 'DELETE' }, logout),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'testimonials'] }),
  });

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <h1>Rəylər</h1>
          <p className="admin-page-sub">Müştəri sitatları.</p>
        </div>
        <Link href="/admin/testimonials/new" className="admin-btn admin-btn-primary">+ Əlavə et</Link>
      </header>

      {isLoading && <div className="admin-loading">Yüklənir…</div>}
      {isError && <div className="admin-form-error">Məlumat yüklənmədi.</div>}

      {data && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Ad</th>
              <th>Şirkət</th>
              <th>Sitat (AZ)</th>
              <th>Sıra</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.map((t) => {
              const az = pickTr(t.translations, 'AZ');
              return (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td>{t.name}</td>
                  <td>{t.company}</td>
                  <td style={{ maxWidth: 360 }}>
                    {az?.quote && (az.quote.length > 80 ? az.quote.slice(0, 80) + '…' : az.quote)}
                  </td>
                  <td>{t.sortOrder}</td>
                  <td className="admin-table-actions">
                    <Link href={`/admin/testimonials/${t.id}`} className="admin-btn admin-btn-ghost">Redaktə</Link>
                    <button
                      className="admin-btn admin-btn-danger"
                      onClick={() => { if (confirm(`#${t.id} silinsin?`)) remove.mutate(t.id); }}
                      disabled={remove.isPending}
                    >Sil</button>
                  </td>
                </tr>
              );
            })}
            {data.length === 0 && (
              <tr><td colSpan={6} className="admin-table-empty">Hələ rəy yoxdur.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
