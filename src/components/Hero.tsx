'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from './icons';
import { useLang } from '@/lib/lang';
import { TRANSLATIONS } from '@/lib/translations';

const heroContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};
const heroItem = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] as const },
  },
};
const statItem = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function Placeholder({
  label = 'TEXNİKA FOTOSU',
  className = '',
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={'placeholder-img ' + className}
      style={{ position: 'absolute', inset: 0 }}
    >
      <span className="corner tl"></span>
      <span className="corner tr"></span>
      <span className="corner bl"></span>
      <span className="corner br"></span>
      <span className="label">{label}</span>
    </div>
  );
}

export function Hero() {
  const { lang } = useLang();
  const t = TRANSLATIONS[lang];

  return (
    <section className="hero hero--minimal" data-lang={lang}>
      <div className="hero-video" aria-hidden="true">
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="/assets/video/hero-crane-poster.jpg"
        >
          <source src="/assets/video/hero-crane.mp4" type="video/mp4" />
        </video>
        <div className="hero-video-overlay"></div>
      </div>
      <div className="hero-grid grid-bg"></div>
      <div className="hero-glow" aria-hidden="true"></div>

      <motion.span
        className="hero-accent-top"
        initial={{ width: 0 }}
        animate={{ width: '46%' }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        aria-hidden="true"
      />

      <motion.div
        className="container hero-inner"
        variants={heroContainer}
        initial="hidden"
        animate="show"
      >
        <div className="hero-grid-2col">
          <div className="hero-content">
            <motion.h1 variants={heroItem}>
              <span>{t.hero_t1}</span> <span className="stroke">{t.hero_t2}</span>
            </motion.h1>
            <motion.p className="hero-sub" variants={heroItem}>
              {t.hero_sub}
            </motion.p>
            <motion.div className="hero-actions" variants={heroItem}>
              <a href="#fleet" className="btn btn-primary btn-arrow">
                {t.hero_btn1}
                <Icon name="arrow-right" size={14} stroke={2.5} />
              </a>
              <a href="#contact" className="btn btn-ghost">
                {t.hero_btn2}
              </a>
            </motion.div>
          </div>

          <motion.aside
            className="hero-stats-stack"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.1, delayChildren: 0.35 } },
            }}
          >
            <motion.div className="hero-stat" variants={statItem}>
              <span className="bar" aria-hidden="true"></span>
              <span className="val">
                100<span className="unit">%</span>
              </span>
              <span className="lbl">{t.stat_delivery}</span>
            </motion.div>
            <motion.div className="hero-stat" variants={statItem}>
              <span className="bar" aria-hidden="true"></span>
              <span className="val">
                25<span className="unit">+</span>
              </span>
              <span className="lbl">{t.stat_support}</span>
            </motion.div>
            <motion.div className="hero-stat" variants={statItem}>
              <span className="bar" aria-hidden="true"></span>
              <span className="val">
                120<span className="unit">+</span>
              </span>
              <span className="lbl">{t.stat_fleet}</span>
            </motion.div>
            <motion.div className="hero-stat" variants={statItem}>
              <span className="bar" aria-hidden="true"></span>
              <span className="val">
                6
                <span className="unit">
                  {lang === 'AZ' ? 'il' : lang === 'RU' ? 'лет' : 'yrs'}
                </span>
              </span>
              <span className="lbl">{t.stat_exp}</span>
            </motion.div>
          </motion.aside>
        </div>
      </motion.div>

      <div className="ticker">
        <div className="ticker-track">
          {[...Array(2)].map((_, i) => (
            <React.Fragment key={i}>
              <span className="gold">⬢</span>
              <span>AVTOKRAN — 40t / 80t / 120t</span>
              <span className="dot">/</span>
              <span>FORKLIFT — 2.5t / 5t / 7t</span>
              <span className="dot">/</span>
              <span>SƏBƏT — 18m / 26m / 42m</span>
              <span className="dot">/</span>
              <span>EKSKAVATOR</span>
              <span className="dot">/</span>
              <span>BULDOZER</span>
              <span className="dot">/</span>
              <span className="gold">OPERATORLA ÇATDIRILMA</span>
              <span className="dot">/</span>
              <span>OPERATORLA</span>
              <span className="dot">/</span>
              <span>SIĞORTALI</span>
              <span className="dot">/</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
