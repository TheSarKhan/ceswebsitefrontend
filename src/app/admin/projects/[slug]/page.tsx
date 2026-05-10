'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAdminAuth, adminFetch } from '@/lib/admin-auth';
import { ProjectForm } from '@/components/admin/ProjectForm';
import type { ProjectDto } from '@/lib/types';

export default function ProjectEdit({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const { token, logout } = useAdminAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'projects', slug],
    queryFn: () => adminFetch<ProjectDto>(`/api/v1/admin/projects/${slug}`, token, {}, logout),
    enabled: !!token,
  });

  return (
    <div className="admin-page">
      <header className="admin-page-head"><h1>Layihəni redaktə et</h1></header>
      {isLoading && <div className="admin-loading">Yüklənir…</div>}
      {isError && <div className="admin-form-error">Məlumat yüklənmədi.</div>}
      {data && (
        <ProjectForm
          initial={data}
          onSaved={() => router.push('/admin/projects')}
          onCancel={() => router.push('/admin/projects')}
        />
      )}
    </div>
  );
}
