import { motion } from 'framer-motion';
import { CtaGroup, SectionLabel, fadeUp } from './shared';
import type { ServicesCopy, Lang } from '@/content/servicesPreview';

interface Props {
  copy: ServicesCopy['hero'];
  lang: Lang;
  imageSrc?: string;
  imageAlt: string;
}

const ServicesHero = ({ copy, lang, imageSrc, imageAlt }: Props) => (
  <section className="pt-28 md:pt-36 pb-16 md:pb-24 overflow-hidden">
    <div className="container-wide">
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div className="max-w-xl">
          <SectionLabel>{copy.label}</SectionLabel>
          <motion.h1
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.05 }}
            className="font-heading text-4xl md:text-5xl lg:text-6xl leading-[1.1] mb-6"
          >
            {copy.title}
          </motion.h1>
          <motion.p
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.15 }}
            className="text-muted-foreground text-lg leading-relaxed mb-8"
          >
            {copy.body}
          </motion.p>
          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.25 }}>
            <CtaGroup lang={lang} />
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
