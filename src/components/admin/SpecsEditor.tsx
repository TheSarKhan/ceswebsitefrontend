'use client';

import type { SpecEntry } from '@/lib/types';
import type { LangCode } from './TranslationsBlock';

const LANGS: LangCode[] = ['az', 'ru', 'en'];

type Props = {
  value: SpecEntry[];
  onChange: (next: SpecEntry[]) => void;
};

/**
 * Edits the {@code specs} JSONB array on a fleet item. Each row holds an
 * i18n key (e.g. "Maks. yük qaldırma" / "Макс. грузоподъемность") and an
 * i18n value (e.g. "40 t" / "40 т"). Order is preserved verbatim.
 */
export function SpecsEditor({ value, onChange }: Props) {
  function addRow() {
    onChange([
      ...value,
      { key: { az: '', ru: '', en: '' }, value: { az: '', ru: '', en: '' } },
    ]);
  }

  function removeRow(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function moveRow(index: number, dir: -1 | 1) {
    const j = index + dir;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[index], next[j]] = [next[j], next[index]];
    onChange(next);
  }

  function updateCell(
    index: number,
    side: 'key' | 'value',
    lang: LangCode,
    text: string,
  ) {
    const next = [...value];
    const row = next[index];
    next[index] = {
      ...row,
      [side]: { ...(row[side] ?? {}), [lang]: text },
    };
    onChange(next);
  }

  return (
    <div className="specs-editor">
      <div className="specs-editor-head">
        <div>
          <span className="admin-i18n-title">Parametrlər</span>
          <span className="specs-editor-hint">Açar → Dəyər cütləri, hər biri 3 dilə</span>
        </div>
        <button type="button" className="admin-btn admin-btn-ghost" onClick={addRow}>
          + Sətir əlavə et
        </button>
      </div>

      {value.length === 0 && (
        <div className="specs-editor-empty">Hələ parametr yoxdur — sətir əlavə edin.</div>
      )}

      <div className="specs-editor-rows">
        {value.map((row, i) => (
          <div className="specs-row" key={i}>
            <div className="specs-row-num">#{String(i + 1).padStart(2, '0')}</div>
            <div className="specs-row-grid">
              {LANGS.map((lang) => (
                <div className="specs-row-lang" key={lang}>
                  <span className="specs-row-lang-tag">{lang.toUpperCase()}</span>
                  <input
                    type="text"
                    placeholder="Açar"
                    value={row.key?.[lang] ?? ''}
                    onChange={(e) => updateCell(i, 'key', lang, e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Dəyər"
                    value={row.value?.[lang] ?? ''}
                    onChange={(e) => updateCell(i, 'value', lang, e.target.value)}
                  />
                </div>
              ))}
            </div>
            <div className="specs-row-actions">
              <button
                type="button"
                className="specs-row-btn"
                onClick={() => moveRow(i, -1)}
                disabled={i === 0}
                title="Yuxarı"
              >
                ↑
              </button>
              <button
                type="button"
                className="specs-row-btn"
                onClick={() => moveRow(i, 1)}
                disabled={i === value.length - 1}
                title="Aşağı"
              >
                ↓
              </button>
              <button
                type="button"
                className="specs-row-btn specs-row-btn-danger"
                onClick={() => removeRow(i)}
                title="Sil"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
