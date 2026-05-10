'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAdminAuth, adminFetch } from '@/lib/admin-auth';
import { FleetSubcategoryForm } from '@/components/admin/FleetSubcategoryForm';
import type { FleetSubcategoryDto } from '@/lib/types';

export default function FleetSubcategoryEdit({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const { token, logout } = useAdminAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'fleet', 'subcategories', slug],
    queryFn: () =>
      adminFetch<FleetSubcategoryDto>(`/api/v1/admin/fleet/subcategories/${slug}`, token, {}, logout),
    enabled: !!token,
  });

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <h1>Alt-kateqoriyanı redaktə et</h1>
      </header>
      {isLoading && <div className="admin-loading">Yüklənir…</div>}
      {isError && <div className="admin-form-error">Məlumat yüklənmədi.</div>}
      {data && (
        <FleetSubcategoryForm
          initial={data}
          onSaved={() => router.push('/admin/fleet/subcategories')}
          onCancel={() => router.push('/admin/fleet/subcategories')}
        />
      )}
    </div>
  );
}
