import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface FAQSectionProps {
  isFullPage?: boolean;
}

const FAQSection = ({ isFullPage = false }: FAQSectionProps) => {
  const { t, language } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'center center'],
  });

  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };

  const headerY = useSpring(
    useTransform(scrollYProgress, [0, 0.5], [40, 0]),
    springConfig
  );

  const faqs = [
    { q: t('faq.q1'), a: t('faq.a1') },
    { q: t('faq.q2'), a: t('faq.a2') },
    { q: t('faq.q3'), a: t('faq.a3') },
    { q: t('faq.q4'), a: t('faq.a4') },
  ];

  const additionalFaqs = language === 'en' 
    ? [
        { 
          q: 'Do you offer other services (video, albums, prints)?', 
          a: 'I focus exclusively on photography, but I’m happy to recommend trusted videographers. Albums, prints, and other options can be discussed on request.' 
        },
        { 
          q: 'What if we don’t feel comfortable in front of the camera?', 
          a: 'That’s completely normal. Most couples aren’t used to being photographed. My role is to create a relaxed environment, without pressure or forced moments, so things can unfold naturally.' 
        },
        { 
          q: 'Do you photograph weddings outside of Cluj?', 
          a: 'Yes. I photograph weddings in Cluj-Napoca, throughout Transylvania, and beyond. Travel fees may apply for more distant locations.' 
        },
      ]
    : [
        { 
          q: 'Oferi și alte servicii (video, albume, printuri)?', 
          a: 'Mă concentrez exclusiv pe fotografie, dar partea video este realizată de videografi de încredere, prieteni apropiați, cu care sunt obișnuit să lucrez. Albumele, printurile sau alte opțiuni pot fi discutate la cerere.' 
        },
        { 
          q: 'Ce se întâmplă dacă nu ne simțim confortabil în fața camerei?', 
          a: 'Este absolut normal. Majoritatea cuplurilor nu sunt obișnuite să fie fotografiate. Rolul meu este să creez un cadru relaxat, fără presiune sau momente forțate, astfel încât lucrurile să se întâmple natural.' 
        },
        { 
          q: 'Te deplasezi și în afara Clujului?', 
          a: 'Da. Mă deplasez și în alte zone. Pentru locații mai îndepărtate pot apărea costuri de deplasare.' 
        },
     
      ];

  const allFaqs = isFullPage ? [...faqs, ...additionalFaqs] : faqs;

  return (
    <section ref={sectionRef} className={`section-padding ${isFullPage ? 'pt-32' : 'bg-background'} overflow-hidden`}>
      <div className="container-narrow">
        {/* Header */}
        <motion.div
          style={{ y: headerY }}
          className="text-center mb-12"
        >
          <motion.h2 
            className="font-heading text-4xl md:text-5xl lg:text-6xl mb-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {t('faq.title')}
          </motion.h2>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="w-full">
            {allFaqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <AccordionItem value={`item-${index}`}>
                  <AccordionTrigger className="text-left font-heading text-lg hover:text-primary">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Button asChild variant="hero" size="lg">
            <Link to="/contact">{t('faq.cta')}</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
