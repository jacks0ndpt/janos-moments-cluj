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
import LocalTrustSection from '@/components/sections/LocalTrustSection';

const Index = () => {
  const { language } = useLanguage();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Photographer",
    "name": "Janos Hada Photography",
    "description": language === 'en' 
      ? "Documentary wedding & event photographer based in Cluj-Napoca."
      : "Fotograf documentar de nuntă și evenimente din Cluj-Napoca.",
    "url": "https://janoshada.com",
    "areaServed": {
      "@type": "Country",
      "name": "Romania"
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Cluj-Napoca",
      "addressCountry": "RO"
    },
    "sameAs": []
  };

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
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
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
        
        <LocalTrustSection />
      </main>

      <Footer />
    </>
  );
};

export default Index;
