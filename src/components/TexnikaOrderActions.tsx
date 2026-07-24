'use client';

import { useState, type FormEvent } from 'react';
import { apiFetch, ApiError } from '@/lib/api';

type Lang = 'AZ' | 'RU' | 'EN';

const WA_NUMBER = '994506829080';

const L = {
  AZ: {
    order: 'Sifariş et',
    whatsapp: 'WhatsApp ilə sifariş',
    pdf: 'PDF / Çap',
    modalTitle: 'Sifariş',
    name: 'Ad, soyad',
    phone: 'Telefon',
    email: 'E-poçt (istəyə bağlı)',
    company: 'Şirkət (istəyə bağlı)',
    duration: 'İcarə müddəti',
    message: 'Əlavə qeyd',
    submit: 'Göndər',
    sending: 'Göndərilir…',
    cancel: 'Ləğv et',
    success: 'Sorğunuz göndərildi. Tezliklə əlaqə saxlayacağıq.',
    errServer: 'Server xətası. Yenidən cəhd edin.',
    errNet: 'Şəbəkə xətası. Yenidən cəhd edin.',
    waMsg: (n: string) => `Salam, "${n}" texnikasını icarəyə götürmək istəyirəm.`,
  },
  RU: {
    order: 'Заказать',
    whatsapp: 'Заказать через WhatsApp',
    pdf: 'PDF / Печать',
    modalTitle: 'Заявка',
    name: 'Имя, фамилия',
    phone: 'Телефон',
    email: 'E-mail (необязательно)',
    company: 'Компания (необязательно)',
    duration: 'Срок аренды',
    message: 'Дополнительно',
    submit: 'Отправить',
    sending: 'Отправка…',
    cancel: 'Отмена',
    success: 'Заявка отправлена. Мы скоро свяжемся с вами.',
    errServer: 'Ошибка сервера. Попробуйте снова.',
    errNet: 'Ошибка сети. Попробуйте снова.',
    waMsg: (n: string) => `Здравствуйте, хочу арендовать технику «${n}».`,
  },
  EN: {
    order: 'Order now',
    whatsapp: 'Order via WhatsApp',
    pdf: 'PDF / Print',
    modalTitle: 'Request',
    name: 'Full name',
    phone: 'Phone',
    email: 'Email (optional)',
    company: 'Company (optional)',
    duration: 'Rental period',
    message: 'Notes',
    submit: 'Send',
    sending: 'Sending…',
    cancel: 'Cancel',
    success: 'Request sent. We will contact you shortly.',
    errServer: 'Server error. Please try again.',
    errNet: 'Network error. Please try again.',
    waMsg: (n: string) => `Hello, I would like to rent the "${n}" equipment.`,
  },
} as const;

type Status = 'idle' | 'submitting' | 'success' | 'error';

export function TexnikaOrderActions({
  equipmentName,
  lang,
}: {
  equipmentName: string;
  lang: Lang;
}) {
  const t = L[lang];
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    duration: '',
    message: '',
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    setError(null);
    try {
      await apiFetch('/api/v1/public/quote', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          email: form.email || null,
          phone: form.phone,
          company: form.company || null,
          equipmentType: equipmentName,
          duration: form.duration || null,
          location: null,
          message: form.message || null,
        }),
      });
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err instanceof ApiError ? t.errServer : t.errNet);
    }
  }

  const waHref = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(t.waMsg(equipmentName))}`;

  return (
    <div className="tx-actions">
      <button type="button" className="btn btn-primary" onClick={() => { setOpen(true); setStatus('idle'); }}>
        {t.order}
      </button>
      <a className="btn btn-ghost" href={waHref} target="_blank" rel="noopener noreferrer">
        {t.whatsapp}
      </a>
      <button type="button" className="btn btn-ghost tx-print-hide" onClick={() => window.print()}>
        {t.pdf}
      </button>

      {open && (
        <div className="tx-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="tx-modal" role="dialog" aria-modal="true" aria-label={t.modalTitle}>
            <div className="tx-modal-head">
              <h3>{t.modalTitle} — {equipmentName}</h3>
              <button type="button" className="tx-modal-x" onClick={() => setOpen(false)} aria-label="×">×</button>
            </div>
            {status === 'success' ? (
              <div className="tx-modal-success">{t.success}</div>
            ) : (
              <form className="tx-modal-form" onSubmit={submit}>
                <label>
                  {t.name}
                  <input value={form.name} onChange={set('name')} required maxLength={128} />
                </label>
                <label>
                  {t.phone}
                  <input value={form.phone} onChange={set('phone')} required minLength={5} maxLength={64} inputMode="tel" />
                </label>
                <label>
                  {t.email}
                  <input value={form.email} onChange={set('email')} type="email" maxLength={128} />
                </label>
                <label>
                  {t.company}
                  <input value={form.company} onChange={set('company')} maxLength={128} />
                </label>
                <label>
                  {t.duration}
                  <input value={form.duration} onChange={set('duration')} maxLength={32} />
                </label>
                <label>
                  {t.message}
                  <textarea value={form.message} onChange={set('message')} rows={3} maxLength={4096} />
                </label>
                {error && <div className="tx-modal-error">{error}</div>}
                <div className="tx-modal-foot">
                  <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>{t.cancel}</button>
                  <button type="submit" className="btn btn-primary" disabled={status === 'submitting'}>
                    {status === 'submitting' ? t.sending : t.submit}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
