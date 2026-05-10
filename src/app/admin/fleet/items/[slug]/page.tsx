'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAdminAuth, adminFetch } from '@/lib/admin-auth';
import { FleetItemForm } from '@/components/admin/FleetItemForm';
import type { FleetItemDto } from '@/lib/types';

export default function FleetItemEdit({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const { token, logout } = useAdminAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'fleet', 'items', slug],
    queryFn: () => adminFetch<FleetItemDto>(`/api/v1/admin/fleet/items/${slug}`, token, {}, logout),
    enabled: !!token,
  });

  return (
    <div className="admin-page">
      <header className="admin-page-head"><h1>Texnikanı redaktə et</h1></header>
      {isLoading && <div className="admin-loading">Yüklənir…</div>}
      {isError && <div className="admin-form-error">Məlumat yüklənmədi.</div>}
      {data && (
        <FleetItemForm
          initial={data}
          onSaved={() => router.push('/admin/fleet/items')}
          onCancel={() => router.push('/admin/fleet/items')}
        />
      )}
    </div>
  );
}
