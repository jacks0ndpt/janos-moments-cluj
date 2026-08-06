import { motion } from 'framer-motion';
import { Disclosure, SectionLabel, fadeUp } from './shared';
import type { ServicesContent } from '@/content/servicesPage';

const ProcessSection = ({ copy }: { copy: ServicesContent['process'] }) => (
  <section id="process" className="section-padding scroll-mt-32 overflow-hidden">
    <div className="container-wide">
      <div className="max-w-2xl mb-10 md:mb-12">
        <SectionLabel>{copy.label}</SectionLabel>
        <motion.h2 {...fadeUp} className="font-heading text-3xl md:text-4xl">
          {copy.title}
        </motion.h2>
      </div>

      <ol className="grid md:grid-cols-3 gap-6 lg:gap-8">
        {copy.steps.map((step, i) => (
          <motion.li
            key={step.step}
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.08 * i }}
            className="bg-card border border-border rounded-sm p-6"
          >
            <p className="font-heading text-2xl text-primary/60 mb-3">{step.step}</p>
            <h3 className="font-heading text-xl mb-2">{step.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{step.body}</p>
          </motion.li>
        ))}
      </ol>

      {copy.detailsItems.length > 0 && (
        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.2 }}
          className="max-w-2xl mt-10"
        >
          <Disclosure label={copy.detailsLabel}>
            <ul className="flex flex-wrap gap-2">
              {copy.detailsItems.map((item) => (
                <li
                  key={item}
                  className="border border-border rounded-full px-4 py-1.5 text-xs md:text-sm text-muted-foreground"
                >
                  {item}
                </li>
              ))}
            </ul>
          </Disclosure>
        </motion.div>
      )}
    </div>
  </section>
);

export default ProcessSection;
