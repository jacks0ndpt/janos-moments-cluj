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
            ? 'Janos Hada Photography | Wedding & Event Photography in Cluj-Napoca'
            : 'Janos Hada Photography | Fotografie de Nuntă & Evenimente în Cluj-Napoca'
          }
        </title>
        <meta 
          name="description" 
          content={language === 'en'
            ? 'Documentary wedding and event photography in Cluj-Napoca, Transylvania. Real moments, honest emotions, natural light. Book your wedding photographer today.'
            : 'Fotografie documentară de nuntă și evenimente în Cluj-Napoca, Transilvania. Momente reale, emoții autentice, lumină naturală. Rezervă-ți fotograful de nuntă.'
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
