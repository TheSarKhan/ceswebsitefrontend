'use client';

import { useState } from 'react';

export function TexnikaGallery({ images, alt }: { images: string[]; alt: string }) {
  const list = images.filter(Boolean);
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);

  if (list.length === 0) {
    return <div className="tx-gallery-main tx-gallery-empty" aria-hidden="true" />;
  }

  const current = list[Math.min(active, list.length - 1)];

  return (
    <div className="tx-gallery">
      <button
        type="button"
        className="tx-gallery-main"
        onClick={() => setZoom(true)}
        aria-label={alt}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={current} alt={alt} />
      </button>

      {list.length > 1 && (
        <div className="tx-gallery-thumbs">
          {list.map((src, i) => (
            <button
              key={src + i}
              type="button"
              className={'tx-gallery-thumb' + (i === active ? ' is-active' : '')}
              onClick={() => setActive(i)}
              aria-label={`${alt} ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" />
            </button>
          ))}
        </div>
      )}

      {zoom && (
        <div className="tx-lightbox" onClick={() => setZoom(false)} role="dialog" aria-modal="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={current} alt={alt} />
          <button type="button" className="tx-lightbox-x" aria-label="×">×</button>
        </div>
      )}
    </div>
  );
}
