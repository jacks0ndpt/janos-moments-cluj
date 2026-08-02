import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ArrowDown } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { loadFeaturedImages, type PortfolioImage } from '@/lib/portfolioSource';
import {
  loadExperienceConfig,
  resolveImages,
  objectPosition,
  slotAlt,
  defaultConfig,
  type ExperienceConfig,
  type ResolvedImage,
} from '@/lib/experiencePage';
import type { ExperienceSlotKey, Lang } from '@/content/experience';

const SITE = 'https://jimmyhada.com';

const Experience = () => {
  const { language } = useLanguage();
  const lang = language as Lang;
  const reduceMotion = useReducedMotion();

  const [config, setConfig] = useState<ExperienceConfig>(() => defaultConfig());
  const [resolved, setResolved] = useState<Map<string, ResolvedImage>>(new Map());
  const [fallback, setFallback] = useState<PortfolioImage[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cfg = await loadExperienceConfig().catch(() => defaultConfig());
      if (cancelled) return;
      setConfig(cfg);
      const ids = Object.values(cfg.slots).flatMap((s) => [s.imageId, s.mobileImageId]);
      const map = await resolveImages(ids).catch(() => new Map<string, ResolvedImage>());
      if (cancelled) return;
      setResolved(map);
      // Graceful fallback for slots without a valid selection: a small curated set.
      const needsFallback = Object.values(cfg.slots).some((s) => {
        const r = s.imageId ? map.get(s.imageId) : undefined;
        return !r || !r.available;
      });
      if (needsFallback) {
        const feat = await loadFeaturedImages(6).catch(() => [] as PortfolioImage[]);
        if (!cancelled) setFallback(feat);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const fade = reduceMotion
    ? { initial: { opacity: 1 }, whileInView: { opacity: 1 } }
    : {
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-80px' },
        transition: { duration: 0.8, ease: 'easeOut' as const },
      };

  const c = config.content[lang];
  const seo = config.seo[lang];

  const slotOrder: ExperienceSlotKey[] = ['hero', 'intro', 'before', 'during', 'plansChange', 'closing'];

  const srcFor = (key: ExperienceSlotKey, variant: 'desktop' | 'mobile') => {
    const slot = config.slots[key];
    const id = variant === 'mobile' ? slot.mobileImageId ?? slot.imageId : slot.imageId;
    const rec = id ? resolved.get(id) : undefined;
    if (rec?.available) return rec.src;
    const idx = slotOrder.indexOf(key);
    return fallback[idx >= 0 ? idx % Math.max(fallback.length, 1) : 0]?.src;
  };

  const SlotImage = ({
    slotKey,
    className,
    priority = false,
  }: { slotKey: ExperienceSlotKey; className?: string; priority?: boolean }) => {
    const slot = config.slots[slotKey];
    const alt = slotAlt(slot, lang);
    const desktopSrc = srcFor(slotKey, 'desktop');
    const mobileSrc = srcFor(slotKey, 'mobile');
    if (!desktopSrc && !mobileSrc) {
      return (
        <div
          className={`bg-muted flex items-center justify-center text-muted-foreground text-xs tracking-wider uppercase ${className ?? ''}`}
          role="presentation"
        />
      );
    }
    const common = `w-full h-full object-cover ${className ?? ''}`;
    return (
      <>
        <img
          src={mobileSrc ?? desktopSrc}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className={`${common} md:hidden`}
          style={{ objectPosition: objectPosition(slot.mobileFocal) }}
        />
        <img
          src={desktopSrc ?? mobileSrc}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className={`${common} hidden md:block`}
          style={{ objectPosition: objectPosition(slot.focal) }}
        />
      </>
    );
  };

  const blocks = [
    { key: 'before' as ExperienceSlotKey, ...c.blocks.before },
    { key: 'during' as ExperienceSlotKey, ...c.blocks.during },
    { key: 'plansChange' as ExperienceSlotKey, ...c.blocks.plansChange },
    { key: 'before' as ExperienceSlotKey, ...c.blocks.present },
  ];

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        {!config.isEnabled && <meta name="robots" content="noindex, nofollow" />}
        <link rel="canonical" href={`${SITE}${lang === 'ro' ? '/ro/experience' : '/en/experience'}`} />
        <link rel="alternate" hrefLang="ro" href={`${SITE}/ro/experience`} />
        <link rel="alternate" hrefLang="en" href={`${SITE}/en/experience`} />
        <link rel="alternate" hrefLang="x-default" href={`${SITE}/experience`} />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`${SITE}${lang === 'ro' ? '/ro/experience' : '/en/experience'}`} />
        <meta property="og:locale" content={lang === 'en' ? 'en_US' : 'ro_RO'} />
      </Helmet>

      <Header />

      <main className="min-h-screen bg-background">
        {/* Desktop hero */}
        <section className="relative hidden md:flex h-[90vh] min-h-[600px] items-end overflow-hidden">
          <div className="absolute inset-0 z-0">
            <SlotImage slotKey="hero" priority />
            <div className="absolute inset-0 hero-gradient" />
          </div>
          <div className="relative z-10 container-wide px-6 lg:px-12 pb-20 md:pb-28">
            <motion.div
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="max-w-3xl"
            >
              <p className="text-background/80 text-xs md:text-sm tracking-[0.25em] mb-6">{c.hero.label}</p>
              <h1 className="font-heading text-3xl md:text-5xl lg:text-6xl text-background leading-tight mb-6">
                {c.hero.heading}
              </h1>
              <p className="text-background/85 text-base md:text-lg max-w-xl leading-relaxed">{c.hero.body}</p>
            </motion.div>
          </div>
          {!reduceMotion && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.8 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
            >
              <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                <ArrowDown className="text-background/60" size={22} />
              </motion.div>
            </motion.div>
          )}
        </section>

        {/* Mobile hero — text above image */}
        <section className="md:hidden">
          <div className="container-wide px-6 pt-16 pb-10">
            <motion.div
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-muted-foreground text-xs tracking-[0.25em] mb-5">{c.hero.label}</p>
              <h1 className="font-heading text-3xl leading-tight mb-5 text-foreground">{c.hero.heading}</h1>
              <p className="text-base text-muted-foreground leading-relaxed">{c.hero.body}</p>
            </motion.div>
          </div>
          <div className="px-6">
            <div className="aspect-[4/5] w-full overflow-hidden">
              <SlotImage slotKey="hero" priority />
            </div>
          </div>
        </section>

        {/* Intro editorial */}
        <section className="py-20 md:py-32">
          <div className="container-wide px-6 lg:px-12">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-start">
              <motion.div {...fade} className="md:col-span-7">
                <div className="max-w-xl space-y-6 text-foreground">
                  <p className="font-heading text-xl md:text-2xl leading-relaxed">{c.intro.p1}</p>
                  <p className="font-heading text-xl md:text-2xl leading-relaxed">{c.intro.p2}</p>
                  <p className="text-base md:text-lg leading-relaxed text-muted-foreground">{c.intro.p3}</p>
                  <p className="text-base md:text-lg leading-relaxed text-muted-foreground">{c.intro.p4}</p>
                </div>
              </motion.div>
              <motion.div {...fade} className="md:col-span-5">
                <div className="aspect-[4/5] w-full overflow-hidden">
                  <SlotImage slotKey="intro" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* What experience changes */}
        <section className="py-24 md:py-32 bg-card">
          <div className="container-wide px-6 lg:px-12">
            <motion.h2 {...fade} className="font-heading text-3xl md:text-5xl mb-16 md:mb-24 max-w-2xl">
              {c.blocksHeading}
            </motion.h2>

            <div className="space-y-24 md:space-y-32">
              {blocks.map((b, i) => {
                const flip = i % 2 === 1;
                return (
                  <motion.div
                    key={b.h}
                    {...fade}
                    className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-center"
                  >
                    <div className={`md:col-span-6 ${flip ? 'md:order-2' : ''}`}>
                      <div className="aspect-[4/5] w-full overflow-hidden">
                        <SlotImage slotKey={b.key} />
                      </div>
                    </div>
                    <div className={`md:col-span-5 ${flip ? 'md:col-start-1 md:order-1' : 'md:col-start-8'}`}>
                      <p className="text-xs tracking-[0.25em] text-muted-foreground mb-4">
                        {String(i + 1).padStart(2, '0')}
                      </p>
                      <h3 className="font-heading text-2xl md:text-3xl mb-6 leading-tight">{b.h}</h3>
                      <p className="text-base md:text-lg text-muted-foreground leading-relaxed">{b.b}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Practical value */}
        <section className="py-24 md:py-32">
          <div className="container-wide px-6 lg:px-12">
            <div className="max-w-3xl mx-auto text-center">
              <motion.h2 {...fade} className="font-heading text-3xl md:text-5xl mb-14">
                {c.practical.heading}
              </motion.h2>
              <motion.ul {...fade} className="divide-y divide-border/70 text-left">
                {c.practical.items.filter(Boolean).map((item, i) => (
                  <li
                    key={i}
                    className="py-5 flex items-baseline gap-6 font-heading text-xl md:text-2xl text-foreground"
                  >
                    <span className="text-muted-foreground text-sm tracking-[0.2em] w-10 shrink-0">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </motion.ul>
            </div>
          </div>
        </section>

        {/* Boundaries */}
        <section className="py-24 md:py-32 bg-card">
          <div className="container-wide px-6 lg:px-12">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 items-center">
              <motion.div {...fade} className="md:col-span-6">
                <div className="aspect-[4/5] w-full overflow-hidden">
                  <SlotImage slotKey="closing" />
                </div>
              </motion.div>
              <motion.div {...fade} className="md:col-span-6">
                <h2 className="font-heading text-3xl md:text-4xl mb-6 leading-tight max-w-md">
                  {c.boundaries.heading}
                </h2>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-lg">
                  {c.boundaries.body}
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Closing */}
        <section className="relative min-h-[80vh] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <SlotImage slotKey="plansChange" />
            <div className="absolute inset-0 bg-foreground/40" />
          </div>
          <div className="relative z-10 container-wide px-6 lg:px-12 py-24 md:py-32">
            <motion.div {...fade} className="max-w-2xl mx-auto text-center">
              <div className="space-y-5 font-heading text-2xl md:text-3xl text-background leading-snug italic">
                <p>{c.closing.line1}</p>
                <p>{c.closing.line2}</p>
                <p>{c.closing.line3}</p>
              </div>
              <div className="mt-12">
                <Button asChild variant="hero-light" size="lg">
                  <Link to="/contact">{c.closing.cta}</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Experience;
