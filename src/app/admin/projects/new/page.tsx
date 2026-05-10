'use client';

import { useRouter } from 'next/navigation';
import { ProjectForm } from '@/components/admin/ProjectForm';

export default function ProjectCreate() {
  const router = useRouter();
  return (
    <div className="admin-page">
      <header className="admin-page-head"><h1>Yeni layihə</h1></header>
      <ProjectForm
        onSaved={() => router.push('/admin/projects')}
        onCancel={() => router.push('/admin/projects')}
      />
    </div>
  );
}
