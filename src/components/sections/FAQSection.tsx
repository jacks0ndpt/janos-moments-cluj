import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
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

  const faqs = [
    { q: t('faq.q1'), a: t('faq.a1') },
    { q: t('faq.q2'), a: t('faq.a2') },
    { q: t('faq.q3'), a: t('faq.a3') },
    { q: t('faq.q4'), a: t('faq.a4') },
  ];

  const additionalFaqs = language === 'en' 
    ? [
        { 
          q: 'What if it rains on our wedding day?', 
          a: 'Rain can create some of the most beautiful and intimate wedding photos. I always have backup plans and indoor options prepared. Some of my favorite images were captured during rainy days.' 
        },
        { 
          q: 'How many photos will we receive?', 
          a: 'Typically 400-600 images for a full wedding day. I believe in quality over quantity — every image is carefully selected and edited.' 
        },
        { 
          q: 'Do you offer videography?', 
          a: 'I work exclusively in photography, but I can recommend trusted videographers who share my documentary approach.' 
        },
      ]
    : [
        { 
          q: 'Ce se întâmplă dacă plouă în ziua nunții?', 
          a: 'Ploaia poate crea unele dintre cele mai frumoase și intime fotografii de nuntă. Am întotdeauna planuri de rezervă și opțiuni în interior pregătite. Unele dintre imaginile mele preferate au fost surprinse în zile ploioase.' 
        },
        { 
          q: 'Câte fotografii vom primi?', 
          a: 'De obicei 400-600 de imagini pentru o zi completă de nuntă. Cred în calitate, nu în cantitate — fiecare imagine este atent selectată și editată.' 
        },
        { 
          q: 'Oferi și videografie?', 
          a: 'Lucrez exclusiv în fotografie, dar pot recomanda videografi de încredere care împărtășesc abordarea mea documentară.' 
        },
      ];

  const allFaqs = isFullPage ? [...faqs, ...additionalFaqs] : faqs;

  return (
    <section className={`section-padding ${isFullPage ? 'pt-32' : 'bg-background'}`}>
      <div className="container-narrow">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl mb-4">
            {t('faq.title')}
          </h2>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="w-full">
            {allFaqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
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

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
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
