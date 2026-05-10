'use client';

import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminAuth, adminFetch } from '@/lib/admin-auth';
import type { ClientDto } from '@/lib/types';

export default function AdminClientsList() {
  const { token, logout } = useAdminAuth();
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'clients'],
    queryFn: () => adminFetch<ClientDto[]>('/api/v1/admin/clients', token, {}, logout),
    enabled: !!token,
  });

  const remove = useMutation({
    mutationFn: (id: number) =>
      adminFetch<void>(`/api/v1/admin/clients/${id}`, token, { method: 'DELETE' }, logout),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'clients'] }),
  });

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <h1>Müştərilər</h1>
          <p className="admin-page-sub">Loqo qalereyası — sayt aşağısında göstərilir.</p>
        </div>
        <Link href="/admin/clients/new" className="admin-btn admin-btn-primary">
          + Əlavə et
        </Link>
      </header>

      {isLoading && <div className="admin-loading">Yüklənir…</div>}
      {isError && <div className="admin-form-error">Məlumat yüklənmədi.</div>}

      {data && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Ad</th>
              <th>Logo</th>
              <th>Sıra</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.name}</td>
                <td className="admin-table-logo">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.logo} alt={c.name} />
                </td>
                <td>{c.sortOrder}</td>
                <td className="admin-table-actions">
                  <Link href={`/admin/clients/${c.id}`} className="admin-btn admin-btn-ghost">
                    Redaktə
                  </Link>
                  <button
                    className="admin-btn admin-btn-danger"
                    onClick={() => {
                      if (confirm(`"${c.name}" silinsin?`)) remove.mutate(c.id);
                    }}
                    disabled={remove.isPending}
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={5} className="admin-table-empty">
                  Hələ müştəri əlavə olunmayıb.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
