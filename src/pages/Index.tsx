import { Helmet } from 'react-helmet-async';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/sections/HeroSection';
import PortfolioSection from '@/components/sections/PortfolioSection';
import AboutSection from '@/components/sections/AboutSection';
import ServicesSection from '@/components/sections/ServicesSection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import FAQSection from '@/components/sections/FAQSection';
import ContactForm from '@/components/sections/ContactForm';

const Index = () => {
  const { language } = useLanguage();

  return (
    <>
      <Helmet>
        <title>
          {language === 'en' 
            ? 'Wedding Photographer Cluj-Napoca | Janos Hada Photography'
            : 'Fotograf Nuntă Cluj-Napoca | Janos Hada Photography'
          }
        </title>
        <meta 
          name="description" 
          content={language === 'en'
            ? 'Documentary wedding & event photographer in Cluj-Napoca. Real moments, natural light, limited availability. Check your date now.'
            : 'Fotograf de nuntă și evenimente în Cluj-Napoca. Stil documentar, momente reale, disponibilitate limitată. Verifică data.'
          }
        />
        <link rel="canonical" href="https://janoshada.com" />
      </Helmet>

      <Header />
      
      <main>
        <HeroSection />
        
        <PortfolioSection showFilters={false} limit={4} />
        
        <AboutSection />
        
        <ServicesSection />
        
        <TestimonialsSection />
        
        <FAQSection />
        
        <ContactForm />
      </main>

      <Footer />
    </>
  );
};

export default Index;
