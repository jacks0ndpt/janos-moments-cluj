import { motion } from 'framer-motion';
import { CtaButtons, SectionLabel, fadeUp } from './shared';
import type { ServicesContent } from '@/content/servicesPage';

interface Props {
  copy: ServicesContent['hero'];
  imageSrc?: string;
  imageAlt: string;
  objectPosition?: string;
}

const ServicesHero = ({ copy, imageSrc, imageAlt, objectPosition }: Props) => (
  <section className="px-6 md:px-12 lg:px-20 pt-28 md:pt-32 pb-12 md:pb-16 overflow-hidden">
    <div className="container-wide">
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div className="max-w-xl">
          <SectionLabel>{copy.label}</SectionLabel>
          <motion.h1
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.05 }}
            className="font-heading text-4xl md:text-5xl lg:text-[3.4rem] leading-[1.1] mb-5"
          >
            {copy.title}
          </motion.h1>
          <motion.p
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.12 }}
            className="text-muted-foreground text-lg leading-relaxed mb-6"
          >
            {copy.body}
          </motion.p>
          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.18 }}
            className="mb-7 border-l-2 border-primary/40 pl-4"
          >
            <p className="font-heading text-xl md:text-2xl">{copy.price}</p>
            <p className="text-sm text-muted-foreground mt-1">{copy.availability}</p>
          </motion.div>
          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.24 }}>
            <CtaButtons
              primaryLabel={copy.ctaLabel}
              primaryHref={copy.ctaHref}
              secondaryLabel={copy.secondaryLabel}
              secondaryHref={copy.secondaryHref}
            />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 1.02 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative aspect-[4/5] lg:aspect-[3/4] w-full overflow-hidden rounded-sm bg-muted"
        >
          {imageSrc && (
            <img
              src={imageSrc}
              alt={imageAlt}
              className="w-full h-full object-cover"
              style={objectPosition ? { objectPosition } : undefined}
              loading="eager"
              decoding="async"
            />
          )}
        </motion.div>
      </div>
    </div>
  </section>
);

export default ServicesHero;
