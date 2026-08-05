import { motion } from 'framer-motion';
import { Images, Lock, Share2, Maximize2, Printer, ShieldCheck } from 'lucide-react';
import { SectionLabel, fadeUp } from './shared';
import type { ServicesCopy } from '@/content/servicesPreview';

const ICONS = [Images, Lock, Share2, Maximize2, Printer, ShieldCheck];

const DeliverablesSection = ({ copy }: { copy: ServicesCopy['deliverables'] }) => (
  <section className="section-padding bg-card overflow-hidden">
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
          {copy.body}
        </motion.p>
      </div>

      <ul className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {copy.items.map((item, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <motion.li
              key={item}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.07 * i }}
              whileHover={{ y: -4 }}
              className="bg-background border border-border rounded-sm p-5 md:p-6 flex flex-col gap-3"
            >
              <Icon className="text-primary" size={22} aria-hidden="true" />
              <span className="text-sm md:text-base">{item}</span>
            </motion.li>
          );
        })}
      </ul>
    </div>
  </section>
);

export default DeliverablesSection;
