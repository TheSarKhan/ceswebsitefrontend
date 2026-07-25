// Static trilingual copy for the Privacy Policy and Terms of Use pages.
// Rendered by the shared LegalPage layout. Plain content — no PII, no tracking
// claims beyond the functional cookies the site actually uses.

export type LegalSection = { h: string; p: string[] };
export type LegalDoc = {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
};

type Loc = 'az' | 'ru' | 'en';

const UPDATED = {
  az: 'Son yenilənmə: İyul 2026',
  ru: 'Обновлено: июль 2026',
  en: 'Last updated: July 2026',
} as const;

export const PRIVACY: Record<Loc, LegalDoc> = {
  az: {
    title: 'Məxfilik siyasəti',
    updated: UPDATED.az,
    intro:
      'CES MMC (“CES”, “biz”) şəxsi məlumatlarınızın məxfiliyinə hörmətlə yanaşır. Bu siyasət saytımızdan istifadə edərkən hansı məlumatları topladığımızı, onlardan necə istifadə etdiyimizi və hüquqlarınızı izah edir.',
    sections: [
      {
        h: 'Topladığımız məlumatlar',
        p: [
          'Əlaqə və ya sifariş formasını doldurduqda ad, telefon nömrəsi, e-poçt ünvanı, şirkət adı və sorğunuzun məzmunu kimi məlumatları könüllü şəkildə təqdim edirsiniz.',
          'Saytın düzgün işləməsi üçün texniki məlumatlar (brauzer növü, təxmini yerləşmə, səhifə baxışları) avtomatik toplana bilər.',
        ],
      },
      {
        h: 'Məlumatlardan istifadə',
        p: [
          'Topladığımız məlumatları yalnız sorğularınıza cavab vermək, icarə xidmətlərini təqdim etmək, qiymət təklifi hazırlamaq və sizinlə əlaqə saxlamaq üçün istifadə edirik.',
          'Məlumatlarınızı reklam məqsədi ilə üçüncü tərəflərə satmırıq və icarəyə vermirik.',
        ],
      },
      {
        h: 'Məlumatların paylaşılması',
        p: [
          'Məlumatlarınız yalnız xidmətin göstərilməsi üçün zəruri olan hallarda (məsələn, çatdırılma və ya logistika) və ya qanunvericiliyin tələb etdiyi hallarda paylaşıla bilər.',
        ],
      },
      {
        h: 'Kukilər (cookies)',
        p: [
          'Sayt yalnız funksional kukilərdən — dil seçimi və interfeys ayarları kimi — istifadə edir. Brauzerinizin ayarları vasitəsilə kukiləri idarə edə bilərsiniz.',
        ],
      },
      {
        h: 'Məlumatların qorunması və saxlanması',
        p: [
          'Məlumatlarınızı icazəsiz girişdən qorumaq üçün müvafiq texniki və təşkilati tədbirlər görürük.',
          'Şəxsi məlumatlar yalnız sorğunuzun icrası və qanuni öhdəliklərin yerinə yetirilməsi üçün zəruri olan müddət ərzində saxlanılır.',
        ],
      },
      {
        h: 'Sizin hüquqlarınız',
        p: [
          'Sizə aid məlumatların düzəldilməsini və ya silinməsini tələb etmək, həmçinin onların emalına etiraz etmək hüququna maliksiniz. Bunun üçün aşağıdakı əlaqə vasitələri ilə bizə müraciət edin.',
        ],
      },
      {
        h: 'Əlaqə',
        p: [
          'Məxfiliklə bağlı suallarınız üçün: sales@ces.com.az və ya +994 50 682 90 80. Ünvan: Bakı, Azərbaycan.',
        ],
      },
    ],
  },
  ru: {
    title: 'Политика конфиденциальности',
    updated: UPDATED.ru,
    intro:
      'CES MMC («CES», «мы») уважает конфиденциальность ваших персональных данных. Эта политика объясняет, какие данные мы собираем при использовании сайта, как их используем и какие у вас есть права.',
    sections: [
      {
        h: 'Какие данные мы собираем',
        p: [
          'Заполняя форму связи или заявки, вы добровольно предоставляете такие данные, как имя, номер телефона, адрес электронной почты, название компании и содержание запроса.',
          'Для корректной работы сайта могут автоматически собираться технические данные (тип браузера, примерное местоположение, просмотры страниц).',
        ],
      },
      {
        h: 'Использование данных',
        p: [
          'Собранные данные используются исключительно для ответа на ваши запросы, предоставления услуг аренды, подготовки коммерческих предложений и связи с вами.',
          'Мы не продаём и не передаём ваши данные третьим лицам в рекламных целях.',
        ],
      },
      {
        h: 'Передача данных',
        p: [
          'Ваши данные могут передаваться только в объёме, необходимом для оказания услуги (например, доставка или логистика), либо если этого требует законодательство.',
        ],
      },
      {
        h: 'Файлы cookie',
        p: [
          'Сайт использует только функциональные файлы cookie — например, выбор языка и настройки интерфейса. Вы можете управлять ими в настройках браузера.',
        ],
      },
      {
        h: 'Защита и хранение данных',
        p: [
          'Мы принимаем соответствующие технические и организационные меры для защиты данных от несанкционированного доступа.',
          'Персональные данные хранятся только в течение срока, необходимого для выполнения вашего запроса и юридических обязательств.',
        ],
      },
      {
        h: 'Ваши права',
        p: [
          'Вы вправе запросить исправление или удаление ваших данных, а также возразить против их обработки. Для этого свяжитесь с нами по указанным ниже контактам.',
        ],
      },
      {
        h: 'Контакты',
        p: [
          'По вопросам конфиденциальности: sales@ces.com.az или +994 50 682 90 80. Адрес: Баку, Азербайджан.',
        ],
      },
    ],
  },
  en: {
    title: 'Privacy Policy',
    updated: UPDATED.en,
    intro:
      'CES MMC (“CES”, “we”) respects the privacy of your personal data. This policy explains what information we collect when you use our website, how we use it, and what rights you have.',
    sections: [
      {
        h: 'Information we collect',
        p: [
          'When you complete a contact or request form, you voluntarily provide details such as your name, phone number, email address, company name and the content of your enquiry.',
          'For the website to function correctly, technical data (browser type, approximate location, page views) may be collected automatically.',
        ],
      },
      {
        h: 'How we use information',
        p: [
          'We use the collected data solely to respond to your enquiries, provide rental services, prepare quotations and stay in touch with you.',
          'We do not sell or rent your data to third parties for advertising purposes.',
        ],
      },
      {
        h: 'Sharing of data',
        p: [
          'Your data may be shared only to the extent necessary to deliver the service (for example, delivery or logistics) or where required by law.',
        ],
      },
      {
        h: 'Cookies',
        p: [
          'The site uses only functional cookies — such as language selection and interface preferences. You can manage cookies through your browser settings.',
        ],
      },
      {
        h: 'Data protection and retention',
        p: [
          'We take appropriate technical and organisational measures to protect your data from unauthorised access.',
          'Personal data is kept only for as long as necessary to fulfil your request and our legal obligations.',
        ],
      },
      {
        h: 'Your rights',
        p: [
          'You have the right to request correction or deletion of your data, and to object to its processing. To do so, contact us using the details below.',
        ],
      },
      {
        h: 'Contact',
        p: [
          'For privacy questions: sales@ces.com.az or +994 50 682 90 80. Address: Baku, Azerbaijan.',
        ],
      },
    ],
  },
};

export const TERMS: Record<Loc, LegalDoc> = {
  az: {
    title: 'İstifadə şərtləri',
    updated: UPDATED.az,
    intro:
      'Bu şərtlər CES MMC saytından və xidmətlərindən istifadə qaydalarını müəyyən edir. Saytdan istifadə etməklə aşağıdakı şərtləri qəbul etmiş olursunuz.',
    sections: [
      {
        h: 'Şərtlərin qəbulu',
        p: [
          'Saytımıza daxil olmaqla və ondan istifadə etməklə bu şərtlərlə razılaşdığınızı təsdiq edirsiniz. Şərtlərlə razı deyilsinizsə, saytdan istifadə etməməyinizi xahiş edirik.',
        ],
      },
      {
        h: 'Xidmətlərin təsviri',
        p: [
          'CES tikinti texnikasının icarəsi üzrə xidmətlər göstərir. Saytdakı texnika, qiymət və təsvirlər məlumat xarakteri daşıyır və mövcudluğa görə dəyişə bilər.',
        ],
      },
      {
        h: 'Sifariş və icarə şərtləri',
        p: [
          'Sayt vasitəsilə göndərilən sorğu təsdiqlənmiş sifariş deyil. Konkret icarə şərtləri, qiymət və müddət ayrıca razılaşma və ya müqavilə əsasında müəyyən edilir.',
          'İcarə xidmətləri Azərbaycan Respublikasının qanunvericiliyinə uyğun həyata keçirilir.',
        ],
      },
      {
        h: 'İstifadəçinin öhdəlikləri',
        p: [
          'Formaları doldurarkən düzgün və dolğun məlumat təqdim etməyi öhdənizə götürürsünüz. Saytdan qanunsuz və ya zərərli məqsədlər üçün istifadə qadağandır.',
        ],
      },
      {
        h: 'Əqli mülkiyyət',
        p: [
          'Saytdakı bütün mətnlər, loqolar, şəkillər və dizayn elementləri CES-ə məxsusdur və icazəsiz istifadə oluna bilməz.',
        ],
      },
      {
        h: 'Məsuliyyətin məhdudlaşdırılması',
        p: [
          'Sayt “olduğu kimi” təqdim edilir. CES saytdakı məlumatların hər zaman tam dəqiq olacağına zəmanət vermir və saytdan istifadədən yaranan dolayı zərərlərə görə məsuliyyət daşımır.',
        ],
      },
      {
        h: 'Şərtlərdə dəyişikliklər',
        p: [
          'CES bu şərtləri istənilən vaxt yeniləyə bilər. Yenilənmiş şərtlər saytda dərc olunduğu andan qüvvəyə minir.',
        ],
      },
      {
        h: 'Əlaqə',
        p: [
          'Suallarınız üçün: sales@ces.com.az və ya +994 50 682 90 80. Ünvan: Bakı, Azərbaycan.',
        ],
      },
    ],
  },
  ru: {
    title: 'Условия использования',
    updated: UPDATED.ru,
    intro:
      'Настоящие условия определяют правила использования сайта и услуг CES MMC. Используя сайт, вы принимаете изложенные ниже условия.',
    sections: [
      {
        h: 'Принятие условий',
        p: [
          'Заходя на наш сайт и используя его, вы подтверждаете согласие с настоящими условиями. Если вы не согласны с ними, просим не использовать сайт.',
        ],
      },
      {
        h: 'Описание услуг',
        p: [
          'CES предоставляет услуги аренды строительной техники. Представленные на сайте техника, цены и описания носят информационный характер и могут меняться в зависимости от наличия.',
        ],
      },
      {
        h: 'Заявки и условия аренды',
        p: [
          'Запрос, отправленный через сайт, не является подтверждённым заказом. Конкретные условия аренды, цена и срок определяются отдельным соглашением или договором.',
          'Услуги аренды оказываются в соответствии с законодательством Азербайджанской Республики.',
        ],
      },
      {
        h: 'Обязанности пользователя',
        p: [
          'Заполняя формы, вы обязуетесь предоставлять достоверную и полную информацию. Использование сайта в незаконных или вредоносных целях запрещено.',
        ],
      },
      {
        h: 'Интеллектуальная собственность',
        p: [
          'Все тексты, логотипы, изображения и элементы дизайна на сайте принадлежат CES и не могут использоваться без разрешения.',
        ],
      },
      {
        h: 'Ограничение ответственности',
        p: [
          'Сайт предоставляется «как есть». CES не гарантирует абсолютную точность информации на сайте и не несёт ответственности за косвенный ущерб, возникший в результате использования сайта.',
        ],
      },
      {
        h: 'Изменения условий',
        p: [
          'CES вправе в любое время обновлять настоящие условия. Обновлённые условия вступают в силу с момента их публикации на сайте.',
        ],
      },
      {
        h: 'Контакты',
        p: [
          'По вопросам: sales@ces.com.az или +994 50 682 90 80. Адрес: Баку, Азербайджан.',
        ],
      },
    ],
  },
  en: {
    title: 'Terms of Use',
    updated: UPDATED.en,
    intro:
      'These terms set out the rules for using the CES MMC website and services. By using the site, you accept the terms below.',
    sections: [
      {
        h: 'Acceptance of terms',
        p: [
          'By accessing and using our website, you confirm that you agree to these terms. If you do not agree, please do not use the site.',
        ],
      },
      {
        h: 'Description of services',
        p: [
          'CES provides construction equipment rental services. The equipment, prices and descriptions shown on the site are for information only and may change subject to availability.',
        ],
      },
      {
        h: 'Requests and rental terms',
        p: [
          'A request submitted through the site is not a confirmed order. Specific rental terms, price and duration are determined by a separate agreement or contract.',
          'Rental services are provided in accordance with the laws of the Republic of Azerbaijan.',
        ],
      },
      {
        h: 'User obligations',
        p: [
          'When completing forms, you undertake to provide accurate and complete information. Using the site for unlawful or harmful purposes is prohibited.',
        ],
      },
      {
        h: 'Intellectual property',
        p: [
          'All text, logos, images and design elements on the site belong to CES and may not be used without permission.',
        ],
      },
      {
        h: 'Limitation of liability',
        p: [
          'The site is provided “as is”. CES does not guarantee that the information on the site is always fully accurate and is not liable for indirect damages arising from use of the site.',
        ],
      },
      {
        h: 'Changes to the terms',
        p: [
          'CES may update these terms at any time. Updated terms take effect once published on the site.',
        ],
      },
      {
        h: 'Contact',
        p: [
          'For questions: sales@ces.com.az or +994 50 682 90 80. Address: Baku, Azerbaijan.',
        ],
      },
    ],
  },
};
