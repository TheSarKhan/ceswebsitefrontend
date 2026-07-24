'use client';

import { useState } from 'react';

export type LangCode = 'az' | 'ru' | 'en';

const LANGS: { code: LangCode; label: string }[] = [
  { code: 'az', label: 'AZ' },
  { code: 'ru', label: 'RU' },
  { code: 'en', label: 'EN' },
];

export type FieldDef = {
  name: string;
  label: string;
  type?: 'text' | 'textarea';
  maxLength?: number;
  required?: boolean;
  placeholder?: string;
  /** visible rows for a textarea (taller = more room for long text) */
  rows?: number;
  /** small helper line under the label */
  hint?: string;
};

type Values = Record<LangCode, Record<string, string>>;

type Props = {
  values: Values;
  onChange: (lang: LangCode, field: string, value: string) => void;
  fields: FieldDef[];
  /** Optional heading rendered above the tabs ("Tərcümə" by default). */
  title?: string;
};

/**
 * AZ / RU / EN tabs over a small form. Each form is identical — the {@code
 * fields} list defines the schema and the parent owns the {@link Values}.
 */
export function TranslationsBlock({
  values,
  onChange,
  fields,
  title = 'Tərcümələr',
}: Props) {
  const [active, setActive] = useState<LangCode>('az');
  return (
    <div className="admin-i18n">
      <div className="admin-i18n-head">
        <span className="admin-i18n-title">{title}</span>
        <div className="admin-i18n-tabs">
          {LANGS.map((l) => (
            <button
              key={l.code}
              type="button"
              className={'admin-i18n-tab ' + (active === l.code ? 'active' : '')}
              onClick={() => setActive(l.code)}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
      <div className="admin-i18n-body">
        {fields.map((f) => {
          const id = `${active}-${f.name}`;
          const value = values[active]?.[f.name] ?? '';
          return (
            <div className="admin-field" key={id}>
              <label htmlFor={id}>
                {f.label}
                {f.required && <span style={{ color: 'var(--gold)' }}> *</span>}
              </label>
              {f.hint && (
                <div style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: -2, marginBottom: 2 }}>
                  {f.hint}
                </div>
              )}
              {f.type === 'textarea' ? (
                <textarea
                  id={id}
                  value={value}
                  onChange={(e) => onChange(active, f.name, e.target.value)}
                  maxLength={f.maxLength}
                  required={f.required}
                  placeholder={f.placeholder}
                  rows={f.rows}
                  style={f.rows ? { minHeight: f.rows * 22 } : undefined}
                />
              ) : (
                <input
                  id={id}
                  type="text"
                  value={value}
                  onChange={(e) => onChange(active, f.name, e.target.value)}
                  maxLength={f.maxLength}
                  required={f.required}
                  placeholder={f.placeholder}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
