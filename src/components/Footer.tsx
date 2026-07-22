'use client';

import { useLocale } from 'next-intl';
import { Logo } from './Header';
import { useLang } from '@/lib/lang';
import { TRANSLATIONS } from '@/lib/translations';

export function Footer() {
  const { lang } = useLang();
  const locale = useLocale();
  const t = TRANSLATIONS[lang];
  const anchor = (id: string) => `/${locale}#${id}`;
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <a href={`/${locale}`} className="nav-logo">
              <Logo size={120} />
            </a>
            <p>{t.footer_about}</p>
          </div>
          <div className="footer-col">
            <h5>{lang === 'AZ' ? 'Xidmətlər' : lang === 'RU' ? 'Услуги' : 'Services'}</h5>
            <a href={anchor('fleet')}>{lang === 'AZ' ? 'Forklift' : lang === 'RU' ? 'Погрузчик' : 'Forklift'}</a>
            <a href={anchor('fleet')}>{lang === 'AZ' ? 'Səbət' : lang === 'RU' ? 'Вышка' : 'Aerial Lift'}</a>
          </div>
          <div className="footer-col">
            <h5>{t.footer_links}</h5>
            <a href={anchor('services')}>{t.nav_services}</a>
            <a href={anchor('projects')}>{t.nav_projects}</a>
            <a href={anchor('faq')}>{t.nav_faq}</a>
            <a href={anchor('contact')}>{t.nav_contact}</a>
          </div>
          <div className="footer-col">
            <h5>{t.footer_contact}</h5>
            <a href="tel:+994506829080">+994 50 682 90 80</a>
            <a href="mailto:sales@ces.com.az">sales@ces.com.az</a>
            <a href="#">WhatsApp</a>
            <a href="#">{lang === 'AZ' ? 'Bakı, Azərbaycan' : lang === 'RU' ? 'Баку, Азербайджан' : 'Baku, Azerbaijan'}</a>
          </div>
        </div>

        <div className="footer-bottom">
          <div>© 2020—2026 CES MMC · {t.footer_copy}</div>
          <div className="links">
            <a href="#">{lang === 'AZ' ? 'Məxfilik' : lang === 'RU' ? 'Конфиденциальность' : 'Privacy'}</a>
            <a href="#">{lang === 'AZ' ? 'Şərtlər' : lang === 'RU' ? 'Условия' : 'Terms'}</a>
            <a href="#">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
