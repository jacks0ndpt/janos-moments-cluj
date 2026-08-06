import { motion } from 'framer-motion';
import { CtaButtons, SectionLabel, fadeUp } from './shared';
import type { ServicesContent } from '@/content/servicesPage';

const PricingSection = ({ copy }: { copy: ServicesContent['pricing'] }) => (
  <section id="pricing" className="section-padding scroll-mt-32 bg-card overflow-hidden">
    <div className="container-narrow text-center">
      <SectionLabel>{copy.label}</SectionLabel>
      <motion.h2 {...fadeUp} className="font-heading text-3xl md:text-4xl mb-5">
        {copy.title}
      </motion.h2>
      <motion.p
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.08 }}
        className="font-heading text-2xl md:text-3xl mb-6"
      >
        {copy.price}
      </motion.p>
      <motion.p
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.14 }}
        className="text-muted-foreground leading-relaxed max-w-xl mx-auto mb-5"
      >
        {copy.body}
      </motion.p>
      {copy.factors.length > 0 && (
        <motion.ul
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.18 }}
          className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto mb-6"
        >
          {copy.factors.map((f) => (
            <li
              key={f}
              className="border border-border rounded-full px-4 py-1.5 text-xs md:text-sm text-muted-foreground"
            >
              {f}
            </li>
          ))}
        </motion.ul>
      )}
      <motion.p
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.22 }}
        className="text-sm text-muted-foreground italic mb-8"
      >
        {copy.note}
      </motion.p>
      <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.26 }}>
        <CtaButtons
          primaryLabel={copy.ctaLabel}
          primaryHref={copy.ctaHref}
          className="justify-center"
        />
      </motion.div>
    </div>
  </section>
);

export default PricingSection;
