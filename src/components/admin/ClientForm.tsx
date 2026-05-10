'use client';

import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminAuth, adminFetch } from '@/lib/admin-auth';
import { ApiError } from '@/lib/api';
import { useToast } from './ToastProvider';
import { ImageUploadField } from './ImageUploadField';
import type { ClientDto } from '@/lib/types';

type Props = {
  initial?: ClientDto;
  onSaved: (saved: ClientDto) => void;
  onCancel: () => void;
};

export function ClientForm({ initial, onSaved, onCancel }: Props) {
  const isEdit = !!initial;
  const { token, logout } = useAdminAuth();
  const qc = useQueryClient();
  const toast = useToast();

  const [name, setName] = useState(initial?.name ?? '');
  const [logo, setLogo] = useState(initial?.logo ?? '');
  const [url, setUrl] = useState(initial?.url ?? '');
  const [sortOrder, setSortOrder] = useState<number>(initial?.sortOrder ?? 0);
  const [isPublished, setIsPublished] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const mutate = useMutation({
    mutationFn: () => {
      const body = JSON.stringify({ name, logo, url: url || null, sortOrder, isPublished });
      const path = isEdit
        ? `/api/v1/admin/clients/${initial!.id}`
        : '/api/v1/admin/clients';
      return adminFetch<ClientDto>(
        path,
        token,
        { method: isEdit ? 'PUT' : 'POST', body },
        logout,
      );
    },
    onSuccess: (saved) => {
      qc.invalidateQueries({ queryKey: ['admin', 'clients'] });
      toast.success(isEdit ? 'Müştəri yeniləndi' : 'Müştəri yaradıldı');
      onSaved(saved);
    },
    onError: (e) => {
      const msg = e instanceof ApiError ? `Server xətası (${e.status}).` : 'Şəbəkə xətası.';
      setError(msg);
      toast.error(msg);
    },
  });

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    mutate.mutate();
  }

  return (
    <form onSubmit={onSubmit} className="admin-form">
      <div className="admin-field">
        <label>Ad</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={128} />
      </div>

      <ImageUploadField
        value={logo}
        onChange={setLogo}
        folder="clients"
        label="Logo"
        required
      />

      <div className="admin-field">
        <label>Vebsayt URL (istəyə görə)</label>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          maxLength={512}
          placeholder="https://example.com"
        />
      </div>

      <div className="admin-field">
        <label>Sıra</label>
        <input
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(Number(e.target.value))}
        />
      </div>

      <div className="admin-field admin-field-row">
        <label>
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />{' '}
          Saytda görünsün
        </label>
      </div>

      {error && <div className="admin-form-error">{error}</div>}

      <div className="admin-form-actions">
        <button type="button" className="admin-btn admin-btn-ghost" onClick={onCancel}>
          Imtina
        </button>
        <button
          type="submit"
          className="admin-btn admin-btn-primary"
          disabled={mutate.isPending}
        >
          {mutate.isPending ? 'Yadda saxlanılır…' : isEdit ? 'Yadda saxla' : 'Yarat'}
        </button>
      </div>
    </form>
  );
}
