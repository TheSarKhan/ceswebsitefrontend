'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminAuth, adminFetch } from '@/lib/admin-auth';

export type SubmissionStatus = 'NEW' | 'SEEN' | 'REPLIED' | 'SPAM';

const STATUS_LABELS: Record<SubmissionStatus, string> = {
  NEW: 'Yeni',
  SEEN: 'Baxılıb',
  REPLIED: 'Cavablandı',
  SPAM: 'Spam',
};

type Props = {
  resource: 'contact-submissions' | 'quote-submissions';
  id: number;
  current: SubmissionStatus;
};

export function SubmissionStatusSelect({ resource, id, current }: Props) {
  const { token, logout } = useAdminAuth();
  const qc = useQueryClient();

  const mutate = useMutation({
    mutationFn: (status: SubmissionStatus) =>
      adminFetch<unknown>(
        `/api/v1/admin/${resource}/${id}/status`,
        token,
        { method: 'PATCH', body: JSON.stringify({ status }) },
        logout,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', resource] });
      qc.invalidateQueries({ queryKey: ['admin', resource, String(id)] });
    },
  });

  return (
    <select
      className={'admin-status admin-status-' + current.toLowerCase()}
      value={current}
      onChange={(e) => mutate.mutate(e.target.value as SubmissionStatus)}
      disabled={mutate.isPending}
    >
      {(Object.keys(STATUS_LABELS) as SubmissionStatus[]).map((s) => (
        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
      ))}
    </select>
  );
}
