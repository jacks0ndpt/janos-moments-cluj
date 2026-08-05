import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { loadFeaturedImages, type PortfolioImage } from '@/lib/portfolioSource';
import { SERVICES_COPY, type Lang } from '@/content/servicesPreview';
import ServicesHero from '@/components/services-preview/ServicesHero';
import WeddingServiceSection from '@/components/services-preview/WeddingServiceSection';
import ProcessSection from '@/components/services-preview/ProcessSection';
import DeliverablesSection from '@/components/services-preview/DeliverablesSection';
import OptionalServicesSection from '@/components/services-preview/OptionalServicesSection';
import PricingSection from '@/components/services-preview/PricingSection';
import TestimonialsSection from '@/components/services-preview/TestimonialsSection';
import FAQSection from '@/components/services-preview/FAQSection';
import FinalCTASection from '@/components/services-preview/FinalCTASection';

/**
 * Hidden preview of the redesigned Services page.
 * Reachable only by typing /services-preview (or /servicii-preview).
 * Not linked anywhere publicly and excluded from search engines.
 */
const ServicesPreview = () => {
  const { language } = useLanguage();
  const lang = language as Lang;
  const copy = SERVICES_COPY[lang];

  const [images, setImages] = useState<PortfolioImage[]>([]);

  useEffect(() => {
    let cancelled = false;
    loadFeaturedImages(4)
      .then((imgs) => {
        if (!cancelled) setImages(imgs);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const imageAlt =
    lang === 'ro'
      ? 'Fotografie de nuntă în Cluj-Napoca'
      : 'Wedding photography in Cluj-Napoca';

  return (
    <>
      <Helmet>
        <title>{copy.seo.title}</title>
        <meta name="description" content={copy.seo.description} />
        <meta name="robots" content="noindex, nofollow" />
        <meta name="googlebot" content="noindex, nofollow" />
      </Helmet>

      <Header />

      <main className="min-h-screen">
        <h1 className="sr-only">{copy.seo.title}</h1>
        <ServicesHero
          copy={copy.hero}
          lang={lang}
          imageSrc={images[0]?.src}
          imageAlt={imageAlt}
        />
        <WeddingServiceSection
          copy={copy.wedding}
          imageSrc={images[1]?.src}
          imageAlt={imageAlt}
        />
        <ProcessSection copy={copy.process} />
        <DeliverablesSection copy={copy.deliverables} />
        <OptionalServicesSection copy={copy.optional} />
        <PricingSection copy={copy.pricing} lang={lang} />
        <TestimonialsSection copy={copy.testimonials} />
        <FAQSection copy={copy.faq} />
        <FinalCTASection copy={copy.finalCta} links={copy.links} lang={lang} />
      </main>

      <Footer />
    </>
  );
};

export default ServicesPreview;
