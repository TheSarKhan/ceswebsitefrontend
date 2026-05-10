'use client';

import { useRouter } from 'next/navigation';
import { FleetSubcategoryForm } from '@/components/admin/FleetSubcategoryForm';

export default function FleetSubcategoryCreate() {
  const router = useRouter();
  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <h1>Yeni alt-kateqoriya</h1>
      </header>
      <FleetSubcategoryForm
        onSaved={() => router.push('/admin/fleet/subcategories')}
        onCancel={() => router.push('/admin/fleet/subcategories')}
      />
    </div>
  );
}
