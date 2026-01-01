import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import Lightbox from '@/components/ui/lightbox';
import { useLightbox } from '@/hooks/useLightbox';

interface PortfolioImage {
  id: number;
  filename: string;
  alt: string;
  category: 'weddings' | 'events' | 'couples';
  aspectRatio: 'portrait' | 'landscape';
}

interface PortfolioSectionProps {
  showFilters?: boolean;
  limit?: number;
}

// Individual image component with parallax
const PortfolioImageCard = ({ 
  image, 
  index,
  onClick,
  altText
}: { 
  image: PortfolioImage; 
  index: number;
  onClick: () => void;
  altText: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  
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
      onClick={onClick}
      className={`group relative overflow-hidden rounded-sm cursor-pointer ${
        image.aspectRatio === 'portrait' ? 'row-span-2' : ''
      }`}
    >
      <motion.div 
        className={`relative ${image.aspectRatio === 'portrait' ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}
        style={{ y }}
      >
        <img
          src={`/portfolio/${image.filename}`}
          alt={altText}
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
  const [portfolioImages, setPortfolioImages] = useState<PortfolioImage[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);

  // Load images from JSON config
  useEffect(() => {
    fetch('/portfolio/images.json')
      .then(res => res.json())
      .then(data => {
        setPortfolioImages(data.images || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load portfolio images:', err);
        setLoading(false);
      });
  }, []);

  const filteredImages = activeFilter === 'all' 
    ? portfolioImages 
    : portfolioImages.filter(img => img.category === activeFilter);

  const displayImages = limit ? filteredImages.slice(0, limit) : filteredImages;

  const altText = t('portfolio.imageAlt');

  const { isOpen, currentIndex, openLightbox, closeLightbox, nextImage, previousImage } = useLightbox(displayImages.length);

  const lightboxImages = displayImages.map(img => ({
    src: `/portfolio/${img.filename}`,
    alt: altText
  }));

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

  // Filters to display (hidden: couples)
  const visibleFilters = filters.filter(f => f.id !== 'couples');

  return (
    <>
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
              {visibleFilters.map((filter, index) => (
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
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-[4/3] bg-muted animate-pulse rounded-sm" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {displayImages.map((image, index) => (
                <PortfolioImageCard 
                  key={image.id} 
                  image={image} 
                  index={index} 
                  onClick={() => openLightbox(index)}
                  altText={altText}
                />
              ))}
            </div>
          )}

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

      <Lightbox
        images={lightboxImages}
        currentIndex={currentIndex}
        isOpen={isOpen}
        onClose={closeLightbox}
        onNext={nextImage}
        onPrevious={previousImage}
      />
    </>
  );
};

export default PortfolioSection;
