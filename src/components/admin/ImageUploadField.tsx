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

function loadImage(src: string, crossOrigin = false): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (crossOrigin) img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Şəkil oxunmadı'));
    img.src = src;
  });
}

// Draw the image rotated and export the requested MIME type. Throws a
// SecurityError if the source canvas is cross-origin-tainted.
async function canvasRotate(
  img: HTMLImageElement,
  deg: number,
  type: string,
): Promise<Blob> {
  const swap = deg % 180 !== 0;
  const canvas = document.createElement('canvas');
  canvas.width = swap ? img.naturalHeight : img.naturalWidth;
  canvas.height = swap ? img.naturalWidth : img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Kətan yaradılmadı');
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((deg * Math.PI) / 180);
  ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Şəkil emal olunmadı'))),
      type,
      0.92,
    ),
  );
}

function typeFromUrl(url: string): string {
  if (/\.png(\?|$)/i.test(url)) return 'image/png';
  if (/\.webp(\?|$)/i.test(url)) return 'image/webp';
  return 'image/jpeg';
}

function filenameFromUrl(url: string): string {
  try {
    const path = new URL(url, 'http://x').pathname;
    return path.split('/').pop() || 'image';
  } catch {
    return 'image';
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

  // A newly picked file (not yet uploaded).
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null); // object URL
  // True when editing the already-saved `value` in place (no new file yet).
  const [editingExisting, setEditingExisting] = useState(false);
  const [rotation, setRotation] = useState(0); // 0 | 90 | 180 | 270

  // Revoke the object URL when it changes / unmounts.
  useEffect(() => {
    return () => {
      if (pendingUrl) URL.revokeObjectURL(pendingUrl);
    };
  }, [pendingUrl]);

  const editorOpen = editingExisting || !!pendingFile;
  const previewSrc = pendingFile ? pendingUrl : editingExisting ? value : null;

  const canRotate = pendingFile
    ? ROTATABLE.test(pendingFile.type)
    : editingExisting
      ? !/\.svg(\?|$)/i.test(value ?? '')
      : false;

  function pick() {
    fileInput.current?.click();
  }

  function onPick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (fileInput.current) fileInput.current.value = ''; // allow re-picking same file
    if (!file) return;
    setError(null);
    if (pendingUrl) URL.revokeObjectURL(pendingUrl);
    setEditingExisting(false);
    setPendingFile(file);
    setPendingUrl(URL.createObjectURL(file));
    setRotation(0);
  }

  // Open the editor on the currently-saved image (LinkedIn-style: click the
  // photo to preview it big and rotate/replace it).
  function editExisting() {
    if (!value) return;
    setError(null);
    if (pendingUrl) URL.revokeObjectURL(pendingUrl);
    setPendingFile(null);
    setPendingUrl(null);
    setEditingExisting(true);
    setRotation(0);
  }

  function rotateLeft() {
    setRotation((r) => (r + 270) % 360);
  }
  function rotateRight() {
    setRotation((r) => (r + 90) % 360);
  }

  function closeEditor() {
    if (pendingUrl) URL.revokeObjectURL(pendingUrl);
    setPendingFile(null);
    setPendingUrl(null);
    setEditingExisting(false);
    setRotation(0);
    setError(null);
  }

  async function confirm() {
    setError(null);
    try {
      let blob: Blob | null = null;
      let filename = 'image';

      if (pendingFile) {
        blob =
          rotation % 360 === 0 || !ROTATABLE.test(pendingFile.type)
            ? pendingFile
            : await canvasRotate(
                await loadImage(pendingUrl!),
                rotation,
                pendingFile.type,
              );
        filename = pendingFile.name || 'image';
      } else if (editingExisting && value) {
        // Nothing changed on the saved image — just close.
        if (rotation % 360 === 0) {
          closeEditor();
          return;
        }
        const img = await loadImage(value, true); // crossOrigin for canvas export
        blob = await canvasRotate(img, rotation, typeFromUrl(value));
        filename = filenameFromUrl(value);
      }

      if (!blob) {
        closeEditor();
        return;
      }

      setUploading(true);
      const fd = new FormData();
      fd.append('file', blob, filename);
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
      // Most likely a cross-origin tainted canvas when rotating an existing
      // image in a split-origin dev setup. Replacing with a new file still works.
      const taint =
        editingExisting && rotation % 360 !== 0 && !pendingFile;
      setError(
        taint
          ? 'Mövcud şəkli fırlada bilmədik (fərqli origin). “Dəyiş” ilə yeni şəkil yükləyin.'
          : err instanceof Error
            ? err.message
            : 'Yükləmə xətası',
      );
    } finally {
      setUploading(false);
    }
  }

  function clear() {
    onChange('');
    closeEditor();
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

      {editorOpen ? (
        /* EDITOR — reviewing a new pick OR the existing image. */
        <div className="admin-image-editor">
          <div
            className="admin-form-preview admin-image-editor-stage"
            aria-label="Önizləmə"
          >
            {previewSrc && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewSrc}
                alt="önizləmə"
                style={{ transform: `rotate(${rotation}deg)` }}
              />
            )}
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
              onClick={confirm}
              disabled={uploading || !token}
              className="admin-btn"
              style={{ padding: '4px 12px', fontSize: 12 }}
            >
              {uploading
                ? 'Yüklənir…'
                : editingExisting && !pendingFile
                  ? 'Yadda saxla'
                  : 'Təsdiqlə və yüklə'}
            </button>
            <button
              type="button"
              onClick={closeEditor}
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
        /* COMMITTED — click the image (LinkedIn-style) to preview/edit it. */
        <>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              type="button"
              onClick={editExisting}
              disabled={uploading || !token}
              className="admin-btn admin-btn-ghost"
              style={{ padding: '4px 12px', fontSize: 12 }}
            >
              Önizlə / Redaktə et
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
            title="Önizlə / Redaktə et"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="preview" />
            <span className="admin-image-thumb-hint">Redaktə et</span>
          </button>
        </>
      ) : (
        /* EMPTY */
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
