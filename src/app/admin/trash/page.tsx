'use client';

import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAdminAuth, adminFetch } from '@/lib/admin-auth';
import { useToast } from '@/components/admin/ToastProvider';

type TrashItem = {
  kind: string;
  id: number;
  slug: string | null;
  label: string;
  hint: string | null;
  deletedAt: string;
};

const KIND_LABELS: Record<string, string> = {
  'fleet-category': 'Kateqoriya',
  'fleet-subcategory': 'Alt-kateqoriya',
  'fleet-item': 'Texnika',
  project: 'Layihə',
  offering: 'Xidmət',
  testimonial: 'Rəy',
  client: 'Müştəri',
  faq: 'Sual-cavab',
  'quote-submission': 'Mesaj',
};

const RETENTION_DAYS = 90;

export default function TrashPage() {
  const { token, logout } = useAdminAuth();
  const qc = useQueryClient();
  const toast = useToast();

  const trash = useQuery({
    queryKey: ['admin', 'trash'],
    queryFn: () => adminFetch<TrashItem[]>('/api/v1/admin/trash', token, {}, logout),
    enabled: !!token,
    staleTime: 30_000,
  });

  const restore = useMutation({
    mutationFn: ({ kind, id }: { kind: string; id: number }) =>
      adminFetch<void>(
        `/api/v1/admin/trash/${kind}/${id}/restore`,
        token,
        { method: 'POST' },
        logout,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'trash'] });
      qc.invalidateQueries({ queryKey: ['admin'] }); // refresh other admin lists
      toast.success('Bərpa edildi');
    },
    onError: () => toast.error('Bərpa edilmədi'),
  });

  const purge = useMutation({
    mutationFn: ({ kind, id }: { kind: string; id: number }) =>
      adminFetch<void>(
        `/api/v1/admin/trash/${kind}/${id}`,
        token,
        { method: 'DELETE' },
        logout,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'trash'] });
      toast.success('Tam silindi');
    },
    onError: () => toast.error('Silinmədi'),
  });

  const items = useMemo(() => trash.data ?? [], [trash.data]);

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <h1>Silinmiş məlumatlar</h1>
          <p className="admin-page-sub">
            Silinmiş elementlər {RETENTION_DAYS} gün saxlanılır, sonra avtomatik tam silinir.
            Bərpa düyməsi ilə yenidən aktivləşdirə bilərsən.
          </p>
        </div>
      </header>

      {trash.isLoading && <div className="admin-loading">Yüklənir…</div>}
      {trash.isError && (
        <div className="admin-form-error">Siyahı yüklənmədi.</div>
      )}

      {trash.data && items.length === 0 && (
        <div className="admin-table-empty" style={{ padding: 60 }}>
          Silinmiş məlumat yoxdur
        </div>
      )}

      {items.length > 0 && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Növ</th>
              <th>Ad</th>
              <th>Əlavə</th>
              <th>Silindi</th>
              <th>Qalan</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => {
              const deletedMs = new Date(it.deletedAt).getTime();
              const ageDays = Math.floor((Date.now() - deletedMs) / 86_400_000);
              const remaining = Math.max(0, RETENTION_DAYS - ageDays);
              const pending = restore.isPending || purge.isPending;
              return (
                <tr key={`${it.kind}-${it.id}`}>
                  <td>
                    <span className="trash-kind">
                      {KIND_LABELS[it.kind] ?? it.kind}
                    </span>
                  </td>
                  <td>
                    <strong>{it.label}</strong>
                    {it.slug && (
                      <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>
                        {it.slug}
                      </div>
                    )}
                  </td>
                  <td className="mono" style={{ fontSize: 12, color: 'var(--fg-3)' }}>
                    {it.hint ?? '—'}
                  </td>
                  <td className="mono" style={{ fontSize: 11 }}>
                    {ageDays === 0 ? 'bu gün' : `${ageDays} gün əvvəl`}
                  </td>
                  <td className="mono" style={{ fontSize: 11 }}>
                    <span
                      className={
                        'trash-remaining' +
                        (remaining < 7 ? ' is-urgent' : remaining < 30 ? ' is-soon' : '')
                      }
                    >
                      {remaining} gün
                    </span>
                  </td>
                  <td className="admin-table-actions">
                    <button
                      className="admin-btn admin-btn-ghost"
                      disabled={pending}
                      onClick={() => restore.mutate({ kind: it.kind, id: it.id })}
                    >
                      Bərpa et
                    </button>
                    <button
                      className="admin-btn admin-btn-danger"
                      disabled={pending}
                      onClick={() => {
                        if (
                          confirm(
                            `"${it.label}" tam silinsin? Bərpa mümkün olmayacaq.`,
                          )
                        ) {
                          purge.mutate({ kind: it.kind, id: it.id });
                        }
                      }}
                    >
                      Tam sil
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
