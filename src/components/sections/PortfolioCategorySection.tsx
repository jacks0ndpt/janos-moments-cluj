import { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
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

const PortfolioCategorySection = ({ category }: PortfolioCategorySectionProps) => {
  const { t } = useLanguage();
  const [portfolioImages, setPortfolioImages] = useState<PortfolioImage[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);

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
      <section ref={sectionRef} className="section-padding bg-background">
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
