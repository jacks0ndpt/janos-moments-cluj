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
    "name": "Jimmy Hada Photography",
    "description": language === 'ro' 
      ? "Fotograf documentar de nuntă și evenimente din Cluj-Napoca."
      : "Documentary wedding & event photographer based in Cluj-Napoca.",
    "url": "https://jimmyhada.com",
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
          {language === 'ro' 
            ? 'Fotograf Nuntă Cluj-Napoca | Jimmy Hada Photography'
            : 'Wedding Photographer Cluj-Napoca | Jimmy Hada Photography'
          }
        </title>
        <meta 
          name="description" 
          content={language === 'ro'
            ? 'Fotograf de nuntă și evenimente în Cluj-Napoca. Stil documentar, momente reale, disponibilitate limitată. Verifică data.'
            : 'Documentary wedding & event photographer in Cluj-Napoca. Real moments, natural light, limited availability. Check your date now.'
          }
        />
        <meta property="og:locale" content={language === 'ro' ? 'ro_RO' : 'en_US'} />
        <link rel="canonical" href="https://jimmyhada.com" />
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
        
        {/* <TestimonialsSection /> */}
        
        <FAQSection />
        
        <ContactForm />
        
        <LocalTrustSection />
      </main>

      <Footer />
    </>
  );
};

export default Index;
