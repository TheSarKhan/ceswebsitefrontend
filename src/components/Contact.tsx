'use client';

import { useState, type FormEvent } from 'react';
import { Icon } from './icons';
import { Reveal } from './motion';
import { apiFetch, ApiError } from '@/lib/api';

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
  equipmentType: 'Avtokran',
  duration: '1 gün',
  message: '',
};

type Status = 'idle' | 'submitting' | 'success' | 'error';

export function Contact() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const update = <K extends keyof FormState>(key: K) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage(null);
    try {
      await apiFetch('/api/v1/public/quote', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          email: form.email || null,
          phone: form.phone,
          company: form.company || null,
          equipmentType: form.equipmentType || null,
          duration: form.duration || null,
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
          <h2>
            Sifariş et.
            <br />
            <span className="stroke">İş başlasın.</span>
          </h2>
          <div className="meta">
            Cavab vaxtı
            <br />≤ 30 dəqiqə
          </div>
        </Reveal>

        <Reveal className="contact-grid" delay={0.05}>
          <div className="contact-info">
            <h2>
              Texnika <span className="gold">lazımdır?</span>
            </h2>
            <p>
              Bir zəng — bir saatlıq cavab. Layihənizin tələbini bildirin, size uyğun
              texnika variantlarını və qiymət təklifini 30 dəqiqə ərzində göndərək.
            </p>

            <div className="channel">
              <span className="lbl">Tel.</span>
              <a className="val gold" href="tel:+994506829080">
                +994 50 682 90 80
              </a>
            </div>
            <div className="channel">
              <span className="lbl">E-poçt</span>
              <a className="val" href="mailto:sales@ces.com.az">
                sales@ces.com.az
              </a>
            </div>
            <div className="channel">
              <span className="lbl">Ünvan</span>
              <span className="val">Bakı, Azərbaycan</span>
            </div>
            <div className="channel">
              <span className="lbl">Saatlar</span>
              <span className="val">24 / 7</span>
            </div>
          </div>

          <form className="contact-form" onSubmit={onSubmit}>
            <h3>▸ Pulsuz qiymət təklifi</h3>
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
              <div className="form-field">
                <label>Texnika növü</label>
                <select value={form.equipmentType} onChange={update('equipmentType')}>
                  <option>Avtokran</option>
                  <option>Forklift</option>
                  <option>Səbət</option>
                  <option>Ekskavator</option>
                  <option>Buldozer</option>
                  <option>Digər / Bilinmir</option>
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
              <div className="form-field full">
                <label>Layihə təfərrüatları</label>
                <textarea
                  placeholder="Obyekt ünvanı, iş növü, başlama tarixi və s."
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
                {status === 'submitting' ? 'Göndərilir…' : 'Sifarişi göndər'}
                <Icon name="arrow-right" size={14} stroke={2.5} />
              </button>
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
