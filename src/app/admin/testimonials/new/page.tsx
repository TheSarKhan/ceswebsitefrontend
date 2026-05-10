'use client';

import { useRouter } from 'next/navigation';
import { TestimonialForm } from '@/components/admin/TestimonialForm';

export default function TestimonialCreate() {
  const router = useRouter();
  return (
    <div className="admin-page">
      <header className="admin-page-head"><h1>Yeni rəy</h1></header>
      <TestimonialForm
        onSaved={() => router.push('/admin/testimonials')}
        onCancel={() => router.push('/admin/testimonials')}
      />
    </div>
  );
}
