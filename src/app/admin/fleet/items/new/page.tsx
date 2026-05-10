'use client';

import { useRouter } from 'next/navigation';
import { FleetItemForm } from '@/components/admin/FleetItemForm';

export default function FleetItemCreate() {
  const router = useRouter();
  return (
    <div className="admin-page">
      <header className="admin-page-head"><h1>Yeni texnika</h1></header>
      <FleetItemForm
        onSaved={() => router.push('/admin/fleet/items')}
        onCancel={() => router.push('/admin/fleet/items')}
      />
    </div>
  );
}
