'use client';

import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminAuth, adminFetch } from '@/lib/admin-auth';
import { ApiError } from '@/lib/api';
import type { TestimonialDto } from '@/lib/types';
import { TranslationsBlock, type LangCode } from './TranslationsBlock';
import { ImageUploadField } from './ImageUploadField';
import { useToast } from './ToastProvider';

type Translations = Record<LangCode, Record<string, string>>;

const EMPTY_TR: Translations = {
  az: { role: '', quote: '' },
  ru: { role: '', quote: '' },
  en: { role: '', quote: '' },
};

type Props = {
  initial?: TestimonialDto;
  onSaved: () => void;
  onCancel: () => void;
};

export function TestimonialForm({ initial, onSaved, onCancel }: Props) {
  const isEdit = !!initial;
  const { token, logout } = useAdminAuth();
  const qc = useQueryClient();
  const toast = useToast();

  const [name, setName] = useState(initial?.name ?? '');
  const [initials, setInitials] = useState(initial?.initials ?? '');
  const [company, setCompany] = useState(initial?.company ?? '');
  const [avatar, setAvatar] = useState(initial?.avatar ?? '');
  const [sortOrder, setSortOrder] = useState<number>(initial?.sortOrder ?? 0);
  const [isPublished, setIsPublished] = useState<boolean>(true);
  const [tr, setTr] = useState<Translations>(() => {
    if (!initial) return EMPTY_TR;
    return {
      az: { role: initial.translations?.az?.role ?? '', quote: initial.translations?.az?.quote ?? '' },
      ru: { role: initial.translations?.ru?.role ?? '', quote: initial.translations?.ru?.quote ?? '' },
      en: { role: initial.translations?.en?.role ?? '', quote: initial.translations?.en?.quote ?? '' },
    };
  });
  const [error, setError] = useState<string | null>(null);

  const mutate = useMutation({
    mutationFn: () => {
      const path = isEdit
        ? `/api/v1/admin/testimonials/${initial!.id}`
        : '/api/v1/admin/testimonials';
      const body = JSON.stringify({
        name,
        initials: initials || null,
        company: company || null,
        avatar: avatar || null,
        sortOrder,
        isPublished,
        translations: {
          az: { role: tr.az.role || null, quote: tr.az.quote },
          ru: { role: tr.ru.role || null, quote: tr.ru.quote },
          en: { role: tr.en.role || null, quote: tr.en.quote },
        },
      });
      return adminFetch<TestimonialDto>(path, token, { method: isEdit ? 'PUT' : 'POST', body }, logout);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'testimonials'] });
      toast.success(isEdit ? 'Rəy yeniləndi' : 'Rəy yaradıldı');
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
        <label>Ad, Soyad *</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={128} />
      </div>

      <div className="admin-field">
        <label>İnisiallar (avatar əvəzinə göstərilir)</label>
        <input value={initials} onChange={(e) => setInitials(e.target.value)} maxLength={8} placeholder="Rİ" />
      </div>

      <div className="admin-field">
        <label>Şirkət</label>
        <input value={company} onChange={(e) => setCompany(e.target.value)} maxLength={128} />
      </div>

      <ImageUploadField
        value={avatar}
        onChange={setAvatar}
        folder="testimonials"
        label="Avatar (istəyə görə)"
        hint="İnisiallar boş qoyulsa avatar şəkili göstərilir."
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
          { name: 'role', label: 'Vəzifə / şirkət', maxLength: 256 },
          { name: 'quote', label: 'Sitat', type: 'textarea', required: true, maxLength: 2048 },
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
