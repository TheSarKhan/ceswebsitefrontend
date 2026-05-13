'use client';

import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminAuth, adminFetch } from '@/lib/admin-auth';
import { pickTr, type OfferingDto } from '@/lib/types';

export default function OfferingsList() {
  const { token, logout } = useAdminAuth();
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'offerings'],
    queryFn: () => adminFetch<OfferingDto[]>('/api/v1/admin/offerings', token, {}, logout),
    enabled: !!token,
  });

  const remove = useMutation({
    mutationFn: (slug: string) =>
      adminFetch<void>(`/api/v1/admin/offerings/${slug}`, token, { method: 'DELETE' }, logout),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'offerings'] }),
  });

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <h1>Xidmətlər</h1>
          <p className="admin-page-sub">Sayt-da göstərilən xidmət kartları.</p>
        </div>
        <Link href="/admin/offerings/new" className="admin-btn admin-btn-primary">+ Əlavə et</Link>
      </header>

      {isLoading && <div className="admin-loading">Yüklənir…</div>}
      {isError && <div className="admin-form-error">Məlumat yüklənmədi.</div>}

      {data && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Icon</th>
              <th>AZ</th>
              <th>EN</th>
              <th>Sıra</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.map((o) => {
              const az = pickTr(o.translations, 'AZ')?.title;
              const isImage =
                o.icon && (o.icon.startsWith('http') || o.icon.startsWith('/'));
              return (
                <tr key={o.slug}>
                  <td className="admin-table-logo">
                    {isImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={o.icon!} alt={az ?? o.slug} />
                    ) : (
                      <span className="mono" style={{ color: 'var(--fg-3)' }}>{o.icon}</span>
                    )}
                  </td>
                  <td>{az}</td>
                  <td>{pickTr(o.translations, 'EN')?.title}</td>
                  <td>{o.sortOrder}</td>
                  <td className="admin-table-actions">
                    <Link href={`/admin/offerings/${o.slug}`} className="admin-btn admin-btn-ghost">Redaktə</Link>
                    <button
                      className="admin-btn admin-btn-danger"
                      onClick={() => { if (confirm(`"${az ?? o.slug}" silinsin?`)) remove.mutate(o.slug); }}
                      disabled={remove.isPending}
                    >Sil</button>
                  </td>
                </tr>
              );
            })}
            {data.length === 0 && (
              <tr><td colSpan={5} className="admin-table-empty">Hələ xidmət yoxdur.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
