import { Helmet } from 'react-helmet-async';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AboutSection from '@/components/sections/AboutSection';
import PortfolioSection from '@/components/sections/PortfolioSection';

const About = () => {
  const { language } = useLanguage();

  return (
    <>
      <Helmet>
        <title>
          {language === 'en' 
            ? 'About Janos Hada | Wedding Photographer Cluj'
            : 'Despre Janos Hada | Fotograf Nuntă Cluj'
          }
        </title>
        <meta 
          name="description" 
          content={language === 'en'
            ? 'Meet Janos Hada, a Cluj-based wedding photographer focused on real moments, natural light and honest storytelling.'
            : 'Janos Hada, fotograf de nuntă din Cluj-Napoca, specializat în momente reale și fotografie documentară.'
          }
        />
      </Helmet>

      <Header />
      
      <main className="min-h-screen">
        <AboutSection isFullPage={true} />
        <PortfolioSection showFilters={false} limit={3} />
      </main>

      <Footer />
    </>
  );
};

export default About;
