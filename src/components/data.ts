import type { Lang } from '@/lib/translations';

export type FleetCategory = {
  id: string;
  label: string;
  count: number;
};

export type FleetItem = {
  id: string;
  cat: string;
  catLabel: string;
  name: string;
  sub: string;
  badge: string;
  img: string;
  specs: { k: string; v: string }[];
  price: string;
  unit: string;
};

export type Project = {
  id: string;
  title: string;
  cat: string;
  meta: string;
  size?: string;
  img: string;
};

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  initials: string;
};

export type FAQItem = {
  q: string;
  a: string;
};

export const FLEET_CATEGORIES = (lang: Lang): FleetCategory[] => {
  const labels = {
    AZ: { all: 'Bütün Texnika', crane: 'Avtokranlar', forklift: 'Forkliftlər', lift: 'Yüksəklik Səbətləri', excavator: 'Ekskavatorlar', bulldozer: 'Buldozerlər' },
    RU: { all: 'Вся Техника', crane: 'Автокраны', forklift: 'Погрузчики', lift: 'Подъемники', excavator: 'Экскаваторы', bulldozer: 'Бульдозеры' },
    EN: { all: 'All Equipment', crane: 'Mobile Cranes', forklift: 'Forklifts', lift: 'Aerial Lifts', excavator: 'Excavators', bulldozer: 'Bulldozers' },
  } as const;
  return [
    { id: 'all',       label: labels[lang].all,       count: 120 },
    { id: 'crane',     label: labels[lang].crane,     count: 45 },
    { id: 'forklift',  label: labels[lang].forklift,  count: 38 },
    { id: 'lift',      label: labels[lang].lift,      count: 22 },
    { id: 'excavator', label: labels[lang].excavator, count: 10 },
    { id: 'bulldozer', label: labels[lang].bulldozer, count: 5 },
  ];
};

export const FLEET = (lang: Lang): FleetItem[] => {
  const units = { AZ: 'gün', RU: 'день', EN: 'day' } as const;
  const badges = {
    AZ: { popular: 'POPUYAR SEÇİM', high: 'YÜKSƏK TONNAJ', premium: 'PREMİUM', eco: 'EMİSSİYASIZ', durable: 'DÖZÜMLÜ', universal: 'UNİVERSAL', safety: 'TƏHLÜKƏSİZLİK', max: 'MAKSİMAL GÜC', performance: 'YÜKSƏK PERFORMANS', effective: 'EFFEKTİV' },
    RU: { popular: 'ПОПУЛЯРНЫЙ', high: 'ВЫСОКИЙ ТОННАЖ', premium: 'ПРЕМИУМ', eco: 'ЭКО', durable: 'НАДЕЖНЫЙ', universal: 'УНИВЕРСАЛЬНЫЙ', safety: 'БЕЗОПАСНОСТЬ', max: 'МАКС. МОЩНОСТЬ', performance: 'ВЫСОКАЯ МОЩНОСТЬ', effective: 'ЭФФЕКТИВНЫЙ' },
    EN: { popular: 'POPULAR CHOICE', high: 'HEAVY DUTY', premium: 'PREMIUM', eco: 'ECO-FRIENDLY', durable: 'DURABLE', universal: 'UNIVERSAL', safety: 'SAFETY FIRST', max: 'MAX POWER', performance: 'HIGH PERFORMANCE', effective: 'EFFECTIVE' },
  } as const;

  return [
    {
      id: 'AKR-040',
      cat: 'crane',
      catLabel: { AZ: 'Avtokran', RU: 'Автокран', EN: 'Mobile Crane' }[lang],
      name: 'Liebherr LTM 1040-2.1',
      sub: { AZ: 'Yüksək manevr qabiliyyətli mobil kran xidməti', RU: 'Высокоманевренный мобильный кран', EN: 'Highly maneuverable mobile crane services' }[lang],
      badge: badges[lang].popular,
      img: 'https://upload.wikimedia.org/wikipedia/commons/9/94/Liebherr_LTM_1040-2.1_Sogecofa.jpg',
      specs: [
        { k: { AZ: 'Maks. YükQaldırma', RU: 'Макс. Грузоподъемность', EN: 'Max Lifting Cap.' }[lang], v: '40 t' },
        { k: { AZ: 'Teleskopik Qol', RU: 'Телескопическая стрела', EN: 'Telescopic Boom' }[lang], v: '35 m' },
        { k: { AZ: 'İstehsal ili', RU: 'Год выпуска', EN: 'Production Year' }[lang], v: '2023' },
      ],
      price: '1400 ₼',
      unit: units[lang],
    },
    {
      id: 'AKR-110',
      cat: 'crane',
      catLabel: { AZ: 'Avtokran', RU: 'Автокран', EN: 'Mobile Crane' }[lang],
      name: 'Liebherr LTM 1110-5.1',
      sub: { AZ: 'Ağır sənaye və mürəkkəb montaj işləri üçün', RU: 'Для тяжелой промышленности', EN: 'For heavy industry and assembly' }[lang],
      badge: badges[lang].high,
      img: 'https://stevensoncrane.com/wp-content/uploads/Liebherr-LTM-1110-5.jpg',
      specs: [
        { k: { AZ: 'Maks. YükQaldırma', RU: 'Макс. Грузоподъемность', EN: 'Max Lifting Cap.' }[lang], v: '110 t' },
        { k: { AZ: 'Teleskopik Qol', RU: 'Телескопическая стрела', EN: 'Telescopic Boom' }[lang], v: '60 m' },
        { k: { AZ: 'İstehsal ili', RU: 'Год выпуска', EN: 'Production Year' }[lang], v: '2024' },
      ],
      price: '3500 ₼',
      unit: units[lang],
    },
    {
      id: 'FRK-025',
      cat: 'forklift',
      catLabel: { AZ: 'Elektrik Forklift', RU: 'Электропогрузчик', EN: 'Electric Forklift' }[lang],
      name: 'Toyota 8FBE 2.5',
      sub: { AZ: 'Ekoloji təmiz və səssiz anbar əməliyyatları', RU: 'Тихие складские работы', EN: 'Eco-friendly warehouse operations' }[lang],
      badge: badges[lang].eco,
      img: '/assets/img/fleet/Toyota 8FBE 2.5.jpg',
      specs: [
        { k: { AZ: 'Maks. YükQaldırma', RU: 'Макс. Грузоподъемность', EN: 'Max Lifting Cap.' }[lang], v: '2.5 t' },
        { k: { AZ: 'Qaldırma Hündürlüyü', RU: 'Высота подъема', EN: 'Lifting Height' }[lang], v: '4.5 m' },
        { k: { AZ: 'İstehsal ili', RU: 'Год выпуска', EN: 'Production Year' }[lang], v: '2023' },
      ],
      price: '350 ₼',
      unit: units[lang],
    },
    {
      id: 'LFT-018',
      cat: 'lift',
      catLabel: { AZ: 'Səbət', RU: 'Вышка-люлька', EN: 'Aerial Lift' }[lang],
      name: 'Genie Z-60/37 DC',
      sub: { AZ: 'Yüksəklikdə təhlükəsiz montaj və təmir işləri', RU: 'Работы на высоте', EN: 'Safe maintenance at height' }[lang],
      badge: badges[lang].safety,
      img: '/assets/img/fleet/Genie Z-6037 DC.jpg',
      specs: [
        { k: { AZ: 'İş Hündürlüyü', RU: 'Рабочая высота', EN: 'Working Height' }[lang], v: '20.1 m' },
        { k: { AZ: 'Üfüqi Çatım', RU: 'Горизонтальный вылет', EN: 'Horizontal Outreach' }[lang], v: '11.1 m' },
        { k: { AZ: 'İstehsal ili', RU: 'Год выпуска', EN: 'Production Year' }[lang], v: '2023' },
      ],
      price: '500 ₼',
      unit: units[lang],
    },
    {
      id: 'EXC-320',
      cat: 'excavator',
      catLabel: { AZ: 'Tırtıllı Ekskavator', RU: 'Гусеничный экскаватор', EN: 'Crawler Excavator' }[lang],
      name: 'Caterpillar 320',
      sub: { AZ: 'Mürəkkəb qazma və torpaq işləri üçün peşəkar seçim', RU: 'Земляные работы', EN: 'Professional excavation choice' }[lang],
      badge: badges[lang].performance,
      img: '/assets/img/fleet/Caterpillar 320.jpg',
      specs: [
        { k: { AZ: 'Ağırlıq', RU: 'Вес', EN: 'Weight' }[lang], v: '22.5 t' },
        { k: { AZ: 'Çömçə Həcmi', RU: 'Объем ковша', EN: 'Bucket Capacity' }[lang], v: '1.19 m³' },
        { k: { AZ: 'Qazma Dərinliyi', RU: 'Глубина копания', EN: 'Digging Depth' }[lang], v: '6.7 m' },
      ],
      price: '950 ₼',
      unit: units[lang],
    },
  ];
};

export const PROJECTS = (lang: Lang): Project[] => [
  {
    id: 'P-2023-014',
    title: { AZ: 'Cəbrayıl Günəş Elektrik Stansiyası', RU: 'Джебраильская солнечная электростанция', EN: 'Jabrayil Solar Power Plant' }[lang],
    cat: { AZ: 'Energetika İnfrastrukturu', RU: 'Энергетическая инфраструктура', EN: 'Energy Infrastructure' }[lang],
    meta: { AZ: '12 ay · 15 avtokran · 10 səbət', RU: '12 месяцев · 15 кранов · 10 вышек', EN: '12 months · 15 cranes · 10 lifts' }[lang],
    size: 'lg',
    img: '/assets/img/projects/Cəbrayıl Günəş Elektrik Stansiyası.jpg',
  },
  {
    id: 'P-2024-009',
    title: 'Heydər Əliyev Neft Emalı Zavodu (HAOR)',
    cat: { AZ: 'Sənaye / Neft-Qaz', RU: 'Промышленность / Нефтегаз', EN: 'Industry / Oil-Gas' }[lang],
    meta: { AZ: '18 ay · 8 ağır kran · 12 forklift', RU: '18 месяцев · 8 кранов · 12 погрузчиков', EN: '18 months · 8 cranes · 12 forklifts' }[lang],
    img: '/assets/img/projects/Heydər Əliyev Neft Emalı Zavodu (HAOR).jpg',
  },
  {
    id: 'P-2023-011',
    title: { AZ: 'Füzuli Beynəlxalq Hava Limanı', RU: 'Физулинский международный аэропорт', EN: 'Fuzuli International Airport' }[lang],
    cat: { AZ: 'Aviasiya İnfrastrukturu', RU: 'Авиационная инфраструктура', EN: 'Aviation Infrastructure' }[lang],
    meta: { AZ: '8 ay · tam baza təminatı', RU: '8 месяцев · полное обеспечение базы', EN: '8 months · full base supply' }[lang],
    img: '/assets/img/projects/Füzuli Beynəlxalq Hava Limanı.jpg',
  },
];

export const TESTIMONIALS = (lang: Lang): Testimonial[] => [
  {
    quote: {
      AZ: 'Heydər Əliyev adına NEZ-in modernizasiyası kimi strateji layihədə CES-in texnikaları və peşəkar operator heyəti işlərin qrafikdən öncə tamamlanmasında əvəzsiz rol oynadı. Təhlükəsizlik qaydalarına riayət ən yüksək səviyyədədir.',
      RU: 'В таком стратегическом проекте, как модернизация НПЗ им. Гейдара Алиева, техника и операторы CES сыграли неоценимую роль в досрочном завершении работ. Соблюдение правил безопасности на высшем уровне.',
      EN: 'In a strategic project like the modernization of the HAOR refinery, CES equipment and professional operators played an invaluable role in completing the works ahead of schedule. Safety compliance is at the highest level.',
    }[lang],
    name: 'Rüfət İsmayılov',
    role: { AZ: 'Layihə Direktoru / SOCAR Downstream', RU: 'Директор проекта / SOCAR Downstream', EN: 'Project Director / SOCAR Downstream' }[lang],
    initials: 'Rİ',
  },
  {
    quote: {
      AZ: 'İri miqyaslı logistika mərkəzlərimizin inşasında CES-in çevik xidməti və geniş texnika bazası layihənin effektivliyini artırdı. Ən qısa müddətdə dəstək və operativ problem həlli onları etibarlı partnyora çevirir.',
      RU: 'При строительстве наших крупных логистических центров гибкий сервис и широкая база техники CES повысили эффективность проекта. Оперативная поддержка делает их надежным партнером.',
      EN: "In the construction of our large-scale logistics centers, CES's agile service and extensive equipment base increased project efficiency. Prompt support and problem-solving make them a reliable partner.",
    }[lang],
    name: 'Tofiq Qasımov',
    role: { AZ: 'Baş Mühəndis / Pasha Construction', RU: 'Главный инженер / Pasha Construction', EN: 'Chief Engineer / Pasha Construction' }[lang],
    initials: 'TQ',
  },
];

export const FAQS = (lang: Lang): FAQItem[] => [
  {
    q: { AZ: 'Texnikalarınızın SƏTƏM (HSE) sertifikatları varmı?', RU: 'Есть ли у вашей техники сертификаты ТБ (HSE)?', EN: 'Does your equipment have HSE certificates?' }[lang],
    a: { AZ: 'Bəli, bütün texnika bazamız beynəlxalq standartlara (ISO 9001, ISO 45001) tam uyğundur və müntəzəm texniki baxışdan keçir. Operatorlarımız peşəkar təlimlər keçmiş və müvafiq SƏTƏM sertifikatlarına malikdirlər.', RU: 'Да, вся наша база техники полностью соответствует международным стандартам и проходит регулярные техосмотры.', EN: 'Yes, our entire equipment base fully complies with international standards and undergoes regular technical inspections.' }[lang],
  },
  {
    q: { AZ: 'Texnikanın obyektə çatdırılması necə həyata keçirilir?', RU: 'Как осуществляется доставка техники на объект?', EN: 'How is the equipment delivered to the site?' }[lang],
    a: { AZ: 'Avtokranlar və təkərli texnikalar öz gedişi ilə, tırtıllı texnikalar və ağır çəkili ekskavatorlar isə xüsusi traylerlərimiz vasitəsilə 24 saat ərzində çatdırılır.', RU: 'Автокраны и колесная техника доставляются своим ходом, а гусеничная техника — на специальных трейлерах в течение 24 часов.', EN: 'Mobile cranes and wheeled equipment are driven, while crawler equipment is delivered via special trailers within 24 hours.' }[lang],
  },
];
