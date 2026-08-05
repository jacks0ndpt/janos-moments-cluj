import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { SectionLabel, fadeUp } from './shared';
import type { ServicesCopy } from '@/content/servicesPreview';

interface Props {
  copy: ServicesCopy['wedding'];
  imageSrc?: string;
  imageAlt: string;
}

const WeddingServiceSection = ({ copy, imageSrc, imageAlt }: Props) => (
  <section className="section-padding bg-card overflow-hidden">
    <div className="container-wide">
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="relative aspect-[4/3] w-full overflow-hidden rounded-sm bg-muted lg:order-last"
        >
          {imageSrc && (
            <img
              src={imageSrc}
              alt={imageAlt}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          )}
        </motion.div>

        <div className="max-w-xl">
          <SectionLabel>{copy.label}</SectionLabel>
          <motion.h2 {...fadeUp} className="font-heading text-3xl md:text-4xl lg:text-5xl mb-6">
            {copy.title}
          </motion.h2>
          {copy.paragraphs.map((p, i) => (
            <motion.p
              key={i}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.1 * (i + 1) }}
              className="text-muted-foreground leading-relaxed mb-4"
            >
              {p}
            </motion.p>
          ))}
          <ul className="mt-8 grid sm:grid-cols-2 gap-x-6 gap-y-3">
            {copy.points.map((point, i) => (
              <motion.li
                key={point}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.06 * i }}
                className="flex items-start gap-3 text-sm"
              >
                <Check className="text-primary flex-shrink-0 mt-0.5" size={16} aria-hidden="true" />
                <span>{point}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </section>
);

export default WeddingServiceSection;
