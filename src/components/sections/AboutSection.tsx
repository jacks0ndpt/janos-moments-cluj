import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import aboutImage from '@/assets/about-janos.jpg';

interface AboutSectionProps {
  isFullPage?: boolean;
}

const AboutSection = ({ isFullPage = false }: AboutSectionProps) => {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const { scrollYProgress: imageScrollProgress } = useScroll({
    target: imageRef,
    offset: ['start end', 'end start'],
  });

  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };

  // Parallax for image
  const imageY = useSpring(
    useTransform(imageScrollProgress, [0, 1], [60, -60]),
    springConfig
  );

  const imageScale = useSpring(
    useTransform(imageScrollProgress, [0, 0.5, 1], [0.9, 1, 0.95]),
    springConfig
  );

  // Text reveal animation
  const textY = useSpring(
    useTransform(scrollYProgress, [0.1, 0.4], [40, 0]),
    springConfig
  );

  const textOpacity = useTransform(scrollYProgress, [0.1, 0.3], [0, 1]);

  // Decorative element animation
  const decorY = useSpring(
    useTransform(imageScrollProgress, [0, 1], [80, -40]),
    springConfig
  );

  return (
    <section ref={sectionRef} className={`section-padding ${isFullPage ? 'pt-32' : 'bg-card'} overflow-hidden`}>
      <div className="container-wide">
        <div className={`grid ${isFullPage ? 'lg:grid-cols-2' : 'lg:grid-cols-5'} gap-12 lg:gap-16 items-center`}>
          {/* Image */}
          <motion.div
            ref={imageRef}
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
            className={isFullPage ? '' : 'lg:col-span-2'}
          >
            <div className="relative">
              <motion.div style={{ y: imageY, scale: imageScale }}>
                <img
                  src={aboutImage}
                  alt="Janos Hada - Wedding Photographer"
                  className="w-full rounded-sm shadow-lg"
                />
              </motion.div>
              <motion.div 
                className="absolute -bottom-4 -right-4 w-24 h-24 md:w-32 md:h-32 bg-primary/10 rounded-sm -z-10"
                style={{ y: decorY }}
              />
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            style={{ y: textY, opacity: textOpacity }}
            className={isFullPage ? '' : 'lg:col-span-3'}
          >
            <motion.h2 
              className="font-heading text-4xl md:text-5xl lg:text-6xl mb-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {t('about.title')}
            </motion.h2>
            
            <motion.p 
              className="text-lg md:text-xl text-foreground mb-4 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {t('about.intro')}
            </motion.p>
            
            <motion.p 
              className="text-muted-foreground mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {t('about.body')}
            </motion.p>

            {isFullPage && (
              <motion.div 
                className="border-l-2 border-primary/30 pl-6 mb-8"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <h3 className="font-heading text-2xl mb-3">{t('about.philosophy.title')}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t('about.philosophy.body')}
                </p>
              </motion.div>
            )}

            {!isFullPage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Button asChild variant="outline">
                  <Link to="/about">{t('about.cta')}</Link>
                </Button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
