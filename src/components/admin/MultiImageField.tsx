'use client';

import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useAdminAuth, adminFetch } from '@/lib/admin-auth';
import { ImageCropModal } from './ImageCropModal';

type UploadResponse = { key: string; url: string; contentType: string; size: number };

type Props = {
  value: string[];
  onChange: (urls: string[]) => void;
  folder?: 'fleet' | 'projects' | 'testimonials' | 'clients' | 'offerings' | 'misc';
  label?: string;
  hint?: string;
};

/** Multiple-image gallery editor: add via the crop modal, reorder with ‹ ›, remove with ×. */
export function MultiImageField({ value, onChange, folder = 'projects', label = 'Qalereya', hint }: Props) {
  const { token, logout } = useAdminAuth();
  const fileInput = useRef<HTMLInputElement>(null);
  const objectUrl = useRef<string | null>(null);
  const [editSrc, setEditSrc] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => () => { if (objectUrl.current) URL.revokeObjectURL(objectUrl.current); }, []);

  function pick() {
    fileInput.current?.click();
  }
  function onPick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (fileInput.current) fileInput.current.value = '';
    if (!file) return;
    setError(null);
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = URL.createObjectURL(file);
    setEditSrc(objectUrl.current);
  }
  function close() {
    if (objectUrl.current) {
      URL.revokeObjectURL(objectUrl.current);
      objectUrl.current = null;
    }
    setEditSrc(null);
  }
  async function handleApply(blob: Blob) {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('file', blob, 'image.jpg');
      fd.append('folder', folder);
      const res = await adminFetch<UploadResponse>('/api/v1/admin/uploads', token, { method: 'POST', body: fd }, logout);
      onChange([...value, res.url]);
      close();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Yükləmə xətası');
    } finally {
      setUploading(false);
    }
  }
  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  return (
    <div className="admin-field">
      <label>{label}</label>
      {hint && <div style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: -2 }}>{hint}</div>}
      <input
        ref={fileInput}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={onPick}
        disabled={uploading || !token}
        style={{ display: 'none' }}
      />
      <div className="admin-gallery-grid">
        {value.map((url, i) => (
          <div key={url + i} className="admin-gallery-item">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" />
            <div className="admin-gallery-tools">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} title="Sola">‹</button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === value.length - 1} title="Sağa">›</button>
              <button type="button" className="is-danger" onClick={() => remove(i)} title="Sil">×</button>
            </div>
          </div>
        ))}
        <button type="button" className="admin-gallery-add" onClick={pick} disabled={uploading || !token}>
          {uploading ? 'Yüklənir…' : '+ Şəkil'}
        </button>
      </div>
      {error && <div className="admin-form-error">{error}</div>}

      {editSrc && (
        <ImageCropModal
          key={editSrc}
          src={editSrc}
          busy={uploading}
          onCancel={close}
          onApply={handleApply}
          onReplace={pick}
        />
      )}
    </div>
  );
}
