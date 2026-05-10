'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAdminAuth, adminFetch } from '@/lib/admin-auth';
import { ClientForm } from '@/components/admin/ClientForm';
import type { ClientDto } from '@/lib/types';

export default function AdminClientEdit({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { token, logout } = useAdminAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'clients', id],
    queryFn: () => adminFetch<ClientDto>(`/api/v1/admin/clients/${id}`, token, {}, logout),
    enabled: !!token,
  });

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <h1>Müştərini redaktə et</h1>
      </header>
      {isLoading && <div className="admin-loading">Yüklənir…</div>}
      {isError && <div className="admin-form-error">Məlumat yüklənmədi.</div>}
      {data && (
        <ClientForm
          initial={data}
          onSaved={() => router.push('/admin/clients')}
          onCancel={() => router.push('/admin/clients')}
        />
      )}
    </div>
  );
}
