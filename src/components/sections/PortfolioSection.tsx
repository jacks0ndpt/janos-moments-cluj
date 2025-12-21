import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

import portfolio1 from '@/assets/portfolio-1.jpg';
import portfolio2 from '@/assets/portfolio-2.jpg';
import portfolio3 from '@/assets/portfolio-3.jpg';
import portfolio4 from '@/assets/portfolio-4.jpg';
import portfolio5 from '@/assets/portfolio-5.jpg';
import portfolioEvent from '@/assets/portfolio-event.jpg';

interface PortfolioImage {
  id: number;
  src: string;
  alt: string;
  category: 'weddings' | 'events' | 'couples';
  aspectRatio: 'portrait' | 'landscape';
}

const portfolioImages: PortfolioImage[] = [
  { id: 1, src: portfolio1, alt: 'Bride getting ready by window', category: 'weddings', aspectRatio: 'portrait' },
  { id: 2, src: portfolio2, alt: 'First look moment', category: 'weddings', aspectRatio: 'landscape' },
  { id: 3, src: portfolio3, alt: 'Reception dancing', category: 'weddings', aspectRatio: 'landscape' },
  { id: 4, src: portfolio4, alt: 'Couple walking in autumn forest', category: 'couples', aspectRatio: 'portrait' },
  { id: 5, src: portfolio5, alt: 'Wedding ceremony moment', category: 'weddings', aspectRatio: 'portrait' },
  { id: 6, src: portfolioEvent, alt: 'Corporate event', category: 'events', aspectRatio: 'landscape' },
];

interface PortfolioSectionProps {
  showFilters?: boolean;
  limit?: number;
}

// Individual image component with parallax
const PortfolioImageCard = ({ 
  image, 
  index 
}: { 
  image: PortfolioImage; 
  index: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  
  // Subtle parallax for each image
  const y = useSpring(
    useTransform(scrollYProgress, [0, 1], [30, -30]),
    springConfig
  );
  
  const scale = useSpring(
    useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.98]),
    springConfig
  );

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
      style={{ scale }}
      className={`group relative overflow-hidden rounded-sm cursor-pointer ${
        image.aspectRatio === 'portrait' ? 'row-span-2' : ''
      }`}
    >
      <motion.div 
        className={`relative ${image.aspectRatio === 'portrait' ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}
        style={{ y }}
      >
        <img
          src={image.src}
          alt={image.alt}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <motion.div 
          className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors duration-500" 
          whileHover={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
        />
      </motion.div>
    </motion.div>
  );
};

const PortfolioSection = ({ showFilters = true, limit }: PortfolioSectionProps) => {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<'all' | 'weddings' | 'events' | 'couples'>('all');
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const headerY = useSpring(
    useTransform(scrollYProgress, [0, 0.3], [50, 0]),
    { stiffness: 100, damping: 30 }
  );

  const filters = [
    { id: 'all' as const, label: t('portfolio.filter.all') },
    { id: 'weddings' as const, label: t('portfolio.filter.weddings') },
    { id: 'events' as const, label: t('portfolio.filter.events') },
    { id: 'couples' as const, label: t('portfolio.filter.couples') },
  ];

  const filteredImages = activeFilter === 'all' 
    ? portfolioImages 
    : portfolioImages.filter(img => img.category === activeFilter);

  const displayImages = limit ? filteredImages.slice(0, limit) : filteredImages;

  return (
    <section ref={sectionRef} className="section-padding bg-background">
      <div className="container-wide">
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
            {t('portfolio.title')}
          </motion.h2>
          <motion.p 
            className="text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {t('portfolio.intro')}
          </motion.p>
        </motion.div>

        {/* Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-2 mb-12"
          >
            {filters.map((filter, index) => (
              <motion.button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`px-6 py-2 text-sm transition-all duration-300 rounded-sm ${
                  activeFilter === filter.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {filter.label}
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {displayImages.map((image, index) => (
            <PortfolioImageCard key={image.id} image={image} index={index} />
          ))}
        </div>

        {/* CTA */}
        {limit && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-12"
          >
            <Button asChild variant="outline" size="lg">
              <Link to="/portfolio">{t('portfolio.cta')}</Link>
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default PortfolioSection;
