'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type Props = {
  src: string;
  /** existing remote images need crossOrigin so the canvas can be exported */
  crossOrigin?: boolean;
  /** crop aspect ratio width/height — defaults to the 4:3 card frame */
  aspect?: number;
  title?: string;
  busy?: boolean;
  onCancel: () => void;
  onApply: (blob: Blob) => void;
  onReplace?: () => void;
};

const OUT_W = 1200;
const BG = '#e7e9ec';

/**
 * LinkedIn-style photo editor in a popup: drag to reposition, zoom slider /
 * mouse wheel, 90° rotate, then Apply. The visible crop frame IS the output —
 * the image is cover-fitted so there's never empty space, and the result is a
 * clean 4:3 JPEG matching the public card frame.
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
  const OUT_H = Math.round(OUT_W / aspect);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const offset = useRef({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number } | null>(null);

  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1); // multiplier >= 1
  const [rot, setRot] = useState(0); // 0 | 90 | 180 | 270

  const coverScale = useCallback(
    (rotation: number) => {
      const img = imgRef.current;
      if (!img) return 1;
      const swap = rotation % 180 !== 0;
      const w = swap ? img.naturalHeight : img.naturalWidth;
      const h = swap ? img.naturalWidth : img.naturalHeight;
      return Math.max(OUT_W / w, OUT_H / h);
    },
    [OUT_H],
  );

  const clampPan = useCallback(
    (rotation: number, z: number) => {
      const img = imgRef.current;
      if (!img) return;
      const scale = coverScale(rotation) * z;
      const swap = rotation % 180 !== 0;
      const drawnW = (swap ? img.naturalHeight : img.naturalWidth) * scale;
      const drawnH = (swap ? img.naturalWidth : img.naturalHeight) * scale;
      const maxX = Math.max(0, (drawnW - OUT_W) / 2);
      const maxY = Math.max(0, (drawnH - OUT_H) / 2);
      offset.current.x = Math.max(-maxX, Math.min(maxX, offset.current.x));
      offset.current.y = Math.max(-maxY, Math.min(maxY, offset.current.y));
    },
    [OUT_H, coverScale],
  );

  const paint = useCallback(
    (ctx: CanvasRenderingContext2D, grid: boolean) => {
      const img = imgRef.current;
      if (!img) return;
      const scale = coverScale(rot) * zoom;
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, OUT_W, OUT_H);
      ctx.save();
      ctx.translate(OUT_W / 2 + offset.current.x, OUT_H / 2 + offset.current.y);
      ctx.rotate((rot * Math.PI) / 180);
      ctx.scale(scale, scale);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
      ctx.restore();
      if (grid) {
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 1;
        for (let i = 1; i < 3; i++) {
          const x = (OUT_W * i) / 3;
          const y = (OUT_H * i) / 3;
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, OUT_H);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(OUT_W, y);
          ctx.stroke();
        }
      }
    },
    [OUT_H, coverScale, rot, zoom],
  );

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) paint(ctx, true);
  }, [paint]);

  // Load image (reset transform on new src).
  useEffect(() => {
    setReady(false);
    setError(null);
    const img = new Image();
    if (crossOrigin) img.crossOrigin = 'anonymous';
    img.onload = () => {
      imgRef.current = img;
      offset.current = { x: 0, y: 0 };
      setZoom(1);
      setRot(0);
      setReady(true);
    };
    img.onerror = () => setError('Şəkil yüklənmədi.');
    img.src = src;
  }, [src, crossOrigin]);

  useEffect(() => {
    if (ready) {
      clampPan(rot, zoom);
      draw();
    }
  }, [ready, rot, zoom, clampPan, draw]);

  // Lock body scroll + Escape to close while the modal is open.
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

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!ready) return;
    drag.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drag.current || !canvasRef.current) return;
    const ratio = OUT_W / canvasRef.current.getBoundingClientRect().width;
    offset.current.x += (e.clientX - drag.current.x) * ratio;
    offset.current.y += (e.clientY - drag.current.y) * ratio;
    drag.current = { x: e.clientX, y: e.clientY };
    clampPan(rot, zoom);
    draw();
  }
  function endDrag() {
    drag.current = null;
  }
  function onWheel(e: React.WheelEvent<HTMLCanvasElement>) {
    setZoom((z) => Math.min(4, Math.max(1, z - e.deltaY * 0.0015)));
  }

  function apply() {
    const img = imgRef.current;
    if (!img) return;
    const out = document.createElement('canvas');
    out.width = OUT_W;
    out.height = OUT_H;
    const ctx = out.getContext('2d');
    if (!ctx) return;
    try {
      paint(ctx, false); // no grid in the exported image
      out.toBlob(
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
      <div className="admin-modal" role="dialog" aria-modal="true" aria-label={title}>
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
          {error ? (
            <div className="admin-form-error">{error}</div>
          ) : (
            <canvas
              ref={canvasRef}
              width={OUT_W}
              height={OUT_H}
              className="admin-crop-canvas"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerLeave={endDrag}
              onWheel={onWheel}
            />
          )}
        </div>

        <div className="admin-crop-controls">
          <button
            type="button"
            className="admin-btn admin-btn-ghost admin-crop-icon"
            onClick={() => setRot((r) => (r + 270) % 360)}
            disabled={busy || !ready}
            title="Sola fırlat"
          >
            ↺
          </button>
          <input
            type="range"
            min={1}
            max={4}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            disabled={busy || !ready}
            className="admin-crop-zoom"
            aria-label="Yaxınlaşdır"
          />
          <button
            type="button"
            className="admin-btn admin-btn-ghost admin-crop-icon"
            onClick={() => setRot((r) => (r + 90) % 360)}
            disabled={busy || !ready}
            title="Sağa fırlat"
          >
            ↻
          </button>
        </div>

        <div className="admin-modal-foot">
          {onReplace && (
            <button
              type="button"
              className="admin-btn admin-btn-ghost"
              onClick={onReplace}
              disabled={busy}
            >
              Başqa şəkil
            </button>
          )}
          <div className="admin-modal-foot-spacer" />
          <button
            type="button"
            className="admin-btn admin-btn-ghost"
            onClick={onCancel}
            disabled={busy}
          >
            Ləğv et
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={apply}
            disabled={busy || !ready}
          >
            {busy ? 'Yüklənir…' : 'Tətbiq et'}
          </button>
        </div>
      </div>
    </div>
  );
}
