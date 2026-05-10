'use client';

import { Logo } from './Header';
import { useLang } from '@/lib/lang';
import { TRANSLATIONS } from '@/lib/translations';

export function Footer() {
  const { lang } = useLang();
  const t = TRANSLATIONS[lang];
  return (
    <>
      <div className="megamark">
        <div className="word">CONSTRUCTION</div>
        <div className="word gold">EQUIPMENT</div>
        <div className="word">SERVICES</div>
      </div>

      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <a href="#" className="nav-logo">
                <Logo size={120} />
              </a>
              <p>{t.footer_about}</p>
            </div>
            <div className="footer-col">
              <h5>{lang === 'AZ' ? 'Xidmətlər' : lang === 'RU' ? 'Услуги' : 'Services'}</h5>
              <a href="#fleet">{lang === 'AZ' ? 'Avtokran' : lang === 'RU' ? 'Автокран' : 'Mobile Crane'}</a>
              <a href="#fleet">{lang === 'AZ' ? 'Forklift' : lang === 'RU' ? 'Погрузчик' : 'Forklift'}</a>
              <a href="#fleet">{lang === 'AZ' ? 'Səbət' : lang === 'RU' ? 'Вышка' : 'Aerial Lift'}</a>
              <a href="#fleet">{lang === 'AZ' ? 'Ekskavator' : lang === 'RU' ? 'Экскаватор' : 'Excavator'}</a>
              <a href="#fleet">{lang === 'AZ' ? 'Buldozer' : lang === 'RU' ? 'Бульдозер' : 'Bulldozer'}</a>
            </div>
            <div className="footer-col">
              <h5>{t.footer_links}</h5>
              <a href="#">{lang === 'AZ' ? 'Haqqımızda' : lang === 'RU' ? 'О нас' : 'About Us'}</a>
              <a href="#projects">{t.nav_projects}</a>
              <a href="#">{lang === 'AZ' ? 'Karyera' : lang === 'RU' ? 'Карьера' : 'Career'}</a>
              <a href="#">{lang === 'AZ' ? 'Yeniliklər' : lang === 'RU' ? 'Новости' : 'News'}</a>
              <a href="#contact">{t.nav_contact}</a>
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
    </>
  );
}
