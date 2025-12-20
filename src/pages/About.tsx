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
            ? 'About | Janos Hada Photography'
            : 'Despre | Janos Hada Photography'
          }
        </title>
        <meta 
          name="description" 
          content={language === 'en'
            ? 'Meet Janos Hada, a Cluj-based wedding photographer who values real moments over posed pictures. Documentary style, natural approach.'
            : 'Cunoaște-l pe Janos Hada, fotograf de nuntă din Cluj-Napoca care prețuiește momentele reale mai mult decât pozele regizate.'
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
