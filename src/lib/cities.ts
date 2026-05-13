import type { Locale } from './seo';

/**
 * Programmatic-SEO city catalogue. Each city pairs with every published fleet
 * category to generate a long-tail landing page (e.g. avtokran-icaresi-baki).
 *
 * The {@code industry} blurb is what keeps these pages from becoming thin
 * doorway pages — it gives Google (and visitors) a real reason this specific
 * city × category combination has its own URL.
 *
 * To add a new region: append an entry here. Pages and sitemap entries are
 * generated automatically.
 */

export type CitySlug =
  | 'baki'
  | 'sumqayit'
  | 'absheron'
  | 'shirvan'
  | 'gence';

export type CityInfo = {
  slug: CitySlug;
  /** Display name per locale (used in headings, breadcrumbs, body). */
  name: Record<Locale, string>;
  /** Locative form, e.g. "Bakıda" / "в Баку" / "in Baku". */
  inCity: Record<Locale, string>;
  /** Distance from CES Baku depot in km — used in delivery time copy. */
  distanceKm: number;
  /** Estimated delivery window from depot. */
  delivery: Record<Locale, string>;
  /** Local industrial context — the unique value per page. */
  industry: Record<Locale, string>;
  /** Postal code prefix (loose) — informational. */
  postalPrefix?: string;
};

export const CITIES: CityInfo[] = [
  {
    slug: 'baki',
    name: { az: 'Bakı', ru: 'Баку', en: 'Baku' },
    inCity: { az: 'Bakıda', ru: 'в Баку', en: 'in Baku' },
    distanceKm: 0,
    delivery: {
      az: '1–3 saat (paytaxt daxili)',
      ru: '1–3 часа (в пределах столицы)',
      en: '1–3 hours (within the capital)',
    },
    industry: {
      az: 'Bakı şəhərində aparıcı sahələr — neft-qaz infrastrukturu, kommersiya tikintisi, port logistikası və yüksəkmərtəbəli yaşayış kompleksləridir. Bizim texnikamız Bakı Ağ Şəhəri, Səbail rayonu və Heydər Əliyev Mərkəzi ətrafı kimi obyektlərdə müntəzəm işləyir.',
      ru: 'Ведущие отрасли Баку — нефтегазовая инфраструктура, коммерческое строительство, портовая логистика и многоэтажные жилые комплексы. Наша техника регулярно работает на объектах вроде Baku White City, Сабаильского района и зоны вокруг Центра Гейдара Алиева.',
      en: 'Baku\'s leading sectors are oil & gas infrastructure, commercial construction, port logistics, and high-rise residential developments. Our fleet works regularly at sites like Baku White City, Sabail district, and the Heydar Aliyev Center area.',
    },
    postalPrefix: 'AZ-1000',
  },
  {
    slug: 'sumqayit',
    name: { az: 'Sumqayıt', ru: 'Сумгаит', en: 'Sumgait' },
    inCity: { az: 'Sumqayıtda', ru: 'в Сумгаите', en: 'in Sumgait' },
    distanceKm: 35,
    delivery: {
      az: '2–4 saat (Bakıdan)',
      ru: '2–4 часа (из Баку)',
      en: '2–4 hours (from Baku)',
    },
    industry: {
      az: 'Sumqayıt Azərbaycanın əsas kimya-sənaye mərkəzidir — polipropilen, alüminium emalı, neftkimya zavodları. Bu obyektlərdə tələb olunan texnika xüsusi qaldırma və materialların təhlükəsiz daşınma standartlarına cavab verir.',
      ru: 'Сумгаит — главный химико-промышленный центр Азербайджана: полипропилен, переработка алюминия, нефтехимические заводы. Техника для таких объектов отвечает повышенным требованиям по безопасности подъёмных работ и обращения с материалами.',
      en: 'Sumgait is Azerbaijan\'s main chemical-industrial hub — polypropylene, aluminium processing, petrochemical plants. Equipment dispatched there meets heightened safety standards for material handling and lifting operations.',
    },
    postalPrefix: 'AZ-5000',
  },
  {
    slug: 'absheron',
    name: { az: 'Abşeron', ru: 'Абшерон', en: 'Absheron' },
    inCity: { az: 'Abşeron rayonunda', ru: 'в Абшеронском районе', en: 'in Absheron' },
    distanceKm: 22,
    delivery: {
      az: '1–3 saat (Bakı ətrafı)',
      ru: '1–3 часа (пригород Баку)',
      en: '1–3 hours (Baku suburbs)',
    },
    industry: {
      az: 'Abşeron rayonu — yeni yaşayış kompleksləri, sənaye parkları və genişlənən logistika anbarları zonasıdır. Burada ən tez-tez tələb olunan texnika: konteyner kranları, hündürlük səbətləri və mini-ekskavatorlar.',
      ru: 'Абшеронский район — зона новых жилых комплексов, индустриальных парков и растущих логистических складов. Самая востребованная техника здесь: контейнерные краны, подъёмники и мини-экскаваторы.',
      en: 'Absheron is a zone of new residential developments, industrial parks, and expanding logistics warehouses. The most requested equipment here: container cranes, aerial platforms, and mini-excavators.',
    },
  },
  {
    slug: 'shirvan',
    name: { az: 'Şirvan', ru: 'Ширван', en: 'Shirvan' },
    inCity: { az: 'Şirvanda', ru: 'в Ширване', en: 'in Shirvan' },
    distanceKm: 124,
    delivery: {
      az: '4–6 saat (eyni gün)',
      ru: '4–6 часов (в тот же день)',
      en: '4–6 hours (same day)',
    },
    industry: {
      az: 'Şirvan — neft-qaz emalı və energetika infrastrukturunun mərkəzi şəhərlərindəndir. Ağır kranlar, xüsusi qaldırma avadanlıqları və uzunmüddətli müqavilələrlə texnika tələbi var.',
      ru: 'Ширван — один из ключевых городов нефтегазовой переработки и энергетической инфраструктуры. Высокий спрос на тяжёлые краны, специализированное подъёмное оборудование и долгосрочные контракты.',
      en: 'Shirvan is a key city for oil & gas processing and energy infrastructure. Strong demand for heavy cranes, specialised lifting gear, and long-term contracts.',
    },
  },
  {
    slug: 'gence',
    name: { az: 'Gəncə', ru: 'Гянджа', en: 'Ganja' },
    inCity: { az: 'Gəncədə', ru: 'в Гяндже', en: 'in Ganja' },
    distanceKm: 360,
    delivery: {
      az: '6–9 saat (gecə daşınması ilə)',
      ru: '6–9 часов (с ночной доставкой)',
      en: '6–9 hours (overnight transport)',
    },
    industry: {
      az: 'Gəncə Azərbaycanın ikinci ən böyük şəhəri və qərb regionunun sənaye mərkəzidir — alüminium kombinatı, avtomobil istehsalı, infrastruktur tikintisi. Regiona uzunmüddətli icarələr standartdır.',
      ru: 'Гянджа — второй по величине город Азербайджана и промышленный центр западного региона: алюминиевый комбинат, автомобильное производство, инфраструктурное строительство. В этот регион стандартно работают долгосрочные аренды.',
      en: 'Ganja is Azerbaijan\'s second-largest city and the industrial heart of the west — aluminium combine, automotive production, infrastructure construction. Long-term rentals are standard for this region.',
    },
  },
];

/** Map for O(1) slug lookup. */
const BY_SLUG = new Map(CITIES.map((c) => [c.slug, c]));

export function findCity(slug: string): CityInfo | undefined {
  return BY_SLUG.get(slug as CitySlug);
}
