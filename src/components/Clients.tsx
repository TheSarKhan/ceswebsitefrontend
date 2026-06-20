'use client';

import Image from 'next/image';
import { useClients } from '@/lib/hooks';

export function Clients({
  initialClients,
}: {
  initialClients?: import('@/lib/types').ClientDto[];
} = {}) {
  const { data, isError } = useClients(initialClients);
  const clients = isError ? [] : (data ?? []);

  // Duplicate the list so the marquee track can loop seamlessly.
  const loop = clients.length > 0 ? [...clients, ...clients] : [];

  return (
    <section className="section-pad" style={{ background: 'var(--bg-2)' }}>
      <div className="container">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 16,
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div className="eyebrow">▸ Bizə güvənənlər · 80+ korporativ müştəri</div>
          <a
            href="#"
            className="mono"
            style={{
              fontSize: 11,
              color: 'var(--gold)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}
          >
            Hamısına bax →
          </a>
        </div>
      </div>

      {clients.length > 0 && (
        <div className="clients-marquee" aria-label="Müştərilər">
          <div className="clients-track">
            {loop.map((c, i) => (
              <div key={`${c.id}-${i}`} className="client-chip" aria-hidden={i >= clients.length}>
                <Image
                  src={c.logo}
                  alt={c.name}
                  width={240}
                  height={80}
                  sizes="160px"
                  style={{
                    width: 'auto',
                    height: 'auto',
                    maxWidth: '100%',
                    maxHeight: '46px',
                    objectFit: 'contain',
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
