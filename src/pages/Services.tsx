import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { loadFeaturedImages, type PortfolioImage } from '@/lib/portfolioSource';
import { objectPosition, resolveImages, type ResolvedImage } from '@/lib/experiencePage';
import {
  defaultServicesConfig,
  featuredReviews,
  loadServicesConfig,
  slotAlt,
  type ServicesConfig,
} from '@/lib/servicesPage';
import type { Lang, ServicesSlotKey } from '@/content/servicesPage';
import SectionNav from '@/components/services/SectionNav';
import ServicesHero from '@/components/services/ServicesHero';
import ServiceSection from '@/components/services/ServiceSection';
import PricingSection from '@/components/services/PricingSection';
import ProcessSection from '@/components/services/ProcessSection';
import ReviewsSection from '@/components/services/ReviewsSection';
import ExtrasFaqSection from '@/components/services/ExtrasFaqSection';
import FinalCtaSection from '@/components/services/FinalCtaSection';

const Services = () => {
  const { language } = useLanguage();
  const lang = (language === 'ro' ? 'ro' : 'en') as Lang;
  const isMobile = useIsMobile();

  // Approved local defaults render immediately; Admin content merges in after.
  const [config, setConfig] = useState<ServicesConfig>(() => defaultServicesConfig());
  const [resolved, setResolved] = useState<Map<string, ResolvedImage>>(new Map());
  const [fallbacks, setFallbacks] = useState<PortfolioImage[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cfg = await loadServicesConfig();
      if (cancelled) return;
      setConfig(cfg);
      try {
        const ids = Object.values(cfg.media).flatMap((s) => [s.imageId, s.mobileImageId]);
        const map = await resolveImages(ids);
        if (!cancelled) setResolved(map);
      } catch {
        /* images stay on their fallbacks */
      }
    })();
    loadFeaturedImages(4)
      .then((imgs) => !cancelled && setFallbacks(imgs))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const copy = config.content[lang];
  const seo = config.seo[lang];

  const image = (key: ServicesSlotKey, fallbackIndex: number) => {
    const slot = config.media[key];
    const wantMobile = isMobile && slot?.mobileImageId;
    const chosen = wantMobile ? resolved.get(slot.mobileImageId!) : resolved.get(slot?.imageId ?? '');
    const usable = chosen?.available ? chosen : undefined;
    return {
      src: usable?.src ?? fallbacks[fallbackIndex]?.src,
      alt: slotAlt(slot, lang) || (lang === 'ro' ? 'Fotografie de nuntă în Cluj-Napoca' : 'Wedding photography in Cluj-Napoca'),
      objectPosition: objectPosition(isMobile ? slot?.mobileFocal : slot?.focal),
    };
  };

  const heroImage = image('hero', 0);
  const serviceImage = image('service', 1);

  const on = (key: keyof typeof config.sectionsEnabled) => config.sectionsEnabled[key] !== false;

  const navAvailable = useMemo(() => {
    const list: string[] = [];
    if (on('service')) list.push('service');
    if (on('pricing')) list.push('pricing');
    if (on('process')) list.push('process');
    if (on('reviews')) list.push('reviews');
    if (on('extras')) list.push('faq');
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.sectionsEnabled]);

  const reviews = featuredReviews(copy.reviews.featured);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: lang === 'ro' ? 'Servicii Fotografie Nuntă' : 'Wedding Photography Services',
    description: seo.description,
    provider: { '@type': 'Person', name: 'Jimmy Hada' },
    areaServed: ['Cluj-Napoca', 'Transylvania', 'Romania'],
    priceRange: '€€€',
  };

  const renderSection = (key: string) => {
    if (!on(key as keyof typeof config.sectionsEnabled)) return null;
    switch (key) {
      case 'hero':
        return (
          <ServicesHero
            key={key}
            copy={copy.hero}
            imageSrc={heroImage.src}
            imageAlt={heroImage.alt}
            objectPosition={heroImage.objectPosition}
          />
        );
      case 'service':
        return (
          <ServiceSection
            key={key}
            copy={copy.service}
            imageSrc={serviceImage.src}
            imageAlt={serviceImage.alt}
            objectPosition={serviceImage.objectPosition}
          />
        );
      case 'pricing':
        return <PricingSection key={key} copy={copy.pricing} />;
      case 'process':
        return <ProcessSection key={key} copy={copy.process} />;
      case 'reviews':
        return <ReviewsSection key={key} copy={copy.reviews} reviews={reviews} />;
      case 'extras':
        return <ExtrasFaqSection key={key} extras={copy.extras} faq={copy.faq} />;
      case 'finalCta':
        return <FinalCtaSection key={key} copy={copy.finalCta} />;
      default:
        return null;
    }
  };

  const order = config.sectionOrder;
  const heroIndex = order.indexOf('hero');

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <link rel="canonical" href="https://jimmyhada.com/services" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://jimmyhada.com/services" />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:locale" content={lang === 'ro' ? 'ro_RO' : 'en_US'} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seo.title} />
        <meta name="twitter:description" content={seo.description} />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <Header />

      <main className="min-h-screen">
        {order.slice(0, heroIndex + 1).map(renderSection)}
        <SectionNav nav={copy.nav} available={navAvailable} />
        {order.slice(heroIndex + 1).map(renderSection)}
      </main>

      <Footer />
    </>
  );
};

export default Services;
