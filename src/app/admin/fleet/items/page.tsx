'use client';

import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminAuth, adminFetch } from '@/lib/admin-auth';
import { pickTr, type FleetItemCard } from '@/lib/types';

export default function FleetItemsList() {
  const { token, logout } = useAdminAuth();
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'fleet', 'items'],
    queryFn: () => adminFetch<FleetItemCard[]>('/api/v1/admin/fleet/items', token, {}, logout),
    enabled: !!token,
  });

  const remove = useMutation({
    mutationFn: (slug: string) =>
      adminFetch<void>(`/api/v1/admin/fleet/items/${slug}`, token, { method: 'DELETE' }, logout),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'fleet', 'items'] }),
  });

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <h1>Texnika</h1>
          <p className="admin-page-sub">Kataloqun üçüncü pilləsi — konkret avadanlıq vahidləri.</p>
        </div>
        <Link href="/admin/fleet/items/new" className="admin-btn admin-btn-primary">+ Əlavə et</Link>
      </header>

      {isLoading && <div className="admin-loading">Yüklənir…</div>}
      {isError && <div className="admin-form-error">Məlumat yüklənmədi.</div>}

      {data && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Slug</th>
              <th>Şəkil</th>
              <th>Model</th>
              <th>Ad (AZ)</th>
              <th>Qiymət</th>
              <th>Sıra</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.map((it) => (
              <tr key={it.slug}>
                <td><span className="mono">{it.slug}</span></td>
                <td className="admin-table-logo">
                  {it.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.image} alt={it.slug} />
                  )}
                </td>
                <td><span className="mono" style={{ color: 'var(--fg-3)' }}>{it.modelNumber}</span></td>
                <td>{pickTr(it.translations, 'AZ')?.name}</td>
                <td>
                  {it.price}
                  {it.priceUnit && (
                    <span style={{ color: 'var(--fg-3)', fontSize: 11, marginLeft: 4 }}>/{it.priceUnit}</span>
                  )}
                </td>
                <td>{it.sortOrder}</td>
                <td className="admin-table-actions">
                  <Link href={`/admin/fleet/items/${it.slug}`} className="admin-btn admin-btn-ghost">Redaktə</Link>
                  <button
                    className="admin-btn admin-btn-danger"
                    onClick={() => { if (confirm(`"${it.slug}" silinsin?`)) remove.mutate(it.slug); }}
                    disabled={remove.isPending}
                  >Sil</button>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={7} className="admin-table-empty">Hələ texnika yoxdur.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
