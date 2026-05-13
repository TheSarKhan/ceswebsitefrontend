// TypeScript mirrors of the backend public DTOs.
// Keep these in sync with the *Dto.java records under src/main/java/az/ces.

export type LangCode = 'az' | 'ru' | 'en';

// Generic helper — the API returns translations keyed by lower-case language code
export type I18n<T> = Partial<Record<LangCode, T>>;

// ============================================================================
// Fleet (3-tier)
// ============================================================================

export type FleetCategoryTranslation = { name: string };
export type FleetSubcategoryTranslation = { name: string };
export type FleetItemTranslation = {
  name: string;
  description?: string | null;
  badge?: string | null;
};

export type FleetSubcategoryBrief = {
  slug: string;
  sortOrder: number;
  itemCount: number;
  translations: I18n<FleetSubcategoryTranslation>;
};

export type FleetCategoryDto = {
  slug: string;
  icon?: string | null;
  sortOrder: number;
  isPublished: boolean;
  translations: I18n<FleetCategoryTranslation>;
  subcategories: FleetSubcategoryBrief[];
};

export type FleetItemCard = {
  slug: string;
  modelNumber?: string | null;
  image?: string | null;
  price?: string | null;
  priceUnit?: string | null;
  sortOrder: number;
  isPublished: boolean;
  translations: I18n<FleetItemTranslation>;
};

export type SpecEntry = {
  key: I18n<string>;
  value: I18n<string>;
};

export type FleetItemDto = {
  slug: string;
  modelNumber?: string | null;
  image?: string | null;
  price?: string | null;
  priceUnit?: string | null;
  sortOrder: number;
  isPublished: boolean;
  translations: I18n<FleetItemTranslation>;
  specs: SpecEntry[];
  subcategory: FleetSubcategoryBrief;
  category: FleetSubcategoryBrief;
};

export type FleetSubcategoryDto = {
  slug: string;
  sortOrder: number;
  isPublished: boolean;
  translations: I18n<FleetSubcategoryTranslation>;
  category: FleetSubcategoryBrief;
  items: FleetItemCard[];
};

// ============================================================================
// Content domains
// ============================================================================

export type ProjectTranslation = {
  title: string;
  category?: string | null;
  meta?: string | null;
};

export type ProjectDto = {
  slug: string;
  year?: string | null;
  image?: string | null;
  sortOrder: number;
  translations: I18n<ProjectTranslation>;
};

export type TestimonialTranslation = { role?: string | null; quote: string };

export type TestimonialDto = {
  id: number;
  name: string;
  initials?: string | null;
  company?: string | null;
  avatar?: string | null;
  sortOrder: number;
  translations: I18n<TestimonialTranslation>;
};

export type OfferingTranslation = {
  eyebrow?: string | null;
  title: string;
  description?: string | null;
};

export type OfferingDto = {
  slug: string;
  icon?: string | null;
  sortOrder: number;
  translations: I18n<OfferingTranslation>;
};

export type FaqTranslation = { question: string; answer: string };

export type FaqDto = {
  id: number;
  sortOrder: number;
  translations: I18n<FaqTranslation>;
};

export type ClientDto = {
  id: number;
  name: string;
  logo: string;
  url?: string | null;
  sortOrder: number;
};

// ============================================================================
// Dashboard stats
// ============================================================================

export type DashboardStats = {
  totals: {
    fleetItems: number;
    fleetSubcategories: number;
    fleetCategories: number;
    projects: number;
    offerings: number;
    testimonials: number;
    faqs: number;
    clients: number;
  };
  submissions: {
    contact: SubmissionBreakdown;
    quote: SubmissionBreakdown;
  };
  trend: TrendPoint[];
  recent: RecentSubmission[];
  storage: {
    mode: 'local' | 's3';
    fileCount: number;
    totalBytes: number;
  };
};

export type SubmissionBreakdown = {
  total: number;
  newCount: number;
  seen: number;
  replied: number;
  spam: number;
};

export type TrendPoint = { day: string; contact: number; quote: number };

export type RecentSubmission = {
  id: number;
  kind: 'contact' | 'quote';
  name: string;
  phone: string;
  summary: string;
  status: 'NEW' | 'SEEN' | 'REPLIED' | 'SPAM' | null;
  createdAt: string;
};

// ============================================================================
// Helpers
// ============================================================================

import type { Lang } from './translations';

/** Pick the translation for the current uppercase {@code Lang}, falling back to AZ then EN. */
export function pickTr<T>(
  translations: I18n<T> | undefined | null,
  lang: Lang,
): T | undefined {
  if (!translations) return undefined;
  const code = lang.toLowerCase() as LangCode;
  return (
    translations[code] ??
    translations.az ??
    translations.en ??
    Object.values(translations)[0]
  );
}
