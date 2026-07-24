'use client';

import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useAdminAuth, adminFetch } from '@/lib/admin-auth';
import { ImageCropModal } from './ImageCropModal';

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

  // Editor state: source being edited + whether it's a remote (existing) image.
  const [editSrc, setEditSrc] = useState<string | null>(null);
  const [editRemote, setEditRemote] = useState(false);
  const objectUrl = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    };
  }, []);

  function pick() {
    fileInput.current?.click();
  }

  function onPick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (fileInput.current) fileInput.current.value = ''; // allow re-picking same file
    if (!file) return;
    setError(null);
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = URL.createObjectURL(file);
    setEditRemote(false);
    setEditSrc(objectUrl.current);
  }

  function editExisting() {
    if (!value) return;
    setError(null);
    setEditRemote(true);
    setEditSrc(value);
  }

  function closeEditor() {
    if (objectUrl.current) {
      URL.revokeObjectURL(objectUrl.current);
      objectUrl.current = null;
    }
    setEditSrc(null);
    setEditRemote(false);
  }

  async function handleApply(blob: Blob) {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('file', blob, 'image.jpg');
      fd.append('folder', folder);
      const res = await adminFetch<UploadResponse>(
        '/api/v1/admin/uploads',
        token,
        { method: 'POST', body: fd },
        logout,
      );
      onChange(res.url);
      closeEditor();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Yükləmə xətası');
    } finally {
      setUploading(false);
    }
  }

  function clear() {
    onChange('');
  }

  return (
    <div className="admin-field">
      <label>
        {label}
        {required && <span style={{ color: 'var(--gold)' }}> *</span>}
      </label>

      <input
        ref={fileInput}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={onPick}
        disabled={uploading || !token}
        style={{ display: 'none' }}
      />

      {value ? (
        <>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              type="button"
              onClick={editExisting}
              disabled={uploading || !token}
              className="admin-btn admin-btn-ghost"
              style={{ padding: '4px 12px', fontSize: 12 }}
            >
              Redaktə et
            </button>
            <button
              type="button"
              onClick={pick}
              disabled={uploading || !token}
              className="admin-btn admin-btn-ghost"
              style={{ padding: '4px 12px', fontSize: 12 }}
            >
              Dəyiş
            </button>
            <button
              type="button"
              onClick={clear}
              className="admin-btn admin-btn-ghost"
              style={{ padding: '4px 10px', fontSize: 11 }}
            >
              Sil
            </button>
          </div>
          <button
            type="button"
            onClick={editExisting}
            className="admin-form-preview admin-image-thumb"
            title="Redaktə et"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="preview" />
            <span className="admin-image-thumb-hint">Redaktə et</span>
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={pick}
          disabled={uploading || !token}
          className="admin-btn admin-btn-ghost"
          style={{ padding: '6px 14px', fontSize: 12 }}
        >
          Şəkil seç
        </button>
      )}

      {hint && (
        <div style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 4 }}>{hint}</div>
      )}
      {error && <div className="admin-form-error">{error}</div>}

      {editSrc && (
        <ImageCropModal
          src={editSrc}
          crossOrigin={editRemote}
          busy={uploading}
          onCancel={closeEditor}
          onApply={handleApply}
          onReplace={pick}
        />
      )}
    </div>
  );
}
