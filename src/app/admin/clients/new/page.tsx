'use client';

import { useRouter } from 'next/navigation';
import { ClientForm } from '@/components/admin/ClientForm';

export default function AdminClientCreate() {
  const router = useRouter();
  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <h1>Yeni müştəri</h1>
      </header>
      <ClientForm
        onSaved={() => router.push('/admin/clients')}
        onCancel={() => router.push('/admin/clients')}
      />
    </div>
  );
}
