import { useState, useEffect, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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

// Optimized image component - no per-image scroll listeners
const PortfolioImageCard = memo(({ 
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
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);

  // Use native IntersectionObserver for better performance
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px', threshold: 0.01 }
    );

    const element = document.getElementById(`portfolio-img-${image.id}`);
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, [image.id]);

  // Stagger animation within batches of 6 for faster perceived load
  const batchIndex = index % 6;
  const animationDelay = batchIndex * 0.05;

  return (
    <motion.div
      id={`portfolio-img-${image.id}`}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.4, delay: animationDelay, ease: 'easeOut' }}
      onClick={onClick}
      className={`group relative overflow-hidden rounded-sm cursor-pointer ${
        image.aspectRatio === 'portrait' ? 'row-span-2' : ''
      }`}
    >
      {/* Fixed aspect ratio container prevents CLS */}
      <div 
        className={`relative ${image.aspectRatio === 'portrait' ? 'aspect-[3/4]' : 'aspect-[4/3]'} bg-muted`}
      >
        {/* Placeholder skeleton */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
        
        {isInView && (
          <img
            src={`/portfolio/${image.filename}`}
            alt={altText}
            width={image.aspectRatio === 'portrait' ? 600 : 800}
            height={image.aspectRatio === 'portrait' ? 800 : 600}
            onLoad={() => setIsLoaded(true)}
            decoding="async"
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
            fetchPriority={index < 6 ? 'high' : 'low'}
          />
        )}
        
        {/* Hover overlay - CSS only, no motion */}
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors duration-300" />
      </div>
    </motion.div>
  );
});

PortfolioImageCard.displayName = 'PortfolioImageCard';

const PortfolioSection = ({ showFilters = true, limit }: PortfolioSectionProps) => {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<'all' | 'weddings' | 'events' | 'couples'>('all');
  const [portfolioImages, setPortfolioImages] = useState<PortfolioImage[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleFilterClick = useCallback((filterId: 'all' | 'weddings' | 'events' | 'couples') => {
    setActiveFilter(filterId);
  }, []);

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
      <section className="section-padding bg-background">
        <div className="container-wide">
          {/* Header - simplified animation */}
          <div className="text-center mb-12">
            <motion.h2 
              className="font-heading text-4xl md:text-5xl lg:text-6xl mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {t('portfolio.title')}
            </motion.h2>
            <motion.p 
              className="text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {t('portfolio.intro')}
            </motion.p>
          </div>

          {/* Filters - simplified, no per-button animation */}
          {showFilters && (
            <div className="flex flex-wrap justify-center gap-2 mb-12">
              {visibleFilters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => handleFilterClick(filter.id)}
                  className={`px-6 py-2 text-sm transition-all duration-200 rounded-sm hover:scale-105 active:scale-95 ${
                    activeFilter === filter.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
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
