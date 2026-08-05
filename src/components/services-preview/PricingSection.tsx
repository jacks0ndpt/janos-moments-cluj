import { motion } from 'framer-motion';
import { CtaGroup, SectionLabel, fadeUp } from './shared';
import type { ServicesCopy, Lang } from '@/content/servicesPreview';

interface Props {
  copy: ServicesCopy['pricing'];
  lang: Lang;
}

const PricingSection = ({ copy, lang }: Props) => (
  <section className="section-padding bg-card overflow-hidden">
    <div className="container-narrow text-center">
      <SectionLabel>{copy.label}</SectionLabel>
      <motion.h2 {...fadeUp} className="font-heading text-3xl md:text-4xl lg:text-5xl mb-6">
        {copy.title}
      </motion.h2>
      <motion.p
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.1 }}
        className="font-heading text-2xl md:text-3xl lg:text-4xl mb-6"
      >
        {copy.price}
      </motion.p>
      <motion.p
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.18 }}
        className="text-muted-foreground leading-relaxed max-w-xl mx-auto mb-3"
      >
        {copy.body}
      </motion.p>
      <motion.p
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.24 }}
        className="text-sm text-muted-foreground italic mb-8"
      >
        {copy.note}
      </motion.p>
      <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.3 }}>
        <CtaGroup lang={lang} showSecondary={false} className="justify-center" />
      </motion.div>
    </div>
  </section>
);

export default PricingSection;
