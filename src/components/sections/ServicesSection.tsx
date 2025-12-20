import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check, Camera, Clock, Image, Users, BookOpen, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

interface ServicesSectionProps {
  isFullPage?: boolean;
}

const ServicesSection = ({ isFullPage = false }: ServicesSectionProps) => {
  const { t, language } = useLanguage();

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
    <section className={`section-padding ${isFullPage ? 'pt-32' : 'bg-background'}`}>
      <div className="container-wide">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl mb-4">
              {t('services.title')}
            </h2>
            <p className="text-muted-foreground italic">
              {t('services.availability')}
            </p>
          </motion.div>

          {/* Main Package */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-card border border-border rounded-sm p-8 md:p-12 mb-8"
          >
            <div className="text-center mb-8">
              <p className="text-muted-foreground text-sm uppercase tracking-wider mb-2">
                {language === 'en' ? 'Wedding Photography' : 'Fotografiere Nuntă'}
              </p>
              <p className="font-heading text-3xl md:text-4xl">
                {t('services.intro')}
              </p>
              <p className="text-muted-foreground mt-4">
                {t('services.includes')}
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center p-4 bg-secondary/50 rounded-sm"
                >
                  <feature.icon className="text-primary mb-2" size={24} />
                  <span className="text-sm">{feature.label}</span>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Button asChild variant="hero" size="lg">
                <Link to="/contact">{t('services.cta')}</Link>
              </Button>
            </div>
          </motion.div>

          {/* Extras */}
          {isFullPage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h3 className="font-heading text-2xl text-center mb-6">
                {t('services.extras.title')}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {extras.map((extra, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-4 border border-border rounded-sm"
                  >
                    <Check className="text-primary flex-shrink-0" size={18} />
                    <span className="text-sm">{extra.label}</span>
                  </div>
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
