import { motion } from 'framer-motion';
import { Plus, Users } from 'lucide-react';
import { SectionLabel, fadeUp } from './shared';
import type { ServicesCopy } from '@/content/servicesPreview';

const OptionalServicesSection = ({ copy }: { copy: ServicesCopy['optional'] }) => (
  <section className="section-padding overflow-hidden">
    <div className="container-wide">
      <div className="max-w-2xl mb-10 md:mb-14">
        <SectionLabel>{copy.label}</SectionLabel>
        <motion.h2 {...fadeUp} className="font-heading text-3xl md:text-4xl lg:text-5xl mb-4">
          {copy.title}
        </motion.h2>
        <motion.p
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.1 }}
          className="text-muted-foreground leading-relaxed"
        >
          {copy.intro}
        </motion.p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-10">
        <ul className="lg:col-span-2 grid sm:grid-cols-2 gap-x-6 gap-y-3">
          {copy.items.map((item, i) => (
            <motion.li
              key={item}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.05 * i }}
              className="flex items-start gap-3 border-b border-border pb-3 text-sm"
            >
              <Plus className="text-primary flex-shrink-0 mt-0.5" size={16} aria-hidden="true" />
              <span>{item}</span>
            </motion.li>
          ))}
        </ul>

        <motion.aside
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="bg-secondary/50 border border-border rounded-sm p-6"
        >
          <Users className="text-primary mb-3" size={22} aria-hidden="true" />
          <h3 className="font-heading text-xl mb-3">{copy.partnerTitle}</h3>
          <ul className="space-y-2 mb-4">
            {copy.partnerItems.map((item) => (
              <li key={item} className="text-sm">{item}</li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground leading-relaxed">{copy.partnerNote}</p>
        </motion.aside>
      </div>
    </div>
  </section>
);

export default OptionalServicesSection;
