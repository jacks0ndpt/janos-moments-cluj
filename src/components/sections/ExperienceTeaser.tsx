import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { loadFeaturedImages, type PortfolioImage } from '@/lib/portfolioSource';
import {
  defaultConfig,
  loadExperienceConfig,
  objectPosition,
  resolveImages,
  slotAlt,
  type ExperienceConfig,
  type ResolvedImage,
} from '@/lib/experiencePage';
import type { Lang } from '@/content/experience';

const ExperienceTeaser = () => {
  const { language } = useLanguage();
  const lang = language as Lang;
  const reduceMotion = useReducedMotion();

  const [config, setConfig] = useState<ExperienceConfig | null>(null);
  const [resolved, setResolved] = useState<Map<string, ResolvedImage>>(new Map());
  const [fallback, setFallback] = useState<PortfolioImage | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cfg = await loadExperienceConfig().catch(() => defaultConfig());
      if (cancelled) return;
      setConfig(cfg);
      const slot = cfg.slots.teaser;
      const map = await resolveImages([slot.imageId, slot.mobileImageId]).catch(
        () => new Map<string, ResolvedImage>()
      );
      if (cancelled) return;
      setResolved(map);
      const primary = slot.imageId ? map.get(slot.imageId) : undefined;
      if (!primary?.available) {
        const feat = await loadFeaturedImages(1).catch(() => [] as PortfolioImage[]);
        if (!cancelled) setFallback(feat[0] ?? null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!config || !config.isEnabled || !config.teaserEnabled) return null;

  const c = config.content[lang].teaser;
  const slot = config.slots.teaser;
  const desktop = slot.imageId ? resolved.get(slot.imageId) : undefined;
  const mobileRec = slot.mobileImageId ? resolved.get(slot.mobileImageId) : undefined;
  const desktopSrc = desktop?.available ? desktop.src : fallback?.src;
  const mobileSrc = mobileRec?.available ? mobileRec.src : desktopSrc;
  const alt = slotAlt(slot, lang);

  const fade = reduceMotion
    ? { initial: { opacity: 1 }, whileInView: { opacity: 1 } }
    : {
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-80px' },
        transition: { duration: 0.8, ease: 'easeOut' as const },
      };

  return (
    <section className="py-20 md:py-32 bg-card" aria-labelledby="experience-teaser-heading">
      <div className="container-wide px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-center">
          {/* Image — desktop left, mobile after the paragraph */}
          <motion.div {...fade} className="md:col-span-6 order-3 md:order-1">
            <div className="aspect-[4/5] w-full overflow-hidden bg-muted">
              {desktopSrc && (
                <>
                  <img
                    src={mobileSrc}
                    alt={alt}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover md:hidden"
                    style={{ objectPosition: objectPosition(slot.mobileFocal) }}
                  />
                  <img
                    src={desktopSrc}
                    alt={alt}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover hidden md:block"
                    style={{ objectPosition: objectPosition(slot.focal) }}
                  />
                </>
              )}
            </div>
          </motion.div>

          <motion.div {...fade} className="md:col-span-6 md:col-start-8 order-1 md:order-2 contents md:block">
            <div className="order-1 md:order-none">
              <p className="text-xs tracking-[0.25em] text-muted-foreground mb-5">{c.label}</p>
              <h2
                id="experience-teaser-heading"
                className="font-heading text-3xl md:text-4xl leading-tight mb-6 max-w-lg"
              >
                {c.heading}
              </h2>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-lg">{c.body}</p>
            </div>
          </motion.div>

          <div className="order-4 md:order-3 md:col-span-6 md:col-start-8">
            <Button asChild variant="outline" size="lg">
              <Link to="/experience">{c.cta}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExperienceTeaser;
