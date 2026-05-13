import { setRequestLocale } from 'next-intl/server';
import { TopBar, Nav } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Services } from '@/components/Services';
import { Fleet } from '@/components/Fleet';
import { Stats } from '@/components/Stats';
import { HowItWorks } from '@/components/HowItWorks';
import { WhyUs } from '@/components/WhyUs';
import { Projects } from '@/components/Projects';
import { Testimonials } from '@/components/Testimonials';
import { Clients } from '@/components/Clients';
import { FAQ } from '@/components/FAQ';
import { Contact } from '@/components/Contact';
import { Footer } from '@/components/Footer';
import { serverFetch } from '@/lib/api';
import { JsonLd } from '@/components/JsonLd';
import {
  organizationSchema,
  websiteSchema,
  fleetItemListSchema,
  faqSchema,
  servicesSchema,
} from '@/lib/schema';
import type { Locale } from '@/lib/seo';
import type {
  ClientDto,
  FaqDto,
  FleetCategoryDto,
  OfferingDto,
  ProjectDto,
  TestimonialDto,
} from '@/lib/types';

// Force ISR with a short revalidate so admin edits surface within ~60s and
// every locale variant is statically generated at build time.
export const revalidate = 60;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Fetch every public catalogue endpoint in parallel server-side so the
  // initial HTML contains real content (fleet cards, projects, FAQ answers,
  // etc.) — Googlebot and other crawlers see the data without waiting for
  // client-side JavaScript hydration.
  const [categories, offerings, projects, testimonials, clients, faqs] =
    await Promise.all([
      serverFetch<FleetCategoryDto[]>('/api/v1/public/fleet/categories'),
      serverFetch<OfferingDto[]>('/api/v1/public/offerings'),
      serverFetch<ProjectDto[]>('/api/v1/public/projects'),
      serverFetch<TestimonialDto[]>('/api/v1/public/testimonials'),
      serverFetch<ClientDto[]>('/api/v1/public/clients'),
      serverFetch<FaqDto[]>('/api/v1/public/faqs'),
    ]);

  const loc = locale as Locale;

  return (
    <>
      {/* Structured data — emitted once per page render, server-side so
          crawlers always see it. The order is harmless; Google treats each
          JSON-LD block independently. */}
      <JsonLd
        data={[
          organizationSchema(loc),
          websiteSchema(loc),
          servicesSchema(offerings, loc),
          fleetItemListSchema(categories, loc),
          faqSchema(faqs, loc),
        ]}
      />

      <TopBar />
      <Nav />
      <Hero />
      <Services initialOfferings={offerings ?? undefined} />
      <Fleet initialCategories={categories ?? undefined} />
      <Stats />
      <HowItWorks />
      <WhyUs />
      <Projects initialProjects={projects ?? undefined} />
      <Testimonials initialTestimonials={testimonials ?? undefined} />
      <Clients initialClients={clients ?? undefined} />
      <FAQ initialFaqs={faqs ?? undefined} />
      <Contact />
      <Footer />
    </>
  );
}
