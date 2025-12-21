import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useRef } from 'react';
import { Check, Camera, Clock, Image, Users, BookOpen, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

interface ServicesSectionProps {
  isFullPage?: boolean;
}

const ServicesSection = ({ isFullPage = false }: ServicesSectionProps) => {
  const { t, language } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const { scrollYProgress: cardScrollProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'center center'],
  });

  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };

  const headerY = useSpring(
    useTransform(scrollYProgress, [0, 0.3], [50, 0]),
    springConfig
  );

  const cardScale = useSpring(
    useTransform(cardScrollProgress, [0, 1], [0.9, 1]),
    springConfig
  );

  const cardY = useSpring(
    useTransform(cardScrollProgress, [0, 1], [80, 0]),
    springConfig
  );

  const extras = [
    { icon: Users, label: t('services.extras.second') },
    { icon: Clock, label: t('services.extras.hours') },
    { icon: Camera, label: t('services.extras.engagement') },
    { icon: BookOpen, label: t('services.extras.album') },
  ];

  const features = [
    { icon: Image, label: language === 'en' ? 'Full day coverage' : 'Acoperire întreaga zi' },
    { icon: Sparkles, label: language === 'en' ? 'Professional editing' : 'Editare profesională' },
    { icon: Camera, label: language === 'en' ? 'Online gallery' : 'Galerie online' },
    { icon: Clock, label: language === 'en' ? '6 weeks delivery' : 'Livrare în 6 săptămâni' },
  ];

  return (
    <section ref={sectionRef} className={`section-padding ${isFullPage ? 'pt-32' : 'bg-background'} overflow-hidden`}>
      <div className="container-wide">
        <div className="max-w-4xl mx-auto">
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
              {t('services.title')}
            </motion.h2>
            <motion.p 
              className="text-muted-foreground italic"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {t('services.availability')}
            </motion.p>
          </motion.div>

          {/* Main Package */}
          <motion.div
            ref={cardRef}
            style={{ scale: cardScale, y: cardY }}
            className="bg-card border border-border rounded-sm p-8 md:p-12 mb-8"
          >
            <div className="text-center mb-8">
              <motion.p 
                className="text-muted-foreground text-sm uppercase tracking-wider mb-2"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                {language === 'en' ? 'Wedding Photography' : 'Fotografiere Nuntă'}
              </motion.p>
              <motion.p 
                className="font-heading text-3xl md:text-4xl"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                {t('services.intro')}
              </motion.p>
              <motion.p 
                className="text-muted-foreground mt-4"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {t('services.includes')}
              </motion.p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="flex flex-col items-center text-center p-4 bg-secondary/50 rounded-sm"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.2 + 0.1 * index, type: 'spring' }}
                  >
                    <feature.icon className="text-primary mb-2" size={24} />
                  </motion.div>
                  <span className="text-sm">{feature.label}</span>
                </motion.div>
              ))}
            </div>

            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Button asChild variant="hero" size="lg">
                <Link to="/contact">{t('services.cta')}</Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Extras */}
          {isFullPage && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h3 className="font-heading text-2xl text-center mb-6">
                {t('services.extras.title')}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {extras.map((extra, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-3 p-4 border border-border rounded-sm"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.3 + 0.1 * index, type: 'spring' }}
                    >
                      <Check className="text-primary flex-shrink-0" size={18} />
                    </motion.div>
                    <span className="text-sm">{extra.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
