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

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <TopBar />
      <Nav />
      <Hero />
      <Services />
      <Fleet />
      <Stats />
      <HowItWorks />
      <WhyUs />
      <Projects />
      <Testimonials />
      <Clients />
      <FAQ />
      <Contact />
      <Footer />
    </>
  );
}
