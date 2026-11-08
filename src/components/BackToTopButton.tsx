import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { ChevronUp } from 'lucide-react';

const BackToTopButton = ({ enabled }: { enabled?: boolean }) => {
  const { t } = useLanguage();
  const { pathname } = useLocation();
  const isMobile = useIsMobile();
  const [showButton, setShowButton] = useState(false);

  // Portfolio remains the default; other pages can explicitly reuse the control.
  const isEnabled = enabled ?? pathname.startsWith('/portfolio');

  useEffect(() => {
    if (!isEnabled || !isMobile) {
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
  }, [isEnabled, isMobile]);

  if (!showButton) return null;

  return (
    <div className="fixed bottom-6 right-4 z-50 md:hidden">
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label={t('portfolio.backToTop')}
        className="h-10 w-10 rounded-full bg-foreground text-background shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
      >
        <ChevronUp className="h-5 w-5" />
      </button>
    </div>
  );
};

export default BackToTopButton;
