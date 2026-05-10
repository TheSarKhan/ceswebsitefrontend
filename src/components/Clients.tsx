'use client';

import { useClients } from '@/lib/hooks';

export function Clients() {
  const { data, isError } = useClients();
  const clients = isError ? [] : (data ?? []);

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
        <div className="clients-grid">
          {clients.map((c) => (
            <div key={c.id} className="client-cell">
              <div className="client-logo-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.logo}
                  alt={c.name}
                  style={{
                    maxWidth: '70%',
                    maxHeight: '50px',
                    opacity: 0.6,
                    filter: 'grayscale(1) brightness(2)',
                    transition: 'all 0.3s ease',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
