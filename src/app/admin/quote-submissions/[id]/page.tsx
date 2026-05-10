'use client';

import { use } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useAdminAuth, adminFetch } from '@/lib/admin-auth';
import { SubmissionStatusSelect, type SubmissionStatus } from '@/components/admin/SubmissionStatusSelect';

type QuoteSubmission = {
  id: number;
  name: string;
  email: string | null;
  phone: string;
  company: string | null;
  equipmentType: string | null;
  duration: string | null;
  location: string | null;
  message: string | null;
  status: SubmissionStatus;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
};

export default function QuoteSubmissionView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { token, logout } = useAdminAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'quote-submissions', id],
    queryFn: () =>
      adminFetch<QuoteSubmission>(`/api/v1/admin/quote-submissions/${id}`, token, {}, logout),
    enabled: !!token,
  });

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <h1>Qiymət təklifi #{id}</h1>
        <Link href="/admin/quote-submissions" className="admin-btn admin-btn-ghost">← Geri</Link>
      </header>

      {isLoading && <div className="admin-loading">Yüklənir…</div>}
      {isError && <div className="admin-form-error">Məlumat yüklənmədi.</div>}

      {data && (
        <div className="admin-detail">
          <DetailRow label="Status">
            <SubmissionStatusSelect resource="quote-submissions" id={data.id} current={data.status} />
          </DetailRow>
          <DetailRow label="Tarix"><span className="mono">{data.createdAt}</span></DetailRow>
          <DetailRow label="Ad">{data.name}</DetailRow>
          <DetailRow label="Şirkət">{data.company ?? '—'}</DetailRow>
          <DetailRow label="Telefon"><a href={`tel:${data.phone}`}>{data.phone}</a></DetailRow>
          <DetailRow label="E-poçt">
            {data.email ? <a href={`mailto:${data.email}`}>{data.email}</a> : '—'}
          </DetailRow>
          <DetailRow label="Texnika növü">{data.equipmentType ?? '—'}</DetailRow>
          <DetailRow label="Müddət">{data.duration ?? '—'}</DetailRow>
          <DetailRow label="Ünvan">{data.location ?? '—'}</DetailRow>
          <DetailRow label="Mesaj">
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{data.message ?? '—'}</div>
          </DetailRow>
          <DetailRow label="IP / User-Agent">
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)' }}>
              {data.ipAddress ?? '—'}<br />
              {data.userAgent ?? '—'}
            </div>
          </DetailRow>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="admin-detail-row">
      <div className="admin-detail-label">{label}</div>
      <div className="admin-detail-value">{children}</div>
    </div>
  );
}
