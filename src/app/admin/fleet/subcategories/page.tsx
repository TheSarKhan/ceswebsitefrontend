'use client';

import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminAuth, adminFetch } from '@/lib/admin-auth';
import { pickTr, type FleetSubcategoryDto } from '@/lib/types';

export default function FleetSubcategoriesList() {
  const { token, logout } = useAdminAuth();
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'fleet', 'subcategories'],
    queryFn: () =>
      adminFetch<FleetSubcategoryDto[]>('/api/v1/admin/fleet/subcategories', token, {}, logout),
    enabled: !!token,
  });

  const remove = useMutation({
    mutationFn: (slug: string) =>
      adminFetch<void>(`/api/v1/admin/fleet/subcategories/${slug}`, token, { method: 'DELETE' }, logout),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'fleet', 'subcategories'] }),
  });

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <h1>Alt-kateqoriyalar</h1>
          <p className="admin-page-sub">Kateqoriyaların ikinci pilləsi (məs. 40 t-ə qədər kranlar).</p>
        </div>
        <Link href="/admin/fleet/subcategories/new" className="admin-btn admin-btn-primary">
          + Əlavə et
        </Link>
      </header>

      {isLoading && <div className="admin-loading">Yüklənir…</div>}
      {isError && <div className="admin-form-error">Məlumat yüklənmədi.</div>}

      {data && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Slug</th>
              <th>Ana kateqoriya</th>
              <th>AZ</th>
              <th>EN</th>
              <th>Sıra</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.map((s) => (
              <tr key={s.slug}>
                <td><span className="mono">{s.slug}</span></td>
                <td>
                  <span className="mono" style={{ color: 'var(--fg-3)' }}>{s.category.slug}</span>{' '}
                  {pickTr(s.category.translations, 'AZ')?.name}
                </td>
                <td>{pickTr(s.translations, 'AZ')?.name}</td>
                <td>{pickTr(s.translations, 'EN')?.name}</td>
                <td>{s.sortOrder}</td>
                <td className="admin-table-actions">
                  <Link href={`/admin/fleet/subcategories/${s.slug}`} className="admin-btn admin-btn-ghost">
                    Redaktə
                  </Link>
                  <button
                    className="admin-btn admin-btn-danger"
                    onClick={() => {
                      if (confirm(`"${s.slug}" silinsin? Texnikalar da silinəcək.`)) {
                        remove.mutate(s.slug);
                      }
                    }}
                    disabled={remove.isPending}
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={6} className="admin-table-empty">Hələ alt-kateqoriya yoxdur.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
