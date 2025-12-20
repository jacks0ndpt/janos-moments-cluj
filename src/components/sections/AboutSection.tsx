import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import aboutImage from '@/assets/about-janos.jpg';

interface AboutSectionProps {
  isFullPage?: boolean;
}

const AboutSection = ({ isFullPage = false }: AboutSectionProps) => {
  const { t } = useLanguage();

  return (
    <section className={`section-padding ${isFullPage ? 'pt-32' : 'bg-card'}`}>
      <div className="container-wide">
        <div className={`grid ${isFullPage ? 'lg:grid-cols-2' : 'lg:grid-cols-5'} gap-12 lg:gap-16 items-center`}>
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className={isFullPage ? '' : 'lg:col-span-2'}
          >
            <div className="relative">
              <img
                src={aboutImage}
                alt="Janos Hada - Wedding Photographer"
                className="w-full rounded-sm shadow-lg"
              />
              <div className="absolute -bottom-4 -right-4 w-24 h-24 md:w-32 md:h-32 bg-primary/10 rounded-sm -z-10" />
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={isFullPage ? '' : 'lg:col-span-3'}
          >
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl mb-6">
              {t('about.title')}
            </h2>
            
            <p className="text-lg md:text-xl text-foreground mb-4 leading-relaxed">
              {t('about.intro')}
            </p>
            
            <p className="text-muted-foreground mb-8 leading-relaxed">
              {t('about.body')}
            </p>

            {isFullPage && (
              <div className="border-l-2 border-primary/30 pl-6 mb-8">
                <h3 className="font-heading text-2xl mb-3">{t('about.philosophy.title')}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t('about.philosophy.body')}
                </p>
              </div>
            )}

            {!isFullPage && (
              <Button asChild variant="outline">
                <Link to="/about">{t('about.cta')}</Link>
              </Button>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
