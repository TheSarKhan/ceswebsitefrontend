'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAdminAuth, adminFetch } from '@/lib/admin-auth';
import { FaqForm } from '@/components/admin/FaqForm';
import type { FaqDto } from '@/lib/types';

export default function FaqEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { token, logout } = useAdminAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'faqs', id],
    queryFn: () => adminFetch<FaqDto>(`/api/v1/admin/faqs/${id}`, token, {}, logout),
    enabled: !!token,
  });

  return (
    <div className="admin-page">
      <header className="admin-page-head"><h1>FAQ-i redaktə et</h1></header>
      {isLoading && <div className="admin-loading">Yüklənir…</div>}
      {isError && <div className="admin-form-error">Məlumat yüklənmədi.</div>}
      {data && (
        <FaqForm
          initial={data}
          onSaved={() => router.push('/admin/faqs')}
          onCancel={() => router.push('/admin/faqs')}
        />
      )}
    </div>
  );
}
