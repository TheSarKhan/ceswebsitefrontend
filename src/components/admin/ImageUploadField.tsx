'use client';

import { useEffect, useRef, useState, type ChangeEvent } from 'react';
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

const ROTATABLE = /^image\/(jpeg|png|webp)$/;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Şəkil oxunmadı'));
    img.src = src;
  });
}

// Bake the chosen rotation into the bytes we upload, so what the admin previews
// is exactly what gets stored. Non-raster types (svg/gif) are sent untouched.
async function rotatedBlob(file: File, deg: number): Promise<Blob> {
  if (deg % 360 === 0 || !ROTATABLE.test(file.type)) return file;
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const swap = deg % 180 !== 0;
    const canvas = document.createElement('canvas');
    canvas.width = swap ? img.naturalHeight : img.naturalWidth;
    canvas.height = swap ? img.naturalWidth : img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((deg * Math.PI) / 180);
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Şəkil emal olunmadı'))),
        file.type,
        0.92,
      ),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

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

  // A picked-but-not-yet-uploaded file. While this is set, we show the review
  // panel instead of committing the raw file straight to the server.
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0); // 0 | 90 | 180 | 270

  // Revoke the object URL when it changes or the component unmounts.
  useEffect(() => {
    return () => {
      if (pendingUrl) URL.revokeObjectURL(pendingUrl);
    };
  }, [pendingUrl]);

  const canRotate = !!pendingFile && ROTATABLE.test(pendingFile.type);

  function pick() {
    fileInput.current?.click();
  }

  function onPick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // Allow re-picking the same file next time.
    if (fileInput.current) fileInput.current.value = '';
    if (!file) return;
    setError(null);
    if (pendingUrl) URL.revokeObjectURL(pendingUrl);
    setPendingFile(file);
    setPendingUrl(URL.createObjectURL(file));
    setRotation(0);
  }

  function rotateLeft() {
    setRotation((r) => (r + 270) % 360);
  }
  function rotateRight() {
    setRotation((r) => (r + 90) % 360);
  }

  function cancelPending() {
    if (pendingUrl) URL.revokeObjectURL(pendingUrl);
    setPendingFile(null);
    setPendingUrl(null);
    setRotation(0);
    setError(null);
  }

  async function confirmUpload() {
    if (!pendingFile) return;
    setUploading(true);
    setError(null);
    try {
      const blob = await rotatedBlob(pendingFile, rotation);
      const fd = new FormData();
      fd.append('file', blob, pendingFile.name || 'image');
      fd.append('folder', folder);
      const res = await adminFetch<UploadResponse>(
        '/api/v1/admin/uploads',
        token,
        { method: 'POST', body: fd },
        logout,
      );
      onChange(res.url);
      cancelPending();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Yükləmə xətası');
    } finally {
      setUploading(false);
    }
  }

  function clear() {
    onChange('');
    cancelPending();
  }

  return (
    <div className="admin-field">
      <label>
        {label}
        {required && <span style={{ color: 'var(--gold)' }}> *</span>}
      </label>

      {/* Hidden native input — triggered from the buttons below. */}
      <input
        ref={fileInput}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        onChange={onPick}
        disabled={uploading || !token}
        style={{ display: 'none' }}
      />

      {/* REVIEW STATE — a file is picked but not uploaded yet. */}
      {pendingUrl ? (
        <div className="admin-image-editor">
          <div
            className="admin-form-preview admin-image-editor-stage"
            aria-label="Önizləmə"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pendingUrl}
              alt="önizləmə"
              style={{ transform: `rotate(${rotation}deg)` }}
            />
          </div>

          <div className="admin-image-editor-tools">
            <button
              type="button"
              onClick={rotateLeft}
              disabled={!canRotate || uploading}
              className="admin-btn admin-btn-ghost"
              style={{ padding: '4px 10px', fontSize: 12 }}
              title="Sola fırlat"
            >
              ↺ Sola
            </button>
            <button
              type="button"
              onClick={rotateRight}
              disabled={!canRotate || uploading}
              className="admin-btn admin-btn-ghost"
              style={{ padding: '4px 10px', fontSize: 12 }}
              title="Sağa fırlat"
            >
              ↻ Sağa
            </button>
            <button
              type="button"
              onClick={pick}
              disabled={uploading}
              className="admin-btn admin-btn-ghost"
              style={{ padding: '4px 10px', fontSize: 12 }}
            >
              Dəyiş
            </button>
            <button
              type="button"
              onClick={confirmUpload}
              disabled={uploading || !token}
              className="admin-btn"
              style={{ padding: '4px 12px', fontSize: 12 }}
            >
              {uploading ? 'Yüklənir…' : 'Təsdiqlə və yüklə'}
            </button>
            <button
              type="button"
              onClick={cancelPending}
              disabled={uploading}
              className="admin-btn admin-btn-ghost"
              style={{ padding: '4px 10px', fontSize: 12 }}
            >
              Ləğv et
            </button>
          </div>
          {!canRotate && (
            <div style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 4 }}>
              Bu formatda fırlatma yoxdur — sadəcə təsdiqləyin.
            </div>
          )}
        </div>
      ) : value ? (
        /* COMMITTED STATE — an image is saved; allow replace or remove. */
        <>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
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
          <div className="admin-form-preview">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="preview" />
          </div>
        </>
      ) : (
        /* EMPTY STATE — nothing selected yet. */
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
    </div>
  );
}
