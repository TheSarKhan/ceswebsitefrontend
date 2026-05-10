'use client';

import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminAuth, adminFetch } from '@/lib/admin-auth';
import { pickTr, type FleetCategoryDto } from '@/lib/types';

export default function FleetCategoriesList() {
  const { token, logout } = useAdminAuth();
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'fleet', 'categories'],
    queryFn: () =>
      adminFetch<FleetCategoryDto[]>('/api/v1/admin/fleet/categories', token, {}, logout),
    enabled: !!token,
  });

  const remove = useMutation({
    mutationFn: (slug: string) =>
      adminFetch<void>(`/api/v1/admin/fleet/categories/${slug}`, token, { method: 'DELETE' }, logout),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'fleet', 'categories'] }),
  });

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <h1>Texnika kateqoriyaları</h1>
          <p className="admin-page-sub">3-tier kataloqun birinci pilləsi.</p>
        </div>
        <Link href="/admin/fleet/categories/new" className="admin-btn admin-btn-primary">
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
              <th>AZ</th>
              <th>RU</th>
              <th>EN</th>
              <th>Sıra</th>
              <th>Alt-kateqoriyalar</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.map((c) => (
              <tr key={c.slug}>
                <td><span className="mono">{c.slug}</span></td>
                <td>{pickTr(c.translations, 'AZ')?.name}</td>
                <td>{pickTr(c.translations, 'RU')?.name}</td>
                <td>{pickTr(c.translations, 'EN')?.name}</td>
                <td>{c.sortOrder}</td>
                <td>{c.subcategories.length}</td>
                <td className="admin-table-actions">
                  <Link href={`/admin/fleet/categories/${c.slug}`} className="admin-btn admin-btn-ghost">
                    Redaktə
                  </Link>
                  <button
                    className="admin-btn admin-btn-danger"
                    onClick={() => {
                      if (confirm(`"${c.slug}" silinsin? Alt-kateqoriyalar və texnikalar da silinəcək.`)) {
                        remove.mutate(c.slug);
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
              <tr>
                <td colSpan={7} className="admin-table-empty">Hələ kateqoriya yoxdur.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
