'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import { useAdminAuth, adminFetch } from '@/lib/admin-auth';

type UploadResponse = {
  key: string;
  url: string;
  contentType: string;
  size: number;
};

type Folder =
  | 'fleet'
  | 'projects'
  | 'testimonials'
  | 'clients'
  | 'offerings'
  | 'misc';

type Props = {
  value: string | null | undefined;
  onChange: (url: string) => void;
  folder?: Folder;
  label?: string;
  hint?: string;
  required?: boolean;
};

export function ImageUploadField({
  value,
  onChange,
  folder = 'misc',
  label = 'Şəkil',
  hint,
  required,
}: Props) {
  const { token, logout } = useAdminAuth();
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onPick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', folder);
      const res = await adminFetch<UploadResponse>(
        '/api/v1/admin/uploads',
        token,
        { method: 'POST', body: fd },
        logout,
      );
      onChange(res.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Yükləmə xətası');
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  }

  function clear() {
    onChange('');
    if (fileInput.current) fileInput.current.value = '';
  }

  return (
    <div className="admin-field">
      <label>
        {label}
        {required && <span style={{ color: 'var(--gold)' }}> *</span>}
      </label>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
          onChange={onPick}
          disabled={uploading || !token}
          style={{ background: 'transparent', border: 0, padding: 0, fontSize: 12 }}
        />
        {uploading && (
          <span className="mono" style={{ fontSize: 11, color: 'var(--gold)' }}>
            Yüklənir…
          </span>
        )}
        {value && !uploading && (
          <button
            type="button"
            onClick={clear}
            className="admin-btn admin-btn-ghost"
            style={{ padding: '2px 10px', fontSize: 11 }}
          >
            Sil
          </button>
        )}
      </div>
      {hint && (
        <div style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 4 }}>{hint}</div>
      )}
      {error && <div className="admin-form-error">{error}</div>}
      {value && (
        <div className="admin-form-preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="preview" />
        </div>
      )}
    </div>
  );
}
