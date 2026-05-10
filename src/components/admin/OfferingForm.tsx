'use client';

import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminAuth, adminFetch } from '@/lib/admin-auth';
import { ApiError } from '@/lib/api';
import type { OfferingDto } from '@/lib/types';
import { TranslationsBlock, type LangCode } from './TranslationsBlock';
import { useToast } from './ToastProvider';

type Translations = Record<LangCode, Record<string, string>>;

const EMPTY_TR: Translations = {
  az: { eyebrow: '', title: '', description: '' },
  ru: { eyebrow: '', title: '', description: '' },
  en: { eyebrow: '', title: '', description: '' },
};

type Props = {
  initial?: OfferingDto;
  onSaved: () => void;
  onCancel: () => void;
};

export function OfferingForm({ initial, onSaved, onCancel }: Props) {
  const isEdit = !!initial;
  const { token, logout } = useAdminAuth();
  const qc = useQueryClient();
  const toast = useToast();

  const [icon, setIcon] = useState(initial?.icon ?? '');
  const [sortOrder, setSortOrder] = useState<number>(initial?.sortOrder ?? 0);
  const [isPublished, setIsPublished] = useState<boolean>(true);
  const [tr, setTr] = useState<Translations>(() => {
    if (!initial) return EMPTY_TR;
    return {
      az: {
        eyebrow: initial.translations?.az?.eyebrow ?? '',
        title: initial.translations?.az?.title ?? '',
        description: initial.translations?.az?.description ?? '',
      },
      ru: {
        eyebrow: initial.translations?.ru?.eyebrow ?? '',
        title: initial.translations?.ru?.title ?? '',
        description: initial.translations?.ru?.description ?? '',
      },
      en: {
        eyebrow: initial.translations?.en?.eyebrow ?? '',
        title: initial.translations?.en?.title ?? '',
        description: initial.translations?.en?.description ?? '',
      },
    };
  });
  const [error, setError] = useState<string | null>(null);

  const mutate = useMutation({
    mutationFn: () => {
      const path = isEdit ? `/api/v1/admin/offerings/${initial!.slug}` : '/api/v1/admin/offerings';
      const body = JSON.stringify({
        icon: icon || null,
        sortOrder,
        isPublished,
        translations: {
          az: { eyebrow: tr.az.eyebrow || null, title: tr.az.title, description: tr.az.description || null },
          ru: { eyebrow: tr.ru.eyebrow || null, title: tr.ru.title, description: tr.ru.description || null },
          en: { eyebrow: tr.en.eyebrow || null, title: tr.en.title, description: tr.en.description || null },
        },
      });
      return adminFetch<OfferingDto>(path, token, { method: isEdit ? 'PUT' : 'POST', body }, logout);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'offerings'] });
      toast.success(isEdit ? 'Xidmət yeniləndi' : 'Xidmət yaradıldı');
      onSaved();
    },
    onError: (e) => {
      const msg = e instanceof ApiError ? `Server xətası (${e.status}).` : 'Şəbəkə xətası.';
      setError(msg);
      toast.error(msg);
    },
  });

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    mutate.mutate();
  }

  return (
    <form onSubmit={onSubmit} className="admin-form">
      <div className="admin-field">
        <label>Icon (sayt komponentindən)</label>
        <input value={icon} onChange={(e) => setIcon(e.target.value)} maxLength={64} placeholder="tools / truck / operator" />
      </div>
      <div className="admin-field">
        <label>Sıra</label>
        <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
      </div>
      <div className="admin-field admin-field-row">
        <label>
          <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />{' '}
          Saytda görünsün
        </label>
      </div>

      <TranslationsBlock
        values={tr}
        onChange={(lang, field, value) =>
          setTr((prev) => ({ ...prev, [lang]: { ...prev[lang], [field]: value } }))
        }
        fields={[
          { name: 'eyebrow', label: 'Eyebrow (məs. 01 / Xidmət)', maxLength: 64 },
          { name: 'title', label: 'Başlıq', required: true, maxLength: 256 },
          { name: 'description', label: 'Təsvir', type: 'textarea', maxLength: 1024 },
        ]}
      />

      {error && <div className="admin-form-error">{error}</div>}

      <div className="admin-form-actions">
        <button type="button" className="admin-btn admin-btn-ghost" onClick={onCancel}>Imtina</button>
        <button type="submit" className="admin-btn admin-btn-primary" disabled={mutate.isPending}>
          {mutate.isPending ? 'Yadda saxlanılır…' : isEdit ? 'Yadda saxla' : 'Yarat'}
        </button>
      </div>
    </form>
  );
}
