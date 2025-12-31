import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/fotograf-nunta-cluj-emotii-miri.jpg';
import { useRef } from 'react';

const HeroSection = () => {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  
  // Parallax effect for background image
  const imageY = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, 150]),
    springConfig
  );
  
  // Content fades and moves up as user scrolls
  const contentY = useSpring(
    useTransform(scrollYProgress, [0, 0.5], [0, -50]),
    springConfig
  );
  const contentOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  
  // Scale effect for depth
  const imageScale = useSpring(
    useTransform(scrollYProgress, [0, 1], [1, 1.1]),
    springConfig
  );

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Parallax */}
      <motion.div 
        className="absolute inset-0 z-0"
        style={{ y: imageY, scale: imageScale }}
      >
        <img
          src={heroImage}
          alt={t('portfolio.imageAlt')}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 hero-gradient" />
      </motion.div>

      {/* Content with scroll animation */}
      <motion.div 
        className="relative z-10 container-wide px-6 lg:px-12 text-center"
        style={{ y: contentY, opacity: contentOpacity }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <motion.h1 
            className="font-heading text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-background leading-tight mb-6"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            {t('hero.title')}
          </motion.h1>
          
          <motion.p 
            className="font-heading text-xl md:text-2xl text-background/90 italic mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            {t('hero.subtitle')}
          </motion.p>
          
          <motion.p 
            className="text-background/80 text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            {t('hero.body')}
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            <Button asChild variant="hero-light" size="lg">
              <Link to="/contact">{t('hero.cta.primary')}</Link>
            </Button>
            <Button asChild variant="hero-outline" size="lg" className="border-background/30 text-background hover:bg-background hover:text-foreground">
              <Link to="/portfolio">{t('hero.cta.secondary')}</Link>
            </Button> 
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        style={{ opacity: contentOpacity }}
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
