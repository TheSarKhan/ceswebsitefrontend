'use client';

import { useRouter } from 'next/navigation';
import { FleetCategoryForm } from '@/components/admin/FleetCategoryForm';

export default function FleetCategoryCreate() {
  const router = useRouter();
  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <h1>Yeni kateqoriya</h1>
      </header>
      <FleetCategoryForm
        onSaved={() => router.push('/admin/fleet/categories')}
        onCancel={() => router.push('/admin/fleet/categories')}
      />
    </div>
  );
}
