import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Disclosure, SectionLabel, fadeUp } from './shared';
import type { ServicesContent } from '@/content/servicesPage';

interface Props {
  copy: ServicesContent['service'];
  imageSrc?: string;
  imageAlt: string;
  objectPosition?: string;
}

const ServiceSection = ({ copy, imageSrc, imageAlt, objectPosition }: Props) => (
  <section id="service" className="section-padding scroll-mt-32 overflow-hidden">
    <div className="container-wide">
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
        <div>
          <SectionLabel>{copy.label}</SectionLabel>
          <motion.h2 {...fadeUp} className="font-heading text-3xl md:text-4xl mb-5">
            {copy.title}
          </motion.h2>
          <motion.p
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.08 }}
            className="text-muted-foreground leading-relaxed mb-7"
          >
            {copy.intro}
          </motion.p>

          <motion.ul
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.14 }}
            className="space-y-2.5 mb-8"
          >
            {copy.benefits.map((item) => (
              <li key={item} className="flex gap-3 text-sm md:text-base">
                <Check size={16} className="text-primary shrink-0 mt-1" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </motion.ul>

          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.2 }}>
            <h3 className="font-heading text-xl mb-4">{copy.deliverablesTitle}</h3>
            <ul className="grid sm:grid-cols-2 gap-2.5 mb-6">
              {copy.deliverables.map((item) => (
                <li
                  key={item}
                  className="bg-card border border-border rounded-sm px-4 py-3 text-sm"
                >
                  {item}
                </li>
              ))}
            </ul>
            {copy.moreItems.length > 0 && (
              <Disclosure label={copy.moreLabel}>
                <ul className="space-y-2">
                  {copy.moreItems.map((item) => (
                    <li key={item} className="flex gap-3 text-sm text-muted-foreground">
                      <Check size={14} className="text-primary shrink-0 mt-1" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Disclosure>
            )}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 1.02 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-muted lg:sticky lg:top-32"
        >
          {imageSrc && (
            <img
              src={imageSrc}
              alt={imageAlt}
              className="w-full h-full object-cover"
              style={objectPosition ? { objectPosition } : undefined}
              loading="lazy"
              decoding="async"
            />
          )}
        </motion.div>
      </div>
    </div>
  </section>
);

export default ServiceSection;
