'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Icon } from './icons';
import { Reveal } from './motion';
import { apiFetch, ApiError } from '@/lib/api';
import { useOrder } from '@/contexts/OrderContext';
import { useFleetCategories } from '@/lib/hooks';
import { useLang } from '@/lib/lang';
import { pickTr } from '@/lib/types';

const OTHER_OPTION = 'Digər';

type FormState = {
  name: string;
  company: string;
  phone: string;
  email: string;
  equipmentType: string;
  duration: string;
  message: string;
};

const EMPTY: FormState = {
  name: '',
  company: '',
  phone: '',
  email: '',
  equipmentType: '',
  duration: '1 gün',
  message: '',
};

type Status = 'idle' | 'submitting' | 'success' | 'error';
type RequestMode = 'order' | 'inquiry';

const INQUIRY_MARKER = 'Ümumi sorğu';

export function Contact() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [mode, setMode] = useState<RequestMode>('order');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { selectedOrder, setSelectedOrder } = useOrder();
  const { lang } = useLang();
  const { data: fleetCategories } = useFleetCategories();

  // Localized category names for the equipment-type dropdown — fully dynamic
  // so new admin categories appear here automatically.
  const categoryNames = useMemo(() => {
    const names = (fleetCategories ?? [])
      .map((c) => pickTr(c.translations, lang)?.name)
      .filter((n): n is string => !!n);
    return Array.from(new Set(names));
  }, [fleetCategories, lang]);

  // A fleet-card "Sifariş et" click drops the item's name + category here —
  // prefill the message field and pre-select the matching equipment type so the
  // sales team knows exactly what the lead is asking about.
  useEffect(() => {
    if (!selectedOrder) return;
    const matchedType =
      selectedOrder.category && categoryNames.includes(selectedOrder.category)
        ? selectedOrder.category
        : OTHER_OPTION;
    setMode('order');
    setForm((prev) => ({
      ...prev,
      equipmentType: matchedType,
      message: `Sifariş etmək istədiyim texnika: ${selectedOrder.name}`,
    }));
    setSelectedOrder(null);
  }, [selectedOrder, setSelectedOrder, categoryNames]);

  const update = <K extends keyof FormState>(key: K) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage(null);
    try {
      const isOrder = mode === 'order';
      await apiFetch('/api/v1/public/quote', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          email: form.email || null,
          phone: form.phone,
          company: form.company || null,
          equipmentType: isOrder ? form.equipmentType || null : INQUIRY_MARKER,
          duration: isOrder ? form.duration || null : null,
          location: null,
          message: form.message || null,
        }),
      });
      setStatus('success');
      setForm(EMPTY);
    } catch (err) {
      setStatus('error');
      if (err instanceof ApiError) {
        setErrorMessage(`Server xətası (${err.status}). Yenidən cəhd edin.`);
      } else {
        setErrorMessage('Şəbəkə xətası. Yenidən cəhd edin.');
      }
    }
  }

  return (
    <section id="contact" className="contact section-pad">
      <div className="container">
        <Reveal className="section-head">
          <h2>Əlaqəyə keçin</h2>
        </Reveal>

        <Reveal className="contact-grid" delay={0.05}>
          <div className="contact-info">
            <h2>
              Texnika <span className="gold">lazımdır?</span>
            </h2>
            <p>
              Layihənizin tələblərini bizə bildirin — mütəxəssislərimiz ehtiyacınıza
              uyğun texnika variantlarını seçib fərdi qiymət təklifi hazırlayacaq.
              Peşəkar komandamız planlaşdırmadan tədarükə qədər hər mərhələdə etibarlı
              dəstək göstərir.
            </p>

            <div className="channel">
              <span className="lbl" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6.6 10.8a15.5 15.5 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.24 11.4 11.4 0 0 0 3.6.58 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .58 3.6 1 1 0 0 1-.24 1z" />
                </svg>
              </span>
              <a className="val gold" href="tel:+994506829080">
                +994 50 682 90 80
              </a>
            </div>
            <div className="channel">
              <span className="lbl" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
              </span>
              <a className="val" href="mailto:sales@ces.com.az">
                sales@ces.com.az
              </a>
            </div>
            <div className="channel">
              <span className="lbl" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 21s-7-5.2-7-11a7 7 0 0 1 14 0c0 5.8-7 11-7 11z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>
              </span>
              <span className="val">Bakı, Azərbaycan</span>
            </div>
          </div>

          <form className="contact-form" onSubmit={onSubmit}>
            <div className="request-toggle" role="tablist" aria-label="Sorğu növü">
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'order'}
                className={mode === 'order' ? 'active' : ''}
                onClick={() => setMode('order')}
              >
                Texnika sifarişi
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'inquiry'}
                className={mode === 'inquiry' ? 'active' : ''}
                onClick={() => setMode('inquiry')}
              >
                Ümumi sorğu / mesaj
              </button>
            </div>

            <div className="form-grid">
              <div className="form-field">
                <label>Ad, Soyad</label>
                <input
                  type="text"
                  placeholder="Adınız"
                  required
                  value={form.name}
                  onChange={update('name')}
                />
              </div>
              <div className="form-field">
                <label>Şirkət</label>
                <input
                  type="text"
                  placeholder="Şirkət adı"
                  value={form.company}
                  onChange={update('company')}
                />
              </div>
              <div className="form-field">
                <label>Telefon *</label>
                <input
                  type="tel"
                  placeholder="+994 __ ___ __ __"
                  required
                  value={form.phone}
                  onChange={update('phone')}
                />
              </div>
              <div className="form-field">
                <label>E-poçt</label>
                <input
                  type="email"
                  placeholder="ad@misal.com"
                  value={form.email}
                  onChange={update('email')}
                />
              </div>
              {mode === 'order' && (
                <>
                  <div className="form-field">
                    <label>Texnika növü</label>
                    <select value={form.equipmentType} onChange={update('equipmentType')}>
                      <option value="">Seçin</option>
                      {categoryNames.map((name) => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                      <option value={OTHER_OPTION}>{OTHER_OPTION}</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label>İcarə müddəti</label>
                    <select value={form.duration} onChange={update('duration')}>
                      <option>1 gün</option>
                      <option>3-7 gün</option>
                      <option>1 ay</option>
                      <option>3+ ay</option>
                    </select>
                  </div>
                </>
              )}
              <div className="form-field full">
                <label>{mode === 'order' ? 'Layihə təfərrüatları' : 'Mesajınız *'}</label>
                <textarea
                  placeholder={
                    mode === 'order'
                      ? 'Obyekt ünvanı, iş növü, başlama tarixi və s.'
                      : 'Sualınızı və ya mesajınızı yazın…'
                  }
                  required={mode === 'inquiry'}
                  value={form.message}
                  onChange={update('message')}
                ></textarea>
              </div>

              {status === 'success' && (
                <div
                  className="form-field full"
                  style={{
                    color: 'var(--gold)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                  }}
                >
                  ▸ Sorğu qəbul edildi. Dispetçer ən qısa zamanda əlaqə saxlayacaq.
                </div>
              )}
              {status === 'error' && errorMessage && (
                <div
                  className="form-field full"
                  style={{
                    color: '#E2664B',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    letterSpacing: '0.1em',
                  }}
                >
                  ▸ {errorMessage}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary form-submit"
                disabled={status === 'submitting'}
              >
                {status === 'submitting'
                  ? 'Göndərilir…'
                  : mode === 'order'
                    ? 'Sifarişi göndər'
                    : 'Mesajı göndər'}
                <Icon name="arrow-right" size={14} stroke={2.5} />
              </button>
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
