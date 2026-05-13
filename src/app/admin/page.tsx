'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAdminAuth, adminFetch } from '@/lib/admin-auth';
import type {
  DashboardStats,
  RecentSubmission,
  TrendPoint,
} from '@/lib/types';

type Window = 7 | 30;

export default function AdminDashboard() {
  const { token, user, logout } = useAdminAuth();
  const [window, setWindow] = useState<Window>(7);

  const stats = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () =>
      adminFetch<DashboardStats>('/api/v1/admin/stats', token, {}, logout),
    enabled: !!token,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const d = stats.data;
  const messages = d?.submissions.quote;
  const newMessages = messages?.newCount ?? 0;
  const totalMessages = messages?.total ?? 0;

  const windowedTrend = useMemo(() => {
    if (!d?.trend) return [];
    return d.trend.slice(-window);
  }, [d?.trend, window]);

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <h1>Dashboard</h1>
          <p className="admin-page-sub">Xoş gəldin, {user?.name}.</p>
        </div>
      </header>

      {stats.isLoading && <div className="admin-loading">Yüklənir…</div>}
      {stats.isError && (
        <div className="admin-form-error">Statistikalar yüklənmədi.</div>
      )}

      {d && (
        <>
          {/* ============ HERO KPIs ============ */}
          <div className="dash-kpis">
            <KpiCard
              tone={newMessages > 0 ? 'gold' : undefined}
              label="Yeni mesaj"
              value={newMessages}
              href="/admin/quote-submissions"
            />
            <KpiCard
              label="Texnika"
              value={d.totals.fleetItems}
              href="/admin/fleet"
            />
            <KpiCard
              label="Layihə"
              value={d.totals.projects}
              href="/admin/projects"
            />
            <KpiCard
              label="Müştəri"
              value={d.totals.clients}
              href="/admin/clients"
            />
          </div>

          {/* ============ TREND ============ */}
          <section className="dash-panel">
            <header className="dash-panel-head">
              <div>
                <h2>Mesaj trendi</h2>
                <p className="dash-panel-sub">
                  Son {window} gün · cəmi{' '}
                  {windowedTrend.reduce((sum, p) => sum + p.quote, 0)} mesaj
                </p>
              </div>
              <div className="dash-segmented">
                <button
                  className={'dash-seg' + (window === 7 ? ' is-active' : '')}
                  onClick={() => setWindow(7)}
                >
                  7 gün
                </button>
                <button
                  className={'dash-seg' + (window === 30 ? ' is-active' : '')}
                  onClick={() => setWindow(30)}
                >
                  30 gün
                </button>
              </div>
            </header>
            <TrendChart points={windowedTrend} />
          </section>

          {/* ============ 2-COL BODY ============ */}
          <div className="dash-grid">
            <section className="dash-panel">
              <header className="dash-panel-head">
                <h2>Son mesajlar</h2>
                <Link
                  href="/admin/quote-submissions"
                  className="admin-fleet-link-btn"
                >
                  Hamısı →
                </Link>
              </header>
              <RecentList items={d.recent} />
            </section>

            <div className="dash-side">
              <section className="dash-panel">
                <header className="dash-panel-head">
                  <h2>Tez əməliyyatlar</h2>
                </header>
                <div className="dash-quick">
                  <QuickAction href="/admin/fleet" label="Texnika" />
                  <QuickAction href="/admin/projects" label="Layihə" />
                  <QuickAction href="/admin/testimonials" label="Rəy" />
                  <QuickAction href="/admin/clients" label="Müştəri" />
                  <QuickAction href="/admin/offerings" label="Xidmət" />
                  <QuickAction href="/admin/faqs" label="Sual-cavab" />
                </div>
              </section>

              <section className="dash-panel">
                <header className="dash-panel-head">
                  <h2>Yaddaş</h2>
                </header>
                <div className="dash-system">
                  <Row
                    k="Rejim"
                    v={d.storage.mode === 's3' ? 'S3 / R2 (uzaq)' : 'Lokal disk'}
                  />
                  <Row
                    k="Fayl sayı"
                    v={
                      d.storage.mode === 'local' ? d.storage.fileCount : '—'
                    }
                  />
                  <Row
                    k="Ölçü"
                    v={
                      d.storage.mode === 'local'
                        ? formatBytes(d.storage.totalBytes)
                        : '—'
                    }
                  />
                  <Row k="Mesaj (cəmi)" v={totalMessages} />
                  <Row k="Cavablanmış" v={messages?.replied ?? 0} />
                </div>
              </section>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* -------------------- KPI card -------------------- */

function KpiCard({
  label,
  value,
  hint,
  href,
  tone,
}: {
  label: string;
  value: number | string;
  hint?: string;
  href: string;
  tone?: 'gold';
}) {
  return (
    <Link
      href={href}
      className={'dash-kpi' + (tone === 'gold' ? ' is-gold' : '')}
    >
      <div className="dash-kpi-value">{value}</div>
      <div className="dash-kpi-label">{label}</div>
      {hint && <div className="dash-kpi-hint">{hint}</div>}
    </Link>
  );
}

/* -------------------- Trend chart (SVG) -------------------- */

function TrendChart({ points }: { points: TrendPoint[] }) {
  if (!points.length) return null;

  const W = 800;
  const H = 160;
  const PAD_X = 8;
  const PAD_TOP = 14;
  const PAD_BOT = 22;
  // Public site only collects quote messages (contact form was removed),
  // so the bars represent quote counts in gold — no need for stacking.
  const max = Math.max(1, ...points.map((p) => Math.max(p.quote, 1)));
  const barSlot = (W - PAD_X * 2) / points.length;
  const barW = Math.max(2, Math.min(20, barSlot * 0.7));

  const fmtDay = (iso: string) => {
    const d = new Date(iso + 'T00:00:00Z');
    return `${d.getUTCDate()}.${d.getUTCMonth() + 1}`;
  };

  const showLabelEvery = points.length > 14 ? 5 : points.length > 7 ? 2 : 1;

  return (
    <div className="dash-trend">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="dash-trend-svg"
      >
        {/* gridline */}
        <line
          x1={PAD_X}
          x2={W - PAD_X}
          y1={H - PAD_BOT}
          y2={H - PAD_BOT}
          stroke="currentColor"
          strokeOpacity="0.15"
        />
        {points.map((p, i) => {
          const x = PAD_X + i * barSlot + (barSlot - barW) / 2;
          const usableH = H - PAD_TOP - PAD_BOT;
          const barH = (p.quote / max) * usableH;
          const y = H - PAD_BOT - barH;
          return (
            <g key={p.day}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={barH}
                className="dash-bar-contact"
              />
              {p.quote > 0 && (
                <title>
                  {fmtDay(p.day)} — {p.quote} mesaj
                </title>
              )}
              {i % showLabelEvery === 0 && (
                <text
                  x={x + barW / 2}
                  y={H - 6}
                  textAnchor="middle"
                  className="dash-bar-label"
                >
                  {fmtDay(p.day)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* -------------------- Recent submissions list -------------------- */

function RecentList({ items }: { items: RecentSubmission[] }) {
  if (!items.length) {
    return (
      <div className="admin-table-empty" style={{ padding: 32 }}>
        Hələ sorğu yoxdur
      </div>
    );
  }
  return (
    <ul className="dash-feed">
      {items.map((s) => {
        const href =
          s.kind === 'contact'
            ? `/admin/contact-submissions/${s.id}`
            : `/admin/quote-submissions/${s.id}`;
        return (
          <li key={`${s.kind}-${s.id}`}>
            <Link href={href} className="dash-feed-row">
              <span
                className={'dash-feed-kind dash-feed-kind-' + s.kind}
                title={s.kind === 'contact' ? 'Əlaqə formu' : 'Qiymət təklifi'}
              >
                {s.kind === 'contact' ? 'ƏLQ' : 'QYM'}
              </span>
              <div className="dash-feed-body">
                <div className="dash-feed-line">
                  <strong>{s.name}</strong>
                  <span className="dash-feed-phone mono">{s.phone}</span>
                </div>
                {s.summary && (
                  <div className="dash-feed-sub">{s.summary}</div>
                )}
              </div>
              <div className="dash-feed-meta">
                <span
                  className={
                    'dash-status dash-status-' +
                    (s.status?.toLowerCase() ?? 'new')
                  }
                >
                  {statusLabel(s.status)}
                </span>
                <span className="dash-feed-time">{timeAgo(s.createdAt)}</span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/* -------------------- Right rail bits -------------------- */

function QuickAction({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="dash-quick-btn">
      <span className="dash-quick-plus">+</span>
      <span>{label}</span>
    </Link>
  );
}

function Row({ k, v }: { k: string; v: string | number }) {
  return (
    <div className="dash-kv">
      <span className="dash-kv-k">{k}</span>
      <span className="dash-kv-v">{v}</span>
    </div>
  );
}

/* -------------------- helpers -------------------- */

function statusLabel(s: RecentSubmission['status']): string {
  switch (s) {
    case 'NEW':
      return 'YENİ';
    case 'SEEN':
      return 'BAXILDI';
    case 'REPLIED':
      return 'CAVABLANDI';
    case 'SPAM':
      return 'SPAM';
    default:
      return '—';
  }
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60_000);
  if (m < 1) return 'indi';
  if (m < 60) return m + ' dəq';
  const h = Math.floor(m / 60);
  if (h < 24) return h + ' saat';
  const d = Math.floor(h / 24);
  if (d < 7) return d + ' gün';
  const w = Math.floor(d / 7);
  if (w < 5) return w + ' həftə';
  const mo = Math.floor(d / 30);
  return mo + ' ay';
}

function formatBytes(n: number): string {
  if (n < 1024) return n + ' B';
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
  if (n < 1024 * 1024 * 1024) return (n / 1024 / 1024).toFixed(1) + ' MB';
  return (n / 1024 / 1024 / 1024).toFixed(2) + ' GB';
}
