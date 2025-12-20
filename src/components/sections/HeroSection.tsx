import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/hero-wedding.jpg';

const HeroSection = () => {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Wedding photography by Janos Hada"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 hero-gradient" />
      </div>

      {/* Content */}
      <div className="relative z-10 container-wide px-6 lg:px-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-background leading-tight mb-6">
            {t('hero.title')}
          </h1>
          
          <p className="font-heading text-xl md:text-2xl text-background/90 italic mb-6">
            {t('hero.subtitle')}
          </p>
          
          <p className="text-background/80 text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            {t('hero.body')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild variant="hero-light" size="lg">
              <Link to="/contact">{t('hero.cta.primary')}</Link>
            </Button>
            <Button asChild variant="hero-outline" size="lg" className="border-background/30 text-background hover:bg-background hover:text-foreground">
              <Link to="/portfolio">{t('hero.cta.secondary')}</Link>
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ArrowDown className="text-background/60" size={24} />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
