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
            ? 'Portfolio | Janos Hada Photography'
            : 'Portofoliu | Janos Hada Photography'
          }
        </title>
        <meta 
          name="description" 
          content={language === 'en'
            ? 'Browse wedding and event photography portfolio. Documentary style, natural moments, authentic emotions captured in Transylvania.'
            : 'Vezi portofoliul de fotografie de nuntă și evenimente. Stil documentar, momente naturale, emoții autentice surprinse în Transilvania.'
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
