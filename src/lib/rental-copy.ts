import type { Locale } from './seo';
import type { CityInfo } from './cities';
import { pickTr } from './types';
import type { FleetCategoryDto } from './types';

/**
 * Programmatic-SEO copy generator. Builds per-locale rental landing-page
 * content from (category, city) data. The goal is enough genuinely unique
 * material that each combination is more than a name swap — search intent
 * for "avtokran icarəsi Bakı" is genuinely different from "avtokran icarəsi
 * Gəncə" (delivery time, industry context, pricing), so each page reflects
 * that.
 */

export type RentalPageCopy = {
  title: string;
  description: string;
  h1: string;
  intro: string[];
  industryHeading: string;
  deliveryHeading: string;
  deliveryBody: string;
  pricingHeading: string;
  pricingBody: string;
  faq: { q: string; a: string }[];
  ctaHeading: string;
  ctaBody: string;
  ctaButton: string;
  relatedCityHeading: string;
  relatedCategoryHeading: string;
  breadcrumbHome: string;
  breadcrumbRent: string;
};

const LOCALE_LANG = { az: 'AZ', ru: 'RU', en: 'EN' } as const;

export function buildRentalCopy(
  category: FleetCategoryDto,
  city: CityInfo,
  locale: Locale,
): RentalPageCopy {
  const lang = LOCALE_LANG[locale];
  const catName = pickTr(category.translations, lang)?.name ?? category.slug;

  // Lowercase versions for natural mid-sentence use. AZ doesn't capitalise
  // common nouns mid-sentence, so this also avoids "Avtokranlar İcarəsi"
  // showing inside body copy.
  const catLow = catName.toLowerCase();
  const cityName = city.name[locale];
  const cityIn = city.inCity[locale];
  const totalItems = category.subcategories.reduce(
    (sum, s) => sum + (s.itemCount ?? 0),
    0,
  );

  if (locale === 'az') {
    return {
      title: `${catName} icarəsi ${cityName} — CES texnika icarəsi`,
      description: `${cityIn} ${catLow} icarəsi — ${totalItems}+ vahid, sertifikatlı operator, ${city.delivery.az.toLowerCase()}. CES — Azərbaycanda 2020-dən etibarən peşəkar texnika icarəsi.`,
      h1: `${catName} icarəsi ${cityIn}`,
      intro: [
        `${cityIn} ${catLow} icarəsi axtarırsınız? CES-in ${totalItems}+ vahidlik parkı sənaye, tikinti və logistika layihələri üçün hazır vəziyyətdədir. Bütün texnika sertifikatlı operatorla birgə təhvil verilir və tam sığortalanıb.`,
        `${city.industry.az} Sifariş qəbul olunduqdan ${city.delivery.az} sonra texnikanız obyektdə olur — gecikmə cəzaları müqavilədə açıq qeyd olunur.`,
      ],
      industryHeading: `${cityName} üçün niyə CES?`,
      deliveryHeading: 'Çatdırılma və quraşdırma',
      deliveryBody: `Bakıdakı baza ilə ${cityName} arası məsafə təxminən ${city.distanceKm} km-dir. Standart çatdırılma müddəti: ${city.delivery.az}. Təcili sifarişlər üçün dispetçer xidmətimiz operativ kömək edir.`,
      pricingHeading: 'Qiymət və müqavilə şərtləri',
      pricingBody: `Tariflər saat, gün, həftə və ay formatlarında təklif olunur. Hər müqavilədə yanacaq, sığorta, operator və TƏN sənədləri daxildir — gizli xərc yoxdur. ${cityName} üçün uzunmüddətli (3+ ay) icarələrdə endirim sistemi tətbiq olunur.`,
      faq: [
        {
          q: `${cityName} ərazisinə nə qədər müddətə çatdırırsınız?`,
          a: `${city.delivery.az}. Bu, sifariş təsdiqindən sonra hesablanan standart vaxtdır. Təcili hallarda ekspres çatdırılma mümkündür.`,
        },
        {
          q: `Operator qiymətə daxildirmi?`,
          a: 'Bəli. Bütün texnika sertifikatlı, təhlükəsizlik təlimi keçmiş operatorla birgə təhvil verilir. Operator dəyəri əsas tarifə daxildir.',
        },
        {
          q: 'Minimum icarə müddəti nədir?',
          a: 'Çoxu texnika üçün minimum 1 gün (8 saat). Bəzi modellərdə saatlıq tarif də mövcuddur. Konkret müddət üçün sorğu göndərin, dispetçer dəqiq qiymət təklif edəcək.',
        },
        {
          q: 'Sığorta hansı zərərləri əhatə edir?',
          a: 'Texnika tam KASKO + MMI ilə sığortalanıb. Obyektdə baş verən hadisələrdə üçüncü tərəf zərərləri də polisin daxilindədir. Polis nüsxəsi sifariş təsdiqi ilə birgə göndərilir.',
        },
      ],
      ctaHeading: `${cityIn} texnika lazımdır?`,
      ctaBody: `Dispetçer ${city.delivery.az.includes('1') ? '15 dəqiqəyə' : 'bir saat ərzində'} qiymət təklifini göndərəcək. Telefonla və ya online formla əlaqə saxlayın.`,
      ctaButton: 'Qiymət təklifi al',
      relatedCityHeading: `Eyni texnika digər şəhərlərdə`,
      relatedCategoryHeading: `${cityIn} digər texnika`,
      breadcrumbHome: 'Ana səhifə',
      breadcrumbRent: 'Texnika icarəsi',
    };
  }

  if (locale === 'ru') {
    return {
      title: `Аренда ${catLow} ${cityName} — CES`,
      description: `Аренда ${catLow} ${cityIn}: ${totalItems}+ единиц, сертифицированный оператор, ${city.delivery.ru.toLowerCase()}. CES — профессиональная аренда техники в Азербайджане с 2020 года.`,
      h1: `Аренда ${catLow} ${cityIn}`,
      intro: [
        `Ищете аренду ${catLow} ${cityIn}? Парк CES — ${totalItems}+ единиц — готов для промышленных, строительных и логистических проектов. Вся техника передаётся с сертифицированным оператором и полностью застрахована.`,
        `${city.industry.ru} После подтверждения заявки техника на объекте через ${city.delivery.ru} — штрафы за просрочку прописаны в договоре.`,
      ],
      industryHeading: `Почему CES для ${cityName}?`,
      deliveryHeading: 'Доставка и установка',
      deliveryBody: `Расстояние от базы в Баку до ${cityName} — около ${city.distanceKm} км. Стандартное время доставки: ${city.delivery.ru}. Для срочных заявок оперативно помогает наш диспетчер.`,
      pricingHeading: 'Цена и условия договора',
      pricingBody: `Тарифы по часам, дням, неделям и месяцам. В каждом договоре включены топливо, страховка, оператор и техдокументы — никаких скрытых платежей. Для долгосрочных аренд (3+ месяца) на ${cityName} действует скидочная система.`,
      faq: [
        {
          q: `Как быстро доставите в ${cityName}?`,
          a: `${city.delivery.ru}. Это стандартное время от момента подтверждения заявки. В срочных случаях возможна экспресс-доставка.`,
        },
        {
          q: 'Оператор входит в стоимость?',
          a: 'Да. Вся техника передаётся с сертифицированным оператором, прошедшим обучение по охране труда. Стоимость оператора уже в тарифе.',
        },
        {
          q: 'Какой минимальный срок аренды?',
          a: 'Для большинства единиц — 1 сутки (8 часов). По некоторым моделям доступен почасовой тариф. Отправьте заявку — диспетчер уточнит точную цену.',
        },
        {
          q: 'Что покрывает страховка?',
          a: 'Техника полностью застрахована КАСКО + ОСАГО. Ущерб третьим лицам на объекте также покрывается. Копия полиса передаётся вместе с подтверждением.',
        },
      ],
      ctaHeading: `Нужна техника ${cityIn}?`,
      ctaBody: `Диспетчер пришлёт коммерческое предложение в течение часа. Свяжитесь по телефону или через форму.`,
      ctaButton: 'Получить предложение',
      relatedCityHeading: `Та же техника в других городах`,
      relatedCategoryHeading: `Другая техника ${cityIn}`,
      breadcrumbHome: 'Главная',
      breadcrumbRent: 'Аренда техники',
    };
  }

  // en
  return {
    title: `${catName} rental ${cityIn} — CES`,
    description: `${catName} rental ${cityIn}: ${totalItems}+ units, certified operator, ${city.delivery.en.toLowerCase()}. CES — professional equipment rental in Azerbaijan since 2020.`,
    h1: `${catName} rental ${cityIn}`,
    intro: [
      `Looking to rent ${catLow} ${cityIn}? CES operates a ${totalItems}+ unit fleet for industrial, construction, and logistics projects. Every machine ships with a certified operator and full insurance coverage.`,
      `${city.industry.en} Once the order is confirmed, equipment is on site within ${city.delivery.en} — late-arrival penalties are written into the contract.`,
    ],
    industryHeading: `Why CES for ${cityName}?`,
    deliveryHeading: 'Delivery & setup',
    deliveryBody: `The Baku depot is approximately ${city.distanceKm} km from ${cityName}. Standard delivery window: ${city.delivery.en}. Our dispatcher handles urgent requests promptly.`,
    pricingHeading: 'Pricing & contract terms',
    pricingBody: `Hourly, daily, weekly, and monthly rates. Every contract includes fuel, insurance, operator, and inspection paperwork — no hidden fees. Long-term rentals (3+ months) to ${cityName} qualify for tiered discounts.`,
    faq: [
      {
        q: `How fast do you deliver to ${cityName}?`,
        a: `${city.delivery.en}. That's the standard time from order confirmation. Express delivery is available for urgent requests.`,
      },
      {
        q: 'Is the operator included?',
        a: 'Yes. Every machine ships with a certified operator who has completed safety and operations training. The operator cost is already in the tariff.',
      },
      {
        q: 'What\'s the minimum rental period?',
        a: 'Most equipment: 1 day (8 hours). Some models offer hourly rates. Send a request — the dispatcher will confirm exact pricing.',
      },
      {
        q: 'What does the insurance cover?',
        a: 'The machine carries full hull and liability coverage. Third-party damage on site is also covered. The policy copy ships with the order confirmation.',
      },
    ],
    ctaHeading: `Need equipment ${cityIn}?`,
    ctaBody: `The dispatcher sends a quote within one hour. Reach us by phone or through the contact form.`,
    ctaButton: 'Get a Quote',
    relatedCityHeading: `Same equipment in other cities`,
    relatedCategoryHeading: `Other equipment ${cityIn}`,
    breadcrumbHome: 'Home',
    breadcrumbRent: 'Equipment rental',
  };
}
