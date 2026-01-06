import { useState, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import Lightbox from '@/components/ui/lightbox';
import { useLightbox } from '@/hooks/useLightbox';

interface PortfolioImage {
  id: number;
  filename: string;
  alt: string;
  category: 'weddings' | 'events' | 'couples';
  aspectRatio: 'portrait' | 'landscape';
}

interface PortfolioCategorySectionProps {
  category: 'weddings' | 'events' | 'couples';
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

    const element = document.getElementById(`category-img-${image.id}`);
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, [image.id]);

  // Stagger animation within batches of 6 for faster perceived load
  const batchIndex = index % 6;
  const animationDelay = batchIndex * 0.05;

  return (
    <motion.div
      id={`category-img-${image.id}`}
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

const PortfolioCategorySection = ({ category }: PortfolioCategorySectionProps) => {
  const { t } = useLanguage();
  const [portfolioImages, setPortfolioImages] = useState<PortfolioImage[]>([]);
  const [loading, setLoading] = useState(true);

  // Load images from JSON config
  useEffect(() => {
    fetch('/portfolio/images.json')
      .then(res => res.json())
      .then(data => {
        const filtered = (data.images || []).filter(
          (img: PortfolioImage) => img.category === category
        );
        setPortfolioImages(filtered);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load portfolio images:', err);
        setLoading(false);
      });
  }, [category]);

  const altText = t('portfolio.imageAlt');

  const { isOpen, currentIndex, openLightbox, closeLightbox, nextImage, previousImage } = useLightbox(portfolioImages.length);

  const lightboxImages = portfolioImages.map(img => ({
    src: `/portfolio/${img.filename}`,
    alt: altText
  }));

  return (
    <>
      <section className="section-padding bg-background">
        <div className="container-wide">
          {/* Gallery Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-[4/3] bg-muted animate-pulse rounded-sm" />
              ))}
            </div>
          ) : portfolioImages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t('portfolio.noImages')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {portfolioImages.map((image, index) => (
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

export default PortfolioCategorySection;
