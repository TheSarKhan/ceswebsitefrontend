'use client';

import { StaggerGroup, StaggerItem } from './motion';

export function Stats() {
  const items = [
    { id: '01', val: '120', sym: '+', lbl: 'Texnika vahidi' },
    { id: '02', val: '850', sym: '+', lbl: 'Tamamlanmış layihə' },
    { id: '03', val: '6', sym: 'il', lbl: 'Bazarda təcrübə' },
    { id: '04', val: '98', sym: '%', lbl: 'Vaxtında çatdırılma' },
  ];
  return (
    <section className="stats">
      <StaggerGroup className="stats-grid" stagger={0.1}>
        {items.map((s) => (
          <StaggerItem key={s.id} className="stat-cell">
            <div className="id">▸ {s.id}</div>
            <div className="big">
              {s.val}
              <span className="sym">{s.sym}</span>
            </div>
            <div className="lbl">{s.lbl}</div>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
