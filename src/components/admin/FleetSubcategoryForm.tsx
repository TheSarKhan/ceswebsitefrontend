'use client';

import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAdminAuth, adminFetch } from '@/lib/admin-auth';
import { ApiError } from '@/lib/api';
import { pickTr, type FleetCategoryDto, type FleetSubcategoryDto } from '@/lib/types';
import { TranslationsBlock, type LangCode } from './TranslationsBlock';
import { useToast } from './ToastProvider';

type Translations = Record<LangCode, Record<string, string>>;

const EMPTY_TR: Translations = {
  az: { name: '' },
  ru: { name: '' },
  en: { name: '' },
};

type Props = {
  initial?: FleetSubcategoryDto;
  onSaved: () => void;
  onCancel: () => void;
};

export function FleetSubcategoryForm({ initial, onSaved, onCancel }: Props) {
  const isEdit = !!initial;
  const { token, logout } = useAdminAuth();
  const qc = useQueryClient();
  const toast = useToast();

  // Need the category list to populate the parent dropdown.
  const { data: categories } = useQuery({
    queryKey: ['admin', 'fleet', 'categories'],
    queryFn: () =>
      adminFetch<FleetCategoryDto[]>('/api/v1/admin/fleet/categories', token, {}, logout),
    enabled: !!token,
  });

  const [categorySlug, setCategorySlug] = useState(initial?.category.slug ?? '');
  const [sortOrder, setSortOrder] = useState<number>(initial?.sortOrder ?? 0);
  const [isPublished, setIsPublished] = useState<boolean>(true);
  const [tr, setTr] = useState<Translations>(() => {
    if (!initial) return EMPTY_TR;
    return {
      az: { name: initial.translations?.az?.name ?? '' },
      ru: { name: initial.translations?.ru?.name ?? '' },
      en: { name: initial.translations?.en?.name ?? '' },
    };
  });
  const [error, setError] = useState<string | null>(null);

  const mutate = useMutation({
    mutationFn: () => {
      const path = isEdit
        ? `/api/v1/admin/fleet/subcategories/${initial!.slug}`
        : '/api/v1/admin/fleet/subcategories';
      const body = JSON.stringify({
        categorySlug,
        sortOrder,
        isPublished,
        translations: {
          az: { name: tr.az.name },
          ru: { name: tr.ru.name },
          en: { name: tr.en.name },
        },
      });
      return adminFetch<FleetSubcategoryDto>(
        path,
        token,
        { method: isEdit ? 'PUT' : 'POST', body },
        logout,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'fleet', 'subcategories'] });
      qc.invalidateQueries({ queryKey: ['admin', 'fleet', 'categories'] });
      toast.success(isEdit ? 'Alt-kateqoriya yeniləndi' : 'Alt-kateqoriya yaradıldı');
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
        <label>Ana kateqoriya *</label>
        <select
          value={categorySlug}
          onChange={(e) => setCategorySlug(e.target.value)}
          required
        >
          <option value="">— seç —</option>
          {(categories ?? []).map((c) => (
            <option key={c.slug} value={c.slug}>
              {pickTr(c.translations, 'AZ')?.name ?? c.slug} ({c.slug})
            </option>
          ))}
        </select>
      </div>

      <div className="admin-field">
        <label>Sıra</label>
        <input
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(Number(e.target.value))}
        />
      </div>

      <div className="admin-field admin-field-row">
        <label>
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />{' '}
          Saytda görünsün
        </label>
      </div>

      <TranslationsBlock
        values={tr}
        onChange={(lang, field, value) =>
          setTr((prev) => ({ ...prev, [lang]: { ...prev[lang], [field]: value } }))
        }
        fields={[{ name: 'name', label: 'Ad', required: true, maxLength: 128 }]}
      />

      {error && <div className="admin-form-error">{error}</div>}

      <div className="admin-form-actions">
        <button type="button" className="admin-btn admin-btn-ghost" onClick={onCancel}>
          Imtina
        </button>
        <button type="submit" className="admin-btn admin-btn-primary" disabled={mutate.isPending}>
          {mutate.isPending ? 'Yadda saxlanılır…' : isEdit ? 'Yadda saxla' : 'Yarat'}
        </button>
      </div>
    </form>
  );
}
