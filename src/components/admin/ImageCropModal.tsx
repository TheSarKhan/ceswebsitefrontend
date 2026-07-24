'use client';

import { useEffect, useRef, useState } from 'react';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';

type Props = {
  src: string;
  /** existing remote images need crossOrigin so the cropped canvas can export */
  crossOrigin?: boolean;
  /** default crop aspect ratio width/height — the 4:3 card frame */
  aspect?: number;
  title?: string;
  busy?: boolean;
  onCancel: () => void;
  onApply: (blob: Blob) => void;
  onReplace?: () => void;
};

const ASPECTS: Array<{ label: string; value: number | 'free' }> = [
  { label: '4:3', value: 4 / 3 },
  { label: '1:1', value: 1 },
  { label: '16:9', value: 16 / 9 },
  { label: 'Sərbəst', value: 'free' },
];

/**
 * Full crop editor in a popup (Cropper.js): a resizable crop box with corner
 * and edge handles over the dimmed image, drag to move, wheel/buttons to zoom,
 * rotate, and switch aspect ratio. Apply exports the crop as a JPEG.
 */
export function ImageCropModal({
  src,
  crossOrigin,
  aspect = 4 / 3,
  title = 'Şəkli redaktə et',
  busy,
  onCancel,
  onApply,
  onReplace,
}: Props) {
  const imgRef = useRef<HTMLImageElement>(null);
  const cropperRef = useRef<Cropper | null>(null);
  const [ratio, setRatio] = useState<number | 'free'>(aspect);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialise Cropper once the <img> is mounted.
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    const cropper = new Cropper(img, {
      viewMode: 1,
      dragMode: 'move',
      aspectRatio: aspect,
      autoCropArea: 1,
      background: true,
      responsive: true,
      checkCrossOrigin: true,
      modal: true,
      guides: true,
      center: true,
      toggleDragModeOnDblclick: false,
      ready: () => setReady(true),
    });
    cropperRef.current = cropper;
    return () => {
      cropper.destroy();
      cropperRef.current = null;
    };
  }, [src, aspect]);

  // Lock body scroll + Escape to close.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onCancel, busy]);

  function chooseAspect(v: number | 'free') {
    setRatio(v);
    cropperRef.current?.setAspectRatio(v === 'free' ? NaN : v);
  }

  function apply() {
    const cropper = cropperRef.current;
    if (!cropper) return;
    try {
      const canvas = cropper.getCroppedCanvas({
        maxWidth: 1600,
        maxHeight: 1600,
        fillColor: '#e7e9ec',
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
      });
      canvas.toBlob(
        (b) => (b ? onApply(b) : setError('Şəkil emal olunmadı.')),
        'image/jpeg',
        0.9,
      );
    } catch {
      setError('Mövcud şəkli fərqli origin səbəbindən emal edə bilmədik. “Başqa şəkil” seçin.');
    }
  }

  return (
    <div
      className="admin-modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) onCancel();
      }}
    >
      <div className="admin-modal admin-modal-wide" role="dialog" aria-modal="true" aria-label={title}>
        <div className="admin-modal-head">
          <h3>{title}</h3>
          <button
            type="button"
            className="admin-modal-x"
            onClick={onCancel}
            disabled={busy}
            aria-label="Bağla"
          >
            ×
          </button>
        </div>

        <div className="admin-crop-stage">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={src}
            alt=""
            crossOrigin={crossOrigin ? 'anonymous' : undefined}
            className="admin-cropper-img"
          />
        </div>

        <div className="admin-crop-controls">
          <div className="admin-crop-aspects">
            {ASPECTS.map((a) => (
              <button
                key={a.label}
                type="button"
                className={'admin-btn admin-btn-ghost admin-chip' + (ratio === a.value ? ' active' : '')}
                onClick={() => chooseAspect(a.value)}
                disabled={busy || !ready}
              >
                {a.label}
              </button>
            ))}
          </div>
          <div className="admin-crop-tools">
            <button type="button" className="admin-btn admin-btn-ghost" onClick={() => cropperRef.current?.rotate(-90)} disabled={busy || !ready}>Sola 90°</button>
            <button type="button" className="admin-btn admin-btn-ghost" onClick={() => cropperRef.current?.rotate(90)} disabled={busy || !ready}>Sağa 90°</button>
            <button type="button" className="admin-btn admin-btn-ghost" onClick={() => cropperRef.current?.zoom(0.1)} disabled={busy || !ready}>Yaxınlaşdır +</button>
            <button type="button" className="admin-btn admin-btn-ghost" onClick={() => cropperRef.current?.zoom(-0.1)} disabled={busy || !ready}>Uzaqlaşdır −</button>
            <button type="button" className="admin-btn admin-btn-ghost" onClick={() => { cropperRef.current?.reset(); chooseAspect(aspect); }} disabled={busy || !ready}>Sıfırla</button>
          </div>
        </div>

        {error && <div className="admin-form-error" style={{ margin: '0 18px' }}>{error}</div>}

        <div className="admin-modal-foot">
          {onReplace && (
            <button type="button" className="admin-btn admin-btn-ghost" onClick={onReplace} disabled={busy}>
              Başqa şəkil
            </button>
          )}
          <div className="admin-modal-foot-spacer" />
          <button type="button" className="admin-btn admin-btn-ghost" onClick={onCancel} disabled={busy}>
            Ləğv et
          </button>
          <button type="button" className="admin-btn admin-btn-primary" onClick={apply} disabled={busy || !ready}>
            {busy ? 'Yüklənir…' : 'Tətbiq et'}
          </button>
        </div>
      </div>
    </div>
  );
}
