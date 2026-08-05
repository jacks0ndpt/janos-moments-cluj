import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { SectionLabel, fadeUp } from './shared';
import type { ServicesCopy } from '@/content/servicesPreview';

/** Preview-only FAQ. The live FAQSection is untouched. */
const FAQSection = ({ copy }: { copy: ServicesCopy['faq'] }) => (
  <section className="section-padding bg-card overflow-hidden">
    <div className="container-narrow">
      <div className="text-center mb-10 md:mb-12">
        <SectionLabel>{copy.label}</SectionLabel>
        <motion.h2 {...fadeUp} className="font-heading text-3xl md:text-4xl lg:text-5xl">
          {copy.title}
        </motion.h2>
      </div>

      <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}>
        <Accordion type="single" collapsible className="w-full">
          {copy.items.map((faq, index) => (
            <AccordionItem key={faq.q} value={`faq-${index}`}>
              <AccordionTrigger className="text-left font-heading text-lg hover:text-primary">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>
    </div>
  </section>
);

export default FAQSection;
