import { motion } from 'framer-motion';
import { SectionLabel, fadeUp } from './shared';
import type { ServicesCopy } from '@/content/servicesPreview';

const ProcessSection = ({ copy }: { copy: ServicesCopy['process'] }) => (
  <section className="section-padding overflow-hidden">
    <div className="container-wide">
      <div className="max-w-2xl mb-12 md:mb-16">
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

      <div className="grid md:grid-cols-3 gap-8 md:gap-10">
        {copy.steps.map((step, i) => (
          <motion.div
            key={step.step}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, delay: 0.12 * i }}
            className="border-t border-border pt-6"
          >
            <p className="font-heading text-3xl text-primary/60 mb-2">{step.step}</p>
            <h3 className="font-heading text-xl md:text-2xl mb-4">{step.title}</h3>
            <ul className="space-y-3">
              {step.items.map((item) => (
                <li key={item} className="text-sm text-muted-foreground leading-relaxed flex gap-3">
                  <span aria-hidden="true" className="text-primary">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default ProcessSection;
