import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { ChevronUp } from 'lucide-react';

const BackToTopButton = () => {
  const { t } = useLanguage();
  const { pathname } = useLocation();
  const isMobile = useIsMobile();
  const [showButton, setShowButton] = useState(false);

  // Only show on portfolio-related pages
  const isPortfolioPage = pathname.startsWith('/portfolio');

  useEffect(() => {
    if (!isPortfolioPage || !isMobile) {
      setShowButton(false);
      return;
    }

    const handleScroll = () => {
      // Show button after scrolling down 300px
      setShowButton(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial position

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isPortfolioPage, isMobile]);

  if (!showButton) return null;

  return (
    <div className="fixed bottom-6 right-4 z-50 md:hidden">
      <Button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        variant="secondary"
        size="sm"
        aria-label={t('portfolio.backToTop')}
        className="bg-foreground/10 backdrop-blur-sm hover:bg-foreground/20 gap-1"
      >
        <ChevronUp className="h-4 w-4" />
        {t('portfolio.backToTop')}
      </Button>
    </div>
  );
};

export default BackToTopButton;
