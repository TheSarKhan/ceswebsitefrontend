'use client';

import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminAuth, adminFetch } from '@/lib/admin-auth';
import { pickTr, type ProjectDto } from '@/lib/types';
import { ReorderList } from '@/components/admin/ReorderList';
import { useToast } from '@/components/admin/ToastProvider';

export default function ProjectsList() {
  const { token, logout } = useAdminAuth();
  const qc = useQueryClient();
  const toast = useToast();

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

  const reorder = useMutation({
    mutationFn: (slugs: string[]) =>
      adminFetch<void>('/api/v1/admin/projects/reorder', token, {
        method: 'PATCH',
        body: JSON.stringify({ slugs }),
      }, logout),
    onSuccess: () => {
      toast.success('Sıra yeniləndi');
      qc.invalidateQueries({ queryKey: ['admin', 'projects'] });
    },
    onError: () => {
      toast.error('Sıra yadda saxlanmadı');
      qc.invalidateQueries({ queryKey: ['admin', 'projects'] });
    },
  });

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <h1>Layihələr</h1>
          <p className="admin-page-sub">
            Sayt portfoliosu. Sıralamaq üçün ⠿ tutub sürüşdürün — saytda bu sırada göstərilir.
          </p>
        </div>
        <Link href="/admin/projects/new" className="admin-btn admin-btn-primary">+ Əlavə et</Link>
      </header>

      {isLoading && <div className="admin-loading">Yüklənir…</div>}
      {isError && <div className="admin-form-error">Məlumat yüklənmədi.</div>}

      {data && data.length === 0 && (
        <div className="admin-table-empty">Hələ layihə yoxdur.</div>
      )}

      {data && data.length > 0 && (
        <ReorderList
          items={data}
          getKey={(p) => p.slug}
          disabled={reorder.isPending}
          onPersist={(slugs) => reorder.mutate(slugs)}
          renderRow={(p) => (
            <div className="admin-reorder-cells">
              <span className="admin-reorder-thumb">
                {p.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image} alt={p.slug} />
                )}
              </span>
              <span className="admin-reorder-name">{pickTr(p.translations, 'AZ')?.title ?? p.slug}</span>
              {p.year && <span className="admin-reorder-meta">{p.year}</span>}
              <span className="admin-reorder-actions">
                <Link href={`/admin/projects/${p.slug}`} className="admin-btn admin-btn-ghost">
                  Redaktə
                </Link>
                <button
                  className="admin-btn admin-btn-danger"
                  onClick={() => {
                    if (confirm(`"${pickTr(p.translations, 'AZ')?.title ?? p.slug}" silinsin?`)) {
                      remove.mutate(p.slug);
                    }
                  }}
                  disabled={remove.isPending}
                >
                  Sil
                </button>
              </span>
            </div>
          )}
        />
      )}
    </div>
  );
}
