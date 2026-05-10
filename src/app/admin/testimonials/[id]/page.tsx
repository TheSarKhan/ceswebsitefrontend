'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAdminAuth, adminFetch } from '@/lib/admin-auth';
import { TestimonialForm } from '@/components/admin/TestimonialForm';
import type { TestimonialDto } from '@/lib/types';

export default function TestimonialEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { token, logout } = useAdminAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'testimonials', id],
    queryFn: () => adminFetch<TestimonialDto>(`/api/v1/admin/testimonials/${id}`, token, {}, logout),
    enabled: !!token,
  });

  return (
    <div className="admin-page">
      <header className="admin-page-head"><h1>Rəyi redaktə et</h1></header>
      {isLoading && <div className="admin-loading">Yüklənir…</div>}
      {isError && <div className="admin-form-error">Məlumat yüklənmədi.</div>}
      {data && (
        <TestimonialForm
          initial={data}
          onSaved={() => router.push('/admin/testimonials')}
          onCancel={() => router.push('/admin/testimonials')}
        />
      )}
    </div>
  );
}
