'use client';

import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAdminAuth, adminFetch } from '@/lib/admin-auth';
import { ApiError } from '@/lib/api';
import { pickTr, type FleetItemDto, type FleetSubcategoryDto, type SpecEntry } from '@/lib/types';
import { TranslationsBlock, type LangCode } from './TranslationsBlock';
import { ImageUploadField } from './ImageUploadField';
import { SpecsEditor } from './SpecsEditor';
import { useToast } from './ToastProvider';

type Translations = Record<LangCode, Record<string, string>>;

const EMPTY_TR: Translations = {
  az: { name: '', description: '', badge: '' },
  ru: { name: '', description: '', badge: '' },
  en: { name: '', description: '', badge: '' },
};

type Props = {
  initial?: FleetItemDto;
  /** Prefill parent subcategory when creating (ignored in edit mode). */
  defaultSubcategorySlug?: string;
  onSaved: () => void;
  onCancel: () => void;
};

export function FleetItemForm({
  initial,
  defaultSubcategorySlug,
  onSaved,
  onCancel,
}: Props) {
  const isEdit = !!initial;
  const { token, logout } = useAdminAuth();
  const qc = useQueryClient();
  const toast = useToast();

  // Subcategory list for the parent dropdown.
  const { data: subcategories } = useQuery({
    queryKey: ['admin', 'fleet', 'subcategories'],
    queryFn: () =>
      adminFetch<FleetSubcategoryDto[]>('/api/v1/admin/fleet/subcategories', token, {}, logout),
    enabled: !!token,
  });

  const [subcategorySlug, setSubcategorySlug] = useState(
    initial?.subcategory.slug ?? defaultSubcategorySlug ?? '',
  );
  const [modelNumber, setModelNumber] = useState(initial?.modelNumber ?? '');
  const [image, setImage] = useState(initial?.image ?? '');
  const [price, setPrice] = useState(initial?.price ?? '');
  const [priceUnit, setPriceUnit] = useState(initial?.priceUnit ?? 'day');
  const [sortOrder, setSortOrder] = useState<number>(initial?.sortOrder ?? 0);
  const [isPublished, setIsPublished] = useState<boolean>(
    initial?.isPublished ?? true,
  );
  const [tr, setTr] = useState<Translations>(() => {
    if (!initial) return EMPTY_TR;
    return {
      az: {
        name: initial.translations?.az?.name ?? '',
        description: initial.translations?.az?.description ?? '',
        badge: initial.translations?.az?.badge ?? '',
      },
      ru: {
        name: initial.translations?.ru?.name ?? '',
        description: initial.translations?.ru?.description ?? '',
        badge: initial.translations?.ru?.badge ?? '',
      },
      en: {
        name: initial.translations?.en?.name ?? '',
        description: initial.translations?.en?.description ?? '',
        badge: initial.translations?.en?.badge ?? '',
      },
    };
  });
  const [specs, setSpecs] = useState<SpecEntry[]>(initial?.specs ?? []);
  const [error, setError] = useState<string | null>(null);

  const mutate = useMutation({
    mutationFn: () => {
      const path = isEdit ? `/api/v1/admin/fleet/items/${initial!.slug}` : '/api/v1/admin/fleet/items';
      const body = JSON.stringify({
        subcategorySlug,
        modelNumber: modelNumber || null,
        image: image || null,
        price: price || null,
        priceUnit: priceUnit || null,
        sortOrder,
        isPublished,
        translations: {
          az: { name: tr.az.name, description: tr.az.description || null, badge: tr.az.badge || null },
          ru: { name: tr.ru.name, description: tr.ru.description || null, badge: tr.ru.badge || null },
          en: { name: tr.en.name, description: tr.en.description || null, badge: tr.en.badge || null },
        },
        specs,
      });
      return adminFetch<FleetItemDto>(path, token, { method: isEdit ? 'PUT' : 'POST', body }, logout);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'fleet', 'items'] });
      toast.success(isEdit ? 'Texnika yeniləndi' : 'Texnika yaradıldı');
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
    <form onSubmit={onSubmit} className="admin-form" style={{ maxWidth: 880 }}>
      <div className="admin-field">
        <label>Ana alt-kateqoriya *</label>
        <select
          value={subcategorySlug}
          onChange={(e) => setSubcategorySlug(e.target.value)}
          required
        >
          <option value="">— seç —</option>
          {(subcategories ?? []).map((s) => {
            const subName = pickTr(s.translations, 'AZ')?.name ?? s.slug;
            const catName = pickTr(s.category.translations, 'AZ')?.name ?? s.category.slug;
            return (
              <option key={s.slug} value={s.slug}>
                {catName} → {subName}
              </option>
            );
          })}
        </select>
      </div>

      <div className="admin-field">
        <label>Model nömrəsi</label>
        <input
          value={modelNumber}
          onChange={(e) => setModelNumber(e.target.value)}
          maxLength={128}
          placeholder="LTM 1040-2.1"
        />
      </div>

      <ImageUploadField
        value={image}
        onChange={setImage}
        folder="fleet"
        label="Texnika şəkli"
      />

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <div className="admin-field">
          <label>Qiymət (məs. 1400 ₼)</label>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            maxLength={64}
            placeholder="1400 ₼"
          />
        </div>
        <div className="admin-field">
          <label>Vahid</label>
          <select value={priceUnit} onChange={(e) => setPriceUnit(e.target.value)}>
            <option value="">—</option>
            <option value="hour">hour / saat / час</option>
            <option value="day">day / gün / день</option>
            <option value="week">week / həftə / неделя</option>
            <option value="month">month / ay / месяц</option>
          </select>
        </div>
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
        title="Texnika tərcümələri"
        values={tr}
        onChange={(lang, field, value) =>
          setTr((prev) => ({ ...prev, [lang]: { ...prev[lang], [field]: value } }))
        }
        fields={[
          { name: 'name', label: 'Ad', required: true, maxLength: 256 },
          { name: 'description', label: 'Təsvir', type: 'textarea', maxLength: 1024 },
          { name: 'badge', label: 'Badge (məs. POPULYAR SEÇİM)', maxLength: 64 },
        ]}
      />

      <SpecsEditor value={specs} onChange={setSpecs} />

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
