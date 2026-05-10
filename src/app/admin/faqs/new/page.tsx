'use client';

import { useRouter } from 'next/navigation';
import { FaqForm } from '@/components/admin/FaqForm';

export default function FaqCreate() {
  const router = useRouter();
  return (
    <div className="admin-page">
      <header className="admin-page-head"><h1>Yeni FAQ</h1></header>
      <FaqForm
        onSaved={() => router.push('/admin/faqs')}
        onCancel={() => router.push('/admin/faqs')}
      />
    </div>
  );
}
