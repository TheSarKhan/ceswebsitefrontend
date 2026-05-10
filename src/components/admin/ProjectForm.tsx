'use client';

import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminAuth, adminFetch } from '@/lib/admin-auth';
import { ApiError } from '@/lib/api';
import type { ProjectDto } from '@/lib/types';
import { TranslationsBlock, type LangCode } from './TranslationsBlock';
import { ImageUploadField } from './ImageUploadField';
import { useToast } from './ToastProvider';

type Translations = Record<LangCode, Record<string, string>>;

const EMPTY_TR: Translations = {
  az: { title: '', category: '', meta: '' },
  ru: { title: '', category: '', meta: '' },
  en: { title: '', category: '', meta: '' },
};

type Props = {
  initial?: ProjectDto;
  onSaved: () => void;
  onCancel: () => void;
};

export function ProjectForm({ initial, onSaved, onCancel }: Props) {
  const isEdit = !!initial;
  const { token, logout } = useAdminAuth();
  const qc = useQueryClient();
  const toast = useToast();

  const [year, setYear] = useState(initial?.year ?? '');
  const [image, setImage] = useState(initial?.image ?? '');
  const [sortOrder, setSortOrder] = useState<number>(initial?.sortOrder ?? 0);
  const [isPublished, setIsPublished] = useState<boolean>(true);
  const [tr, setTr] = useState<Translations>(() => {
    if (!initial) return EMPTY_TR;
    return {
      az: {
        title: initial.translations?.az?.title ?? '',
        category: initial.translations?.az?.category ?? '',
        meta: initial.translations?.az?.meta ?? '',
      },
      ru: {
        title: initial.translations?.ru?.title ?? '',
        category: initial.translations?.ru?.category ?? '',
        meta: initial.translations?.ru?.meta ?? '',
      },
      en: {
        title: initial.translations?.en?.title ?? '',
        category: initial.translations?.en?.category ?? '',
        meta: initial.translations?.en?.meta ?? '',
      },
    };
  });
  const [error, setError] = useState<string | null>(null);

  const mutate = useMutation({
    mutationFn: () => {
      const path = isEdit ? `/api/v1/admin/projects/${initial!.slug}` : '/api/v1/admin/projects';
      const body = JSON.stringify({
        year: year || null,
        image: image || null,
        sortOrder,
        isPublished,
        translations: {
          az: { title: tr.az.title, category: tr.az.category || null, meta: tr.az.meta || null },
          ru: { title: tr.ru.title, category: tr.ru.category || null, meta: tr.ru.meta || null },
          en: { title: tr.en.title, category: tr.en.category || null, meta: tr.en.meta || null },
        },
      });
      return adminFetch<ProjectDto>(path, token, { method: isEdit ? 'PUT' : 'POST', body }, logout);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'projects'] });
      toast.success(isEdit ? 'Layihə yeniləndi' : 'Layihə yaradıldı');
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
        <label>İl</label>
        <input value={year} onChange={(e) => setYear(e.target.value)} maxLength={16} placeholder="2024" />
      </div>

      <ImageUploadField
        value={image}
        onChange={setImage}
        folder="projects"
        label="Əsas şəkil"
      />

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
          { name: 'title', label: 'Layihə adı', required: true, maxLength: 256 },
          { name: 'category', label: 'Kateqoriya', maxLength: 128 },
          { name: 'meta', label: 'Meta (məs. 12 ay · 15 kran)', maxLength: 256 },
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
