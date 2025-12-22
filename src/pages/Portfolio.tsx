import { Helmet } from 'react-helmet-async';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PortfolioSection from '@/components/sections/PortfolioSection';

const Portfolio = () => {
  const { language } = useLanguage();

  return (
    <>
      <Helmet>
        <title>
          {language === 'en' 
            ? 'Wedding Photography Portfolio | Cluj-Napoca'
            : 'Portofoliu Fotograf Nuntă | Cluj-Napoca'
          }
        </title>
        <meta 
          name="description" 
          content={language === 'en'
            ? 'Explore documentary wedding and event photography from Cluj-Napoca. Real emotions, natural moments, honest storytelling.'
            : 'Descoperă fotografii de nuntă și evenimente din Cluj-Napoca. Emoții reale, stil documentar, povești autentice.'
          }
        />
      </Helmet>

      <Header />
      
      <main className="pt-24 min-h-screen">
        <PortfolioSection showFilters={true} />
      </main>

      <Footer />
    </>
  );
};

export default Portfolio;
