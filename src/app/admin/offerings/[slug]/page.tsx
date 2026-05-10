'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAdminAuth, adminFetch } from '@/lib/admin-auth';
import { OfferingForm } from '@/components/admin/OfferingForm';
import type { OfferingDto } from '@/lib/types';

export default function OfferingEdit({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const { token, logout } = useAdminAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'offerings', slug],
    queryFn: () => adminFetch<OfferingDto>(`/api/v1/admin/offerings/${slug}`, token, {}, logout),
    enabled: !!token,
  });

  return (
    <div className="admin-page">
      <header className="admin-page-head"><h1>Xidməti redaktə et</h1></header>
      {isLoading && <div className="admin-loading">Yüklənir…</div>}
      {isError && <div className="admin-form-error">Məlumat yüklənmədi.</div>}
      {data && (
        <OfferingForm
          initial={data}
          onSaved={() => router.push('/admin/offerings')}
          onCancel={() => router.push('/admin/offerings')}
        />
      )}
    </div>
  );
}
