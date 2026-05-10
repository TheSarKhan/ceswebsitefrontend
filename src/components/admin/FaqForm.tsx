'use client';

import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminAuth, adminFetch } from '@/lib/admin-auth';
import { ApiError } from '@/lib/api';
import type { FaqDto } from '@/lib/types';
import { TranslationsBlock, type LangCode } from './TranslationsBlock';
import { useToast } from './ToastProvider';

type Translations = Record<LangCode, Record<string, string>>;

const EMPTY_TR: Translations = {
  az: { question: '', answer: '' },
  ru: { question: '', answer: '' },
  en: { question: '', answer: '' },
};

type Props = {
  initial?: FaqDto;
  onSaved: () => void;
  onCancel: () => void;
};

export function FaqForm({ initial, onSaved, onCancel }: Props) {
  const isEdit = !!initial;
  const { token, logout } = useAdminAuth();
  const qc = useQueryClient();
  const toast = useToast();

  const [sortOrder, setSortOrder] = useState<number>(initial?.sortOrder ?? 0);
  const [isPublished, setIsPublished] = useState<boolean>(true);
  const [tr, setTr] = useState<Translations>(() => {
    if (!initial) return EMPTY_TR;
    return {
      az: { question: initial.translations?.az?.question ?? '', answer: initial.translations?.az?.answer ?? '' },
      ru: { question: initial.translations?.ru?.question ?? '', answer: initial.translations?.ru?.answer ?? '' },
      en: { question: initial.translations?.en?.question ?? '', answer: initial.translations?.en?.answer ?? '' },
    };
  });
  const [error, setError] = useState<string | null>(null);

  const mutate = useMutation({
    mutationFn: () => {
      const path = isEdit ? `/api/v1/admin/faqs/${initial!.id}` : '/api/v1/admin/faqs';
      const body = JSON.stringify({
        sortOrder,
        isPublished,
        translations: {
          az: { question: tr.az.question, answer: tr.az.answer },
          ru: { question: tr.ru.question, answer: tr.ru.answer },
          en: { question: tr.en.question, answer: tr.en.answer },
        },
      });
      return adminFetch<FaqDto>(path, token, { method: isEdit ? 'PUT' : 'POST', body }, logout);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'faqs'] });
      toast.success(isEdit ? 'FAQ yeniləndi' : 'FAQ yaradıldı');
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
          { name: 'question', label: 'Sual', required: true, maxLength: 512 },
          { name: 'answer', label: 'Cavab', type: 'textarea', required: true, maxLength: 4096 },
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
