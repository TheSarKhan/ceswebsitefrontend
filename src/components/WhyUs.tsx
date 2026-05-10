'use client';

import { Icon } from './icons';
import { useLang } from '@/lib/lang';
import { TRANSLATIONS } from '@/lib/translations';
import { Reveal, StaggerGroup, StaggerItem } from './motion';

export function WhyUs() {
  const { lang } = useLang();
  const t = TRANSLATIONS[lang];
  const items = [
    {
      id: '01',
      icon: 'lightning',
      t: { AZ: 'Operativ Çatdırılma', RU: 'Оперативная Доставка', EN: 'Swift Delivery' }[lang],
      d: {
        AZ: 'Sifarişlərin ən qısa müddətdə təyin olunmuş ünvana çatdırılması təmin edilir. Texnika bazamızın çevikliyi layihələrinizin sürətinə zəmanət verir.',
        RU: 'Доставка заказов в кратчайшие сроки. Гибкость нашей базы гарантирует скорость вашего проекта.',
        EN: 'Ensuring delivery of orders to the designated address in the shortest time. The agility of our equipment base guarantees project speed.',
      }[lang],
    },
    {
      id: '02',
      icon: 'shield',
      t: { AZ: 'Sığortalı Texnika Bazası', RU: 'Застрахованная База', EN: 'Insured Equipment Base' }[lang],
      d: {
        AZ: 'Bütün texnikalarımız tam sığortalanmışdır. Baş verə biləcək texniki hadisələr zamanı müştəri heç bir maliyyə məsuliyyəti daşımır.',
        RU: 'Вся наша техника полностью застрахована. Клиент не несет финансовой ответственности при технических инцидентах.',
        EN: 'All our equipment is fully insured. Customers bear no financial responsibility during technical incidents.',
      }[lang],
    },
    {
      id: '03',
      icon: 'operator',
      t: { AZ: 'Peşəkar Operator Heyəti', RU: 'Профессиональные Операторы', EN: 'Professional Operators' }[lang],
      d: {
        AZ: 'Beynəlxalq sertifikatlı, minimum 5 il təcrübəyə malik operatorlar. Xidmət haqqı icarə qiymətinə daxil edilmişdir.',
        RU: 'Сертифицированные операторы с опытом минимум 5 лет. Услуги включены в стоимость аренды.',
        EN: 'Internationally certified operators with at least 5 years of experience. Service fees are included in the rental price.',
      }[lang],
    },
    {
      id: '04',
      icon: 'tag',
      t: { AZ: 'Şəffaf Qiymət Siyasəti', RU: 'Прозрачные Цены', EN: 'Transparent Pricing' }[lang],
      d: {
        AZ: 'Heç bir gizli xərc yoxdur. Daşıma və sığorta xərcləri ilkin təklif olunan qiymətə daxil edilir.',
        RU: 'Никаких скрытых расходов. Затраты на доставку и страховку включены в первоначальное предложение.',
        EN: 'No hidden costs. Transportation and insurance costs are included in the initial offer.',
      }[lang],
    },
    {
      id: '05',
      icon: 'clock',
      t: { AZ: 'Fasiləsiz Dispetçer Xidməti', RU: 'Круглосуточная Поддержка', EN: '24/7 Dispatch Support' }[lang],
      d: {
        AZ: 'Günün istənilən vaxtı (24/7) aktiv olan dispetçer dəstəyi. Təcili sorğular və texniki yerdəyişmələr operativ həll olunur.',
        RU: 'Поддержка диспетчера 24/7. Срочные запросы и технические перестановки решаются оперативно.',
        EN: 'Dispatcher support active 24/7. Urgent requests and technical relocations are handled promptly.',
      }[lang],
    },
  ];
  return (
    <section id="why" className="section-pad">
      <div className="container">
        <Reveal className="section-head">
          <h2>
            {t.why_h}
            <br />
            <span className="stroke">
              {lang === 'AZ' ? 'Beş səbəb.' : lang === 'RU' ? 'Пять причин.' : 'Five reasons.'}
            </span>
          </h2>
          <div className="meta">{t.why_meta}</div>
        </Reveal>

        <div className="why-layout">
          <StaggerGroup className="why-list" stagger={0.06}>
            {items.map((it) => (
              <StaggerItem key={it.id} className="why-item">
                <span className="id">▸ {it.id}</span>
                <div>
                  <h4>{it.t}</h4>
                  <p>{it.d}</p>
                </div>
                <span className="icon">
                  <Icon name={it.icon} size={28} stroke={1.4} />
                </span>
              </StaggerItem>
            ))}
          </StaggerGroup>

          <Reveal className="why-visual" delay={0.15}>
            <span className="badge-overlay">
              ▸{' '}
              {lang === 'AZ'
                ? 'OBYEKT KAMERASI · CANLI'
                : lang === 'RU'
                  ? 'КАМЕРА ОБЪЕКТА · ЖИВОЙ ЭФИР'
                  : 'SITE CAMERA · LIVE'}
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=2070"
              alt="Construction machinery at work"
              style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
            />
            <div className="quote-overlay">
              <div className="q">
                &ldquo;
                {lang === 'AZ'
                  ? 'Vaxt — ən bahalı ehtiyyatdır.'
                  : lang === 'RU'
                    ? 'Время — самый дорогой ресурс.'
                    : 'Time is the most expensive resource.'}
                &rdquo;
              </div>
              <div
                className="mono"
                style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em' }}
              >
                — CES{' '}
                {lang === 'AZ'
                  ? 'İş prinsipi'
                  : lang === 'RU'
                    ? 'Принцип работы'
                    : 'Workflow Principle'}{' '}
                №01
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
