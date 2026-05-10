'use client';

import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminAuth, adminFetch } from '@/lib/admin-auth';
import { pickTr, type FaqDto } from '@/lib/types';

export default function FaqsList() {
  const { token, logout } = useAdminAuth();
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'faqs'],
    queryFn: () => adminFetch<FaqDto[]>('/api/v1/admin/faqs', token, {}, logout),
    enabled: !!token,
  });

  const remove = useMutation({
    mutationFn: (id: number) =>
      adminFetch<void>(`/api/v1/admin/faqs/${id}`, token, { method: 'DELETE' }, logout),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'faqs'] }),
  });

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <h1>Sual-cavab</h1>
          <p className="admin-page-sub">Saytdakı FAQ siyahısı.</p>
        </div>
        <Link href="/admin/faqs/new" className="admin-btn admin-btn-primary">+ Əlavə et</Link>
      </header>

      {isLoading && <div className="admin-loading">Yüklənir…</div>}
      {isError && <div className="admin-form-error">Məlumat yüklənmədi.</div>}

      {data && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Sual (AZ)</th>
              <th>Sıra</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.map((f) => {
              const az = pickTr(f.translations, 'AZ');
              return (
                <tr key={f.id}>
                  <td>{f.id}</td>
                  <td>{az?.question}</td>
                  <td>{f.sortOrder}</td>
                  <td className="admin-table-actions">
                    <Link href={`/admin/faqs/${f.id}`} className="admin-btn admin-btn-ghost">Redaktə</Link>
                    <button
                      className="admin-btn admin-btn-danger"
                      onClick={() => { if (confirm(`#${f.id} silinsin?`)) remove.mutate(f.id); }}
                      disabled={remove.isPending}
                    >Sil</button>
                  </td>
                </tr>
              );
            })}
            {data.length === 0 && (
              <tr><td colSpan={4} className="admin-table-empty">Hələ FAQ yoxdur.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
