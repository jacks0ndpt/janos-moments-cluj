import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { SectionLabel, fadeUp } from './shared';
import type { ServicesContent } from '@/content/servicesPage';

/** Compact additional services + FAQ accordion in one calm section. */
const ExtrasFaqSection = ({
  extras,
  faq,
}: {
  extras?: ServicesContent['extras'];
  faq?: ServicesContent['faq'];
}) => (
  <section className="section-padding overflow-hidden">
    <div className="container-narrow space-y-14 md:space-y-20">
      {extras && (
        <div id="extras" className="scroll-mt-32">
          <SectionLabel>{extras.label}</SectionLabel>
          <motion.h2 {...fadeUp} className="font-heading text-3xl md:text-4xl mb-4">
            {extras.title}
          </motion.h2>
          <motion.p
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.08 }}
            className="text-muted-foreground leading-relaxed mb-6"
          >
            {extras.intro}
          </motion.p>
          <motion.ul
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.12 }}
            className="grid sm:grid-cols-2 gap-x-8 gap-y-2 mb-5"
          >
            {extras.items.map((item) => (
              <li
                key={item}
                className="text-sm border-b border-border/60 py-2 flex items-start gap-2"
              >
                <span aria-hidden="true" className="text-primary/60">
                  —
                </span>
                <span>{item}</span>
              </li>
            ))}
          </motion.ul>
          <motion.p
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.16 }}
            className="text-xs text-muted-foreground italic leading-relaxed"
          >
            {extras.partnerNote}
          </motion.p>
        </div>
      )}

      {faq && (
        <div id="faq" className="scroll-mt-32">
          <SectionLabel>{faq.label}</SectionLabel>
          <motion.h2 {...fadeUp} className="font-heading text-3xl md:text-4xl mb-6">
            {faq.title}
          </motion.h2>
          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.08 }}>
            <Accordion type="single" collapsible className="w-full">
              {faq.items.map((item, index) => (
                <AccordionItem key={item.q} value={`faq-${index}`}>
                  <AccordionTrigger className="text-left font-heading text-lg hover:text-primary">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      )}
    </div>
  </section>
);

export default ExtrasFaqSection;
