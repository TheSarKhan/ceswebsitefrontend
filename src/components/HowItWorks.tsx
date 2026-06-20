'use client';

import { Reveal, StaggerGroup, StaggerItem } from './motion';

export function HowItWorks() {
  const steps = [
    {
      n: '01',
      tag: 'ZƏNG / FORMA',
      t: 'Sifariş',
      d: 'Telefon, WhatsApp və ya saytdakı forma vasitəsilə tələbinizi göndərin. Texnika növü və obyekt ünvanı kifayətdir.',
    },
    {
      n: '02',
      tag: '30 DƏQ İÇİNDƏ',
      t: 'Təklif',
      d: 'Dispetçer 30 dəqiqə ərzində size mövcud variantları, qiyməti və çatdırılma vaxtını təqdim edir.',
    },
    {
      n: '03',
      tag: 'RAZILAŞMA',
      t: 'Müqavilə',
      d: 'Sadə müqavilə, çevik ödəniş şərtləri. Sığorta və operator avtomatik daxildir.',
    },
    {
      n: '04',
      tag: 'OBYEKTDƏ',
      t: 'İş başlayır',
      d: 'Texnika operatorla birlikdə vaxtında obyektdə olur. Dispetçerimiz proses boyu əlaqədə qalır.',
    },
  ];
  return (
    <section id="how" className="section-pad">
      <div className="container">
        <Reveal className="section-head">
          <h2>
            Necə işləyir.
            <br />
            <span className="stroke">Dörd addım.</span>
          </h2>
          <div className="meta">
            Sifarişdən obyektə
            <br />
            orta 4-6 saat
          </div>
        </Reveal>

        <StaggerGroup className="how-grid">
          {steps.map((s) => (
            <StaggerItem key={s.n} className="how-step">
              <span className="corner-tag">▸ {s.tag}</span>
              <div className="step-num">{s.n}</div>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
