'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAdminAuth, adminFetch } from '@/lib/admin-auth';
import { FleetCategoryForm } from '@/components/admin/FleetCategoryForm';
import type { FleetCategoryDto } from '@/lib/types';

export default function FleetCategoryEdit({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const { token, logout } = useAdminAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'fleet', 'categories', slug],
    queryFn: () =>
      adminFetch<FleetCategoryDto>(`/api/v1/admin/fleet/categories/${slug}`, token, {}, logout),
    enabled: !!token,
  });

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <h1>Kateqoriyanı redaktə et</h1>
      </header>
      {isLoading && <div className="admin-loading">Yüklənir…</div>}
      {isError && <div className="admin-form-error">Məlumat yüklənmədi.</div>}
      {data && (
        <FleetCategoryForm
          initial={data}
          onSaved={() => router.push('/admin/fleet/categories')}
          onCancel={() => router.push('/admin/fleet/categories')}
        />
      )}
    </div>
  );
}
