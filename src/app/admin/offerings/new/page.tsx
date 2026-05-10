'use client';

import { useRouter } from 'next/navigation';
import { OfferingForm } from '@/components/admin/OfferingForm';

export default function OfferingCreate() {
  const router = useRouter();
  return (
    <div className="admin-page">
      <header className="admin-page-head"><h1>Yeni xidmət</h1></header>
      <OfferingForm
        onSaved={() => router.push('/admin/offerings')}
        onCancel={() => router.push('/admin/offerings')}
      />
    </div>
  );
}
