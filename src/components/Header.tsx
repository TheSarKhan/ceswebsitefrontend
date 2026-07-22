'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { Icon } from './icons';
import { useLang } from '@/lib/lang';
import { useTheme } from '@/contexts/ThemeContext';
import { TRANSLATIONS, type Lang } from '@/lib/translations';

export function Logo({ size = 44, priority = false }: { size?: number; priority?: boolean }) {
  const { theme } = useTheme();
  return (
    <Image
      src={theme === 'light' ? '/assets/logo white.png' : '/assets/logo2.png'}
      alt="Construction Equipment Services"
      width={size}
      height={size}
      priority={priority}
      style={{ width: size, height: size, objectFit: 'contain', display: 'block' }}
    />
  );
}

export function SiteHeader({ transparent = false }: { transparent?: boolean }) {
  const { lang, setLang } = useLang();
  const { theme, toggleTheme } = useTheme();
  const locale = useLocale();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!isLangOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [isLangOpen]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const setHeaderHeightVar = () =>
      document.documentElement.style.setProperty('--header-h', `${el.offsetHeight}px`);
    setHeaderHeightVar();
    const ro = new ResizeObserver(setHeaderHeightVar);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Anchor links use a locale-prefixed path so they keep working from any
  // future non-home route — landing on /az/#fleet always scrolls correctly.
  const anchor = (id: string) => `/${locale}#${id}`;

  const links: { href: string; label: string }[] = [
    { href: anchor('fleet'),    label: t.nav_fleet },
    { href: anchor('services'), label: t.nav_services },
    { href: anchor('how'),      label: t.nav_how },
    { href: anchor('projects'), label: t.nav_projects },
    { href: anchor('faq'),      label: t.nav_faq },
    { href: anchor('contact'),  label: t.nav_contact },
  ];

  const closeMenu = () => setIsMenuOpen(false);

  const cls = [
    'nav',
    isMenuOpen && 'menu-open',
    transparent && 'nav--transparent',
    scrolled && 'scrolled',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <header ref={ref} className={cls}>
      <div className="container nav-inner">
        <a href={`/${locale}`} className="nav-logo" onClick={closeMenu}>
          <span className="nav-logo-wrap">
            <Logo size={96} priority />
          </span>
        </a>

        <nav className="nav-links">
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>

        <div className="nav-cta">
          <div className="lang-dropdown hide-sm" ref={langRef}>
            <button
              className="lang-dropdown-trigger"
              onClick={() => setIsLangOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={isLangOpen}
            >
              {lang}
              <span className="chevron">▾</span>
            </button>
            {isLangOpen && (
              <div className="lang-dropdown-menu" role="listbox">
                {(['AZ', 'RU', 'EN'] as Lang[])
                  .filter((L) => L !== lang)
                  .map((L) => (
                    <button
                      key={L}
                      role="option"
                      aria-selected={false}
                      onClick={() => {
                        setLang(L);
                        setIsLangOpen(false);
                      }}
                    >
                      {L}
                    </button>
                  ))}
              </div>
            )}
          </div>
          <button
            className="theme-toggle hide-sm"
            onClick={toggleTheme}
            aria-label={
              theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'
            }
            title={theme === 'light' ? 'Qaranlıq mod' : 'Gündüz mod'}
          >
            <Icon name={theme === 'light' ? 'moon' : 'sun'} size={13} stroke={1.5} />
          </button>
          <a
            href={anchor('contact')}
            className="btn btn-ghost hide-mobile"
            style={{ padding: '10px 16px', fontSize: 12 }}
          >
            {t.nav_order}
          </a>
          <a
            href="tel:+994506829080"
            className="btn btn-primary"
            style={{ padding: '10px 16px', fontSize: 12 }}
          >
            <Icon name="phone" size={14} stroke={2} />
            <span className="hide-sm">{t.nav_call}</span>
          </a>
          <button
            className="menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Menu"
          >
            <Icon name={isMenuOpen ? 'close' : 'menu'} size={24} />
          </button>
        </div>
      </div>

      <div className={`mobile-menu ${isMenuOpen ? 'active' : ''}`}>
        <div className="mobile-menu-links">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={closeMenu}>
              <span className="lbl">{l.label}</span>
              <Icon name="arrow-right" size={20} />
            </a>
          ))}
        </div>
        <div className="mobile-menu-footer">
          <div className="mobile-menu-controls">
            <div className="lang-switch">
              {(['AZ', 'RU', 'EN'] as Lang[]).map((L) => (
                <button
                  key={L}
                  className={lang === L ? 'active' : ''}
                  onClick={() => setLang(L)}
                >
                  {L}
                </button>
              ))}
            </div>
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={
                theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'
              }
              title={theme === 'light' ? 'Qaranlıq mod' : 'Gündüz mod'}
            >
              <Icon name={theme === 'light' ? 'moon' : 'sun'} size={13} stroke={1.5} />
            </button>
          </div>
          <div className="contact-item">
            <Icon name="phone" size={16} />
            <a href="tel:+994506829080">+994 50 682 90 80</a>
          </div>
          <div className="contact-item">
            <Icon name="mail" size={16} />
            <a href="mailto:sales@ces.com.az">sales@ces.com.az</a>
          </div>
        </div>
      </div>
    </header>
  );
}
