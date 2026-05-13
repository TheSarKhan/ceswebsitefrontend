'use client';

import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminAuth, adminFetch } from '@/lib/admin-auth';
import { pickTr, type ProjectDto } from '@/lib/types';

export default function ProjectsList() {
  const { token, logout } = useAdminAuth();
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'projects'],
    queryFn: () => adminFetch<ProjectDto[]>('/api/v1/admin/projects', token, {}, logout),
    enabled: !!token,
  });

  const remove = useMutation({
    mutationFn: (slug: string) =>
      adminFetch<void>(`/api/v1/admin/projects/${slug}`, token, { method: 'DELETE' }, logout),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'projects'] }),
  });

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <h1>Layihələr</h1>
          <p className="admin-page-sub">Sayt portfoliosu.</p>
        </div>
        <Link href="/admin/projects/new" className="admin-btn admin-btn-primary">+ Əlavə et</Link>
      </header>

      {isLoading && <div className="admin-loading">Yüklənir…</div>}
      {isError && <div className="admin-form-error">Məlumat yüklənmədi.</div>}

      {data && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Şəkil</th>
              <th>AZ ad</th>
              <th>İl</th>
              <th>Sıra</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.map((p) => (
              <tr key={p.slug}>
                <td className="admin-table-logo">
                  {p.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image} alt={p.slug} />
                  )}
                </td>
                <td>{pickTr(p.translations, 'AZ')?.title}</td>
                <td>{p.year}</td>
                <td>{p.sortOrder}</td>
                <td className="admin-table-actions">
                  <Link href={`/admin/projects/${p.slug}`} className="admin-btn admin-btn-ghost">Redaktə</Link>
                  <button
                    className="admin-btn admin-btn-danger"
                    onClick={() => { if (confirm(`"${pickTr(p.translations, 'AZ')?.title ?? p.slug}" silinsin?`)) remove.mutate(p.slug); }}
                    disabled={remove.isPending}
                  >Sil</button>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={5} className="admin-table-empty">Hələ layihə yoxdur.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
