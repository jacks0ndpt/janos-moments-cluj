import { Helmet } from 'react-helmet-async';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ServicesSection from '@/components/sections/ServicesSection';
import FAQSection from '@/components/sections/FAQSection';
import ContactForm from '@/components/sections/ContactForm';

const Services = () => {
  const { language } = useLanguage();

  return (
    <>
      <Helmet>
        <title>
          {language === 'en' 
            ? 'Wedding Photography Pricing | Cluj-Napoca'
            : 'Prețuri Fotograf Nuntă | Cluj-Napoca'
          }
        </title>
        <meta 
          name="description" 
          content={language === 'en'
            ? 'Wedding photography packages in Cluj-Napoca. Transparent pricing, documentary coverage, natural style. Request full details.'
            : 'Pachete de fotografiere nuntă în Cluj-Napoca. Prețuri transparente, stil documentar. Solicită oferta completă.'
          }
        />
      </Helmet>

      <Header />
      
      <main className="min-h-screen">
        <ServicesSection isFullPage={true} />
        <FAQSection isFullPage={true} />
        <ContactForm />
      </main>

      <Footer />
    </>
  );
};

export default Services;
